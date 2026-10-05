import Pipeline from "./Pipeline";
import { STATUS_LABEL } from "../utils/resumeAnalysis";

export function ExamCard({ exam }) {
  if (!exam) return null;
  const when = new Date(`${exam.date}T${exam.time || "00:00"}`).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
  return (
    <div className="exam-card">
      <b>Exam scheduled</b>
      <p>{when}</p>
      <p>{exam.mode}{exam.where ? ` · ${exam.where}` : ""}</p>
      {exam.notes && <p>{exam.notes}</p>}
    </div>
  );
}

const COLORS = ["#4ade80", "#fbbf24", "#60a5fa", "#f472b6", "#a78bfa"];

// Animated result banner: confetti + drawn tick when shortlisted, a gentle shake + cross when not
function Verdict({ status }) {
  if (status === "not_shortlisted")
    return (
      <div className="verdict no" role="status">
        <svg viewBox="0 0 54 54"><circle className="ring-c" cx="27" cy="27" r="21" /><path className="mark-x" d="M19 19l16 16M35 19L19 35" /></svg>
        <div><b>Not shortlisted this time</b><p>The employer chose to move forward with other candidates. Keep applying, your next role is out there.</p></div>
      </div>
    );
  if (status === "shortlisted" || status === "exam_scheduled")
    return (
      <div className="verdict yes" role="status">
        <span className="confetti" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => <i key={i} style={{ "--x": `${(i * 6 + 4) % 96}%`, "--d": `${(i % 5) * 0.12}s`, "--c": COLORS[i % 5] }} />)}
        </span>
        <svg viewBox="0 0 54 54"><circle className="ring-c" cx="27" cy="27" r="21" /><path className="tick" d="M16 28l8 8 14-16" /></svg>
        <div>
          <b>Congratulations, you are shortlisted!</b>
          <p>{status === "exam_scheduled" ? "Your exam is scheduled. Details are below." : "The employer will share your exam date soon."}</p>
        </div>
      </div>
    );
  return null;
}

function ApplicationStatus({ app }) {
  return (
    <div className="appstatus">
      <span className={`statusbadge s-${app.status}`}>{STATUS_LABEL[app.status] || app.status}</span>
      <Verdict status={app.status} />
      <Pipeline app={app} />
      <ExamCard exam={app.exam} />
    </div>
  );
}
export default ApplicationStatus;
