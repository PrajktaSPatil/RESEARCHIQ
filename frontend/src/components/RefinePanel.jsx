import { useState } from "react";

export default function RefinePanel({ disabled, onFeedback, onDeep, onReset }) {
  const [feedback, setFeedback] = useState("");
  const [topics, setTopics] = useState("");

  return (
    <section className="refine">
      <h2>Refine your research</h2>
      <div className="refine-grid">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!feedback.trim()) return;
            onFeedback(feedback.trim());
            setFeedback("");
          }}
        >
          <label htmlFor="feedback">Provide feedback to improve the research</label>
          <textarea
            id="feedback"
            value={feedback}
            placeholder="Enter your feedback here..."
            onChange={(event) => setFeedback(event.target.value)}
            disabled={disabled}
          />
          <button type="submit" disabled={disabled || !feedback.trim()}>Submit Feedback</button>
        </form>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = topics.split(",").map((topic) => topic.trim()).filter(Boolean);
            if (parsed.length === 0) return;
            onDeep(parsed);
            setTopics("");
          }}
        >
          <label htmlFor="deep-topics">Topics for deep research, comma-separated</label>
          <input
            id="deep-topics"
            value={topics}
            placeholder="e.g., solar panels, urban planning, energy storage"
            onChange={(event) => setTopics(event.target.value)}
            disabled={disabled}
          />
          <button type="submit" disabled={disabled || !topics.trim()}>Deep Research</button>
        </form>
        <div className="reset-card">
          <p>Clear the current report and saved history, then start a new topic.</p>
          <button type="button" className="danger" onClick={onReset} disabled={disabled}>
            New Research
          </button>
        </div>
      </div>
    </section>
  );
}
