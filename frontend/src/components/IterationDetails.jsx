import { asText } from "../format";

function BulletList({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div>
      <h5>{title}</h5>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{asText(item)}</li>
        ))}
      </ul>
    </div>
  );
}

export default function IterationDetails({ cycles }) {
  if (!Array.isArray(cycles) || cycles.length === 0) {
    return <p className="notice">Iteration information is not available.</p>;
  }
  return (
    <div className="stack">
      <h3>Research Iterations</h3>
      {cycles.map((cycle, index) => {
        const reflection = cycle.reflection || {};
        return (
          <details key={cycle.cycle || index} open={index === 0} className="panel">
            <summary>Iteration {index + 1}</summary>
            <p><strong>Hypothesis.</strong> {cycle.hypothesis || "N/A"}</p>
            <h5>Analysis</h5>
            {reflection.analysis ? <p>{reflection.analysis}</p> : <p className="notice">Analysis information is not available.</p>}
            <BulletList title="Key Concepts" items={reflection.key_concepts} />
            {!reflection.key_concepts && <p className="notice">Key concepts are not available.</p>}
            <BulletList title="Emerging Trends" items={reflection.trends} />
            <BulletList title="Research Gaps" items={reflection.gaps} />
          </details>
        );
      })}
    </div>
  );
}
