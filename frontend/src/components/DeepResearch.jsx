import { asText } from "../format";

export default function DeepResearch({ report }) {
  if (!report) return <p className="notice">Deep research results are not available.</p>;
  const synthesis = report.synthesis || {};
  const topicResults = report.topic_results || {};
  return (
    <div className="stack">
      <h3>Deep Research</h3>
      <p className="lede">{synthesis.synthesis_summary}</p>
      {synthesis.implications_for_main_query && (
        <section>
          <h4>Implications</h4>
          <p>{synthesis.implications_for_main_query}</p>
        </section>
      )}
      {Array.isArray(synthesis.cross_topic_insights) && (
        <section>
          <h4>Cross-topic insights</h4>
          <ul>
            {synthesis.cross_topic_insights.map((item, index) => (
              <li key={index}>{asText(item)}</li>
            ))}
          </ul>
        </section>
      )}
      {Array.isArray(synthesis.recommendations) && synthesis.recommendations.length > 0 && (
        <section>
          <h4>Recommendations</h4>
          <ul>
            {synthesis.recommendations.map((item, index) => (
              <li key={index}>
                {asText(item)}
                {item && Array.isArray(item.supporting_topics) && item.supporting_topics.length > 0 && (
                  <span className="muted"> — {item.supporting_topics.join(", ")}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {Object.entries(topicResults).map(([topic, data]) => {
        const insights = data.specialized_insights || {};
        const sources = data.research_data?.ranking?.ranked_sources || [];
        return (
          <details key={topic} className="panel" open>
            <summary>{topic}</summary>
            {insights.technical_details && <p>{insights.technical_details}</p>}
            {insights.integration && <p><strong>Integration.</strong> {insights.integration}</p>}
            {Array.isArray(insights.specialized_insights) && (
              <ul>
                {insights.specialized_insights.map((item, index) => (
                  <li key={index}>
                    <strong>{asText(item)}</strong>
                    {item.explanation && <span> — {item.explanation}</span>}
                  </li>
                ))}
              </ul>
            )}
            {sources.slice(0, 3).map((source) => (
              <p key={source.url || source.title}>
                <a href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}</a>
              </p>
            ))}
          </details>
        );
      })}
    </div>
  );
}
