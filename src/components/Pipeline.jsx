const STEPS = [["applied", "Applied"], ["viewed", "Reviewed"], ["shortlisted", "Shortlisted"], ["exam_scheduled", "Exam"]];
const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

function Pipeline({ app }) {
  const at = Object.fromEntries((app.history || []).map((h) => [h.status, h.at]));
  const reached = STEPS.filter(([s]) => at[s]).length;
  return (
    <ol className="pipeline">
      {STEPS.map(([s, label], i) => (
        <li key={s} className={i < reached ? "done" : ""}>
          <b>{label}</b>
          <small>{at[s] ? fmt(at[s]) : "—"}</small>
        </li>
      ))}
      {app.status === "not_shortlisted" && <li className="rej"><b>Not shortlisted</b><small>{fmt(at.not_shortlisted)}</small></li>}
    </ol>
  );
}
export default Pipeline;
