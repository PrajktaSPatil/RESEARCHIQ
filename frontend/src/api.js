const API = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    const message = typeof detail === "string" ? detail : "Request failed";
    throw new Error(message);
  }
  return data;
}

export function getHistory() {
  return request("/history");
}

export function getJob(jobId) {
  return request(`/research/${jobId}`);
}

export function startResearch(query) {
  return request("/research", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function startFeedback(query, feedback) {
  return request("/research/feedback", {
    method: "POST",
    body: JSON.stringify({ query, feedback }),
  });
}

export function startDeep(query, topics) {
  return request("/research/deep", {
    method: "POST",
    body: JSON.stringify({ query, topics }),
  });
}

export function resetResearch() {
  return request("/reset", { method: "POST" });
}
