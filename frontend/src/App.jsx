import { useEffect, useState } from "react";
import {
  getHistory,
  getJob,
  resetResearch,
  startDeep,
  startFeedback,
  startResearch,
} from "./api";
import { relatedHistory } from "./format";
import HistorySidebar from "./components/HistorySidebar";
import QueryForm from "./components/QueryForm";
import RelatedTopics from "./components/RelatedTopics";
import ProgressStatus from "./components/ProgressStatus";
import ResultsTabs from "./components/ResultsTabs";
import RefinePanel from "./components/RefinePanel";

export default function App() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState(null);
  const [job, setJob] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshHistory() {
    const data = await getHistory();
    setHistory(Array.isArray(data.history) ? data.history : []);
    if (Array.isArray(data.missing_keys) && data.missing_keys.length > 0) {
      setNotice(`Add ${data.missing_keys.join(" and ")} to the .env file before starting research.`);
    } else if (data.engine_error) {
      setNotice(data.engine_error);
    } else {
      setNotice("");
    }
  }

  useEffect(() => {
    refreshHistory().catch((err) => setNotice(err.message));
  }, []);

  useEffect(() => {
    if (!jobId) return undefined;
    let stopped = false;

    async function poll() {
      try {
        const data = await getJob(jobId);
        if (stopped) return;
        setJob(data);
        if (data.status === "done") {
          setResults(data.result);
          setJobId(null);
          setError("");
          refreshHistory().catch(() => {});
        } else if (data.status === "error") {
          setResults(data.result || null);
          setError(data.error || "Research failed");
          setJobId(null);
        }
      } catch (err) {
        if (!stopped) {
          setError(err.message);
          setJobId(null);
        }
      }
    }

    poll();
    const timer = setInterval(poll, 1500);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [jobId]);

  async function launch(request) {
    setError("");
    setResults(null);
    setJob({ status: "running", progress: 0.02, step: "Starting research" });
    try {
      const data = await request();
      setJob(data);
      setJobId(data.job_id);
    } catch (err) {
      setJob(null);
      setError(err.message);
    }
  }

  const running = Boolean(jobId);
  const duplicateKeyWarning = Boolean(notice && error && error.includes("GROQ_API_KEY"));

  return (
    <div className="shell">
      <HistorySidebar history={history} onSelect={(item) => setQuery(item.query || "")} />
      <main className="workspace">
        <header className="intro">
          <p className="eyebrow">Coalition of research agents</p>
          <h2>An assistant that keeps what it learns.</h2>
          <p>
            Enter a question. The desk searches, ranks sources, and refines the answer across several passes.
          </p>
        </header>

        {notice && <p className="banner">{notice}</p>}
        {error && !duplicateKeyWarning && <p className="banner error">{error}</p>}

        <QueryForm
          query={query}
          onQueryChange={setQuery}
          disabled={running}
          onSubmit={() => launch(() => startResearch(query.trim()))}
        />
        <RelatedTopics
          items={relatedHistory(query, history)}
          onSelect={(item) => setQuery(item.query || "")}
        />
        <ProgressStatus job={running ? job : null} />

        {!results && !running && (
          <section className="empty-report">
            <h3>What you get back</h3>
            <ol>
              <li>A final report with findings, solutions, and next steps</li>
              <li>Each research pass, with the hypothesis and gaps</li>
              <li>Ranked sources and a credibility breakdown</li>
              <li>The raw JSON, if you want to inspect the engine</li>
            </ol>
          </section>
        )}

        {results && !results.error && <ResultsTabs key={job?.job_id || query} results={results} />}
        {results?.error && <p className="banner error">{results.error}</p>}

        {results && !results.error && (
          <RefinePanel
            disabled={running}
            onFeedback={(feedback) => launch(() => startFeedback(query.trim(), feedback))}
            onDeep={(topics) => launch(() => startDeep(query.trim(), topics))}
            onReset={async () => {
              if (!window.confirm("Clear the current report and saved research history?")) return;
              try {
                await resetResearch();
                setResults(null);
                setQuery("");
                setError("");
                await refreshHistory();
              } catch (err) {
                setError(err.message);
              }
            }}
          />
        )}

        <footer>Built with React and ResearchIQ</footer>
      </main>
    </div>
  );
}
