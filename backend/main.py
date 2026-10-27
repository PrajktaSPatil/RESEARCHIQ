"""FastAPI wrapper around SupervisorAgent for the React client."""

import asyncio
import json
import os
import sys
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

def _clean_setting(name: str) -> None:
    value = os.getenv(name)
    if value is None:
        return
    cleaned = value.strip().strip('"').strip("'")
    if cleaned:
        os.environ[name] = cleaned
    else:
        os.environ.pop(name, None)


def _pin_data_file(name: str, default_name: str) -> None:
    value = os.getenv(name, default_name)
    path = Path(value)
    if not path.is_absolute():
        path = ROOT / path
    os.environ[name] = str(path)


def _apply_env() -> None:
    load_dotenv(ROOT / ".env", override=True)
    for name in ("GROQ_API_KEY", "TAVILY_API_KEY", "MODEL_NAME", "TEMPERATURE"):
        _clean_setting(name)
    _pin_data_file("HISTORY_FILE", "research_history.json")
    _pin_data_file("FEEDBACK_FILE", "feedback_history.json")


_apply_env()

from stools import SupervisorAgent

agent: Optional[SupervisorAgent] = None
init_error: Optional[str] = None
busy = False
jobs: Dict[str, Dict[str, Any]] = {}


def _missing_keys() -> List[str]:
    return [name for name in ("GROQ_API_KEY", "TAVILY_API_KEY") if not os.getenv(name)]


def _ensure_agent() -> None:
    """Reload .env and build the research engine once both keys are present."""
    global agent, init_error
    _apply_env()
    if agent is not None or _missing_keys():
        return
    try:
        agent = SupervisorAgent()
        init_error = None
    except Exception as exc:
        agent = None
        init_error = str(exc)


def _json_safe(value: Any) -> Any:
    return json.loads(json.dumps(value, default=str))


def _serialize_item(item: Any) -> Dict[str, Any]:
    if isinstance(item, dict):
        return item
    if hasattr(item, "__dict__"):
        return _json_safe(dict(item.__dict__))
    return {"query": str(item)}


def _read_history_file() -> List[Dict[str, Any]]:
    history_path = Path(os.environ["HISTORY_FILE"])
    if not history_path.exists():
        return []
    try:
        with history_path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
        return data if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def _history_items() -> List[Dict[str, Any]]:
    if agent is None:
        return _read_history_file()
    return [_serialize_item(item) for item in agent.memory_store]


@asynccontextmanager
async def lifespan(_: FastAPI):
    _ensure_agent()
    yield


app = FastAPI(title="ResearchIQ", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str = Field(min_length=1)


class FeedbackRequest(BaseModel):
    query: str = Field(min_length=1)
    feedback: str = Field(min_length=1)


class DeepRequest(BaseModel):
    query: str = Field(min_length=1)
    topics: List[str] = Field(min_length=1)


def _trim_jobs() -> None:
    finished = [job_id for job_id, job in jobs.items() if job["status"] != "running"]
    overflow = len(jobs) - 20
    for job_id in finished:
        if overflow <= 0:
            break
        jobs.pop(job_id, None)
        overflow -= 1


async def _run_job(
    job_id: str,
    query: str,
    feedback: Optional[str],
    deep_research: Optional[List[str]],
) -> None:
    global busy

    def on_progress(progress: float, step: str) -> None:
        jobs[job_id]["progress"] = max(0.0, min(float(progress), 1.0))
        jobs[job_id]["step"] = step

    try:
        assert agent is not None
        result = await agent.process_query(
            query,
            feedback=feedback,
            deep_research=deep_research,
            on_progress=on_progress,
        )
        result = _json_safe(result)
        failed = (
            isinstance(result, dict)
            and result.get("error")
            and "cycles" not in result
            and "deep_research" not in result
        )
        if failed:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = str(result.get("error"))
            jobs[job_id]["result"] = result
            jobs[job_id]["step"] = "Research failed"
        else:
            jobs[job_id]["status"] = "done"
            jobs[job_id]["result"] = result
            jobs[job_id]["progress"] = 1
            jobs[job_id]["step"] = "Research completed"
            jobs[job_id]["error"] = None
    except Exception as exc:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(exc)
        jobs[job_id]["step"] = "Research failed"
    finally:
        busy = False
        _trim_jobs()


def _start_job(
    query: str,
    feedback: Optional[str] = None,
    deep_research: Optional[List[str]] = None,
) -> Dict[str, Any]:
    global busy
    _ensure_agent()
    cleaned = query.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Enter a research query")
    missing = _missing_keys()
    if missing:
        raise HTTPException(
            status_code=503,
            detail=f"Add {', '.join(missing)} to the .env file before starting research",
        )
    if agent is None:
        raise HTTPException(
            status_code=503,
            detail=init_error or "Research engine is unavailable",
        )
    if busy:
        raise HTTPException(status_code=409, detail="A research job is already running")

    topics = None
    if deep_research is not None:
        topics = [topic.strip() for topic in deep_research if topic and topic.strip()]
        if not topics:
            raise HTTPException(status_code=400, detail="Enter at least one deep research topic")

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "job_id": job_id,
        "status": "running",
        "progress": 0.02,
        "step": "Starting research",
        "result": None,
        "error": None,
        "query": cleaned,
    }
    busy = True
    asyncio.create_task(_run_job(job_id, cleaned, feedback, topics))
    return jobs[job_id]


@app.get("/health")
def health() -> Dict[str, Any]:
    _ensure_agent()
    return {
        "ok": agent is not None and not _missing_keys(),
        "engine_error": init_error,
        "missing_keys": _missing_keys(),
    }


@app.get("/history")
def history() -> Dict[str, Any]:
    _ensure_agent()
    return {
        "history": _history_items(),
        "engine_error": init_error,
        "missing_keys": _missing_keys(),
    }


@app.get("/research/{job_id}")
def research_status(job_id: str) -> Dict[str, Any]:
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Research job not found")
    return job


@app.post("/research")
async def start_research(body: QueryRequest) -> Dict[str, Any]:
    return _start_job(body.query)


@app.post("/research/feedback")
async def start_feedback(body: FeedbackRequest) -> Dict[str, Any]:
    return _start_job(body.query, feedback=body.feedback.strip())


@app.post("/research/deep")
async def start_deep(body: DeepRequest) -> Dict[str, Any]:
    return _start_job(body.query, deep_research=body.topics)


@app.post("/reset")
def reset_research() -> Dict[str, bool]:
    global agent, init_error
    _ensure_agent()
    if busy:
        raise HTTPException(status_code=409, detail="Wait for the current research job to finish")

    feedback_path = Path(os.environ["FEEDBACK_FILE"])
    history_path = Path(os.environ["HISTORY_FILE"])
    try:
        if agent is not None:
            agent.reset()
        else:
            history_path.write_text("[]", encoding="utf-8")
        feedback_path.write_text("[]", encoding="utf-8")
        agent = SupervisorAgent()
        init_error = None
    except Exception as exc:
        init_error = str(exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {"ok": True}
