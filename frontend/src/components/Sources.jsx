function ScoreBars({ breakdown }) {
  if (!breakdown || typeof breakdown !== "object") return null;
  const entries = Object.entries(breakdown);
  if (entries.length === 0) return null;
  return (
    <div className="score-grid">
      {entries.map(([factor, score]) => {
        const value = Number(score) || 0;
        const width = Math.max(0, Math.min(value, 1)) * 100;
        return (
          <div key={factor}>
            <span>{factor.replaceAll("_", " ")}</span>
            <div className="mini-track">
              <div style={{ width: `${width}%` }} />
            </div>
            <strong>{value.toFixed(2)}</strong>
          </div>
        );
      })}
    </div>
  );
}

export default function Sources({ cycles }) {
  if (!Array.isArray(cycles) || cycles.length === 0) {
    return <p className="notice">Iteration information is not available.</p>;
  }
  return (
    <div className="stack">
      <h3>Sources</h3>
      {cycles.map((cycle, index) => {
        const ranked = cycle.ranking?.ranked_sources || [];
        return (
          <section key={cycle.cycle || index}>
            <h4>Iteration {index + 1} sources</h4>
            {ranked.length === 0 && <p className="notice">No ranked sources available for this iteration.</p>}
            {ranked.slice(0, 5).map((source, sourceIndex) => (
              <details key={`${source.url || source.title}-${sourceIndex}`} className="panel">
                <summary>
                  {sourceIndex + 1}. {source.title || "Untitled"}
                  <em>Score {Number(source.overall_score || 0).toFixed(2)}</em>
                </summary>
                {source.url && (
                  <p>
                    <a href={source.url} target="_blank" rel="noreferrer">{source.url}</a>
                  </p>
                )}
                <p><strong>Type.</strong> {String(source.source_type || "Unknown")}</p>
                <p><strong>Publication date.</strong> {source.pub_date || "Unknown"}</p>
                <p><strong>Citation count.</strong> {source.citation_count || 0}</p>
                <ScoreBars breakdown={source.score_breakdown} />
                {source.content && (
                  <blockquote>{String(source.content).slice(0, 300)}...</blockquote>
                )}
                {Array.isArray(source.key_insights) && source.key_insights.length > 0 && (
                  <ul>
                    {source.key_insights.map((insight) => (
                      <li key={insight}>{insight}</li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </section>
        );
      })}
    </div>
  );
}
