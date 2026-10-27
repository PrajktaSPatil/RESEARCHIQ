export default function RelatedTopics({ items, onSelect }) {
  if (!items.length) return null;
  return (
    <section className="related">
      <h2>Related to your previous research</h2>
      <div className="related-grid">
        {items.map((item, index) => {
          const topSource = Array.isArray(item.top_sources) ? item.top_sources[0] : null;
          return (
            <button
              type="button"
              className="related-card"
              key={`${item.query}-${index}`}
              onClick={() => onSelect(item)}
            >
              <strong>{item.query}</strong>
              {topSource?.title && <span>{topSource.title}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
