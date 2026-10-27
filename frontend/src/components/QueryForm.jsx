export default function QueryForm({ query, onQueryChange, onSubmit, disabled }) {
  return (
    <form
      className="query-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="research-query">Enter your research query</label>
      <div className="query-row">
        <input
          id="research-query"
          value={query}
          placeholder="e.g., Renewable energy for urban areas"
          onChange={(event) => onQueryChange(event.target.value)}
          disabled={disabled}
        />
        <button type="submit" className="primary" disabled={disabled || !query.trim()}>
          Start Research
        </button>
      </div>
    </form>
  );
}
