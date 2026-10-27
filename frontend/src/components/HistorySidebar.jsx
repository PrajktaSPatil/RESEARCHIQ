import { formatWhen } from "../format";

export default function HistorySidebar({ history, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <p className="eyebrow">Research desk</p>
        <h1>ResearchIQ</h1>
      </div>
      <h2>Research history</h2>
      {history.length === 0 ? (
        <p className="sidebar-empty">No research history available yet.</p>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <details key={`${item.timestamp || "session"}-${index}`} open={index === 0}>
              <summary>{item.query || "Untitled session"}</summary>
              <p className="when">{formatWhen(item.timestamp)}</p>
              {Array.isArray(item.key_concepts) && item.key_concepts.length > 0 && (
                <ul className="concept-list">
                  {item.key_concepts.slice(0, 6).map((concept) => (
                    <li key={concept}>{concept}</li>
                  ))}
                </ul>
              )}
              {Array.isArray(item.top_sources) && item.top_sources[0] && (
                <p className="source-line">{item.top_sources[0].title}</p>
              )}
              {item.feedback && <p className="feedback-line">{item.feedback}</p>}
              <button type="button" className="text-button" onClick={() => onSelect(item)}>
                Use this query
              </button>
            </details>
          ))}
        </div>
      )}
    </aside>
  );
}
