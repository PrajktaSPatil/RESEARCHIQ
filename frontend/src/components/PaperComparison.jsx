import { asText } from "../format";

function statedText(value) {
  const text = asText(value).trim();
  if (!text || /not reported|not stated|do not state|did not report|not assessed|sources do not/i.test(text)) {
    return "";
  }
  return text;
}

const COLUMNS = [
  ["methodology", "Methodology"],
  ["dataset", "Dataset"],
  ["metrics", "Evaluation metrics"],
  ["key_result", "Key result"],
  ["limitation", "Limitation"],
];

export default function PaperComparison({ comparison }) {
  const papers = Array.isArray(comparison?.papers) ? comparison.papers : [];
  const differences = Array.isArray(comparison?.differences) ? comparison.differences : [];

  if (papers.length === 0) {
    return <p className="notice">A paper comparison is not available for this result.</p>;
  }

  return (
    <div className="stack">
      <h3>Paper comparison</h3>
      <p className="lede">Each paper is lined up on the same factors so the differences can be read across one row.</p>
      <div className="compare-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Paper</th>
              {COLUMNS.map(([key, label]) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {papers.map((paper, index) => (
              <tr key={paper.url || paper.title || index}>
                <th scope="row">
                  {paper.url ? (
                    <a href={paper.url} target="_blank" rel="noreferrer">{paper.title || "Untitled"}</a>
                  ) : (
                    paper.title || "Untitled"
                  )}
                </th>
                {COLUMNS.map(([key]) => (
                  <td key={key}>{statedText(paper[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {differences.length > 0 && (
        <section>
          <h4>Differences at a glance</h4>
          <ul>
            {differences.map((item, index) => (
              <li key={index}>{asText(item)}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
