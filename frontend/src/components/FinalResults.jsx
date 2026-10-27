import { asText } from "../format";

function isMissing(value) {
  const text = asText(value).trim().toLowerCase();
  return !text || /not reported|not stated|do not state|did not report|not assessed|sources do not/.test(text);
}

function BulletList({ items }) {
  const visible = (Array.isArray(items) ? items : []).filter((item) => !isMissing(item));
  if (visible.length === 0) return null;
  return (
    <ul>
      {visible.map((item, index) => (
        <li key={index}>{asText(item)}</li>
      ))}
    </ul>
  );
}

function PaperField({ title, value }) {
  if (Array.isArray(value)) {
    if (value.every((item) => isMissing(item))) return null;
  } else if (isMissing(value)) {
    return null;
  }
  return (
    <section>
      <h4>{title}</h4>
      {Array.isArray(value) ? <BulletList items={value} /> : <p>{asText(value)}</p>}
    </section>
  );
}

export default function FinalResults({ metaReview }) {
  if (!metaReview) {
    return <p className="notice">Meta-review is not available.</p>;
  }
  const quality = metaReview.research_quality;
  const paper = metaReview.paper || {};
  return (
    <article className="report">
      <h3>Final Research Report</h3>
      {metaReview.paper && (
        <div className="paper-outline">
          <h3>Paper outline from existing work</h3>
          <PaperField title="Research Problem" value={paper.research_problem} />
          <PaperField title="Methodology" value={paper.methodology} />
          <PaperField title="Dataset" value={paper.dataset} />
          <PaperField title="Evaluation Metrics" value={paper.evaluation_metrics} />
          <PaperField title="Key Results" value={paper.key_results} />
          <PaperField title="Limitations" value={paper.limitations} />
          <PaperField title="Research Gap" value={paper.research_gap} />
        </div>
      )}
      <section>
        <h4>Research Evolution</h4>
        <p>{metaReview.evolution_summary || "No evolution summary available."}</p>
      </section>
      <section>
        <h4>Key Findings</h4>
        <BulletList items={metaReview.consistent_findings} />
      </section>
      <section>
        <h4>Best Solutions</h4>
        <BulletList items={metaReview.best_solutions} />
      </section>
      <section>
        <h4>Recommended Next Steps</h4>
        <BulletList items={metaReview.next_steps} />
      </section>
      {quality && (
        <section className="quality">
          <h4>Research quality</h4>
          {quality.coverage && <p><strong>Coverage.</strong> {quality.coverage}</p>}
          {quality.depth && <p><strong>Depth.</strong> {quality.depth}</p>}
          <BulletList items={quality.gaps} />
        </section>
      )}
    </article>
  );
}
