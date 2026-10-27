export default function ProgressStatus({ job }) {
  if (!job || job.status === "done") return null;
  const progress = Math.round((job.progress || 0) * 100);
  return (
    <section className="progress-panel" aria-live="polite">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p>
        <strong>{job.step || "Working"}</strong>
        <span>{progress}%</span>
      </p>
    </section>
  );
}
