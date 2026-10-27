import { useState } from "react";
import FinalResults from "./FinalResults";
import IterationDetails from "./IterationDetails";
import Sources from "./Sources";
import RawData from "./RawData";
import DeepResearch from "./DeepResearch";
import PaperComparison from "./PaperComparison";

export default function ResultsTabs({ results }) {
  const deep = results?.deep_research;
  const hasCycles = Array.isArray(results?.cycles);
  const tabs = [
    deep
      ? { id: "deep", label: "Deep Research" }
      : { id: "final", label: "Final Results" },
    !deep && { id: "compare", label: "Compare" },
    hasCycles && { id: "iterations", label: "Iteration Details" },
    hasCycles && { id: "sources", label: "Sources" },
    { id: "raw", label: "Raw Data" },
  ].filter(Boolean);
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.some((tab) => tab.id === active) ? active : tabs[0].id;

  return (
    <section className="results">
      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={current === tab.id}
            className={current === tab.id ? "tab active" : "tab"}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        {current === "final" && <FinalResults metaReview={results.meta_review} />}
        {current === "compare" && <PaperComparison comparison={results.comparison} />}
        {current === "deep" && <DeepResearch report={deep} />}
        {current === "iterations" && <IterationDetails cycles={results.cycles} />}
        {current === "sources" && <Sources cycles={results.cycles} />}
        {current === "raw" && <RawData results={results} />}
      </div>
    </section>
  );
}
