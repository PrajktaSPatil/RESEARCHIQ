export default function RawData({ results }) {
  return (
    <div className="stack">
      <h3>Raw Data</h3>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
