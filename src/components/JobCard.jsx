import { Link } from "react-router-dom";
import MatchRing from "./MatchRing";
import { jobSkills } from "../utils/resumeAnalysis";

const TINTS = ["#E4DEFF", "#FFE9A8", "#D5F0E4", "#FFD9D2", "#D6E6FF"];

export function CompanyMark({ name = "?", size = "" }) {
  const tint = TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  return <span className={`mark ${size}`} style={{ background: tint, color: "#1b1340" }}>{name.slice(0, 2)}</span>;
}

// Bento card: salary, tech stack, perks and match ring at a glance
function JobCard({ job, isSaved, onToggleSave, onDelete, showEdit, match }) {
  const stack = jobSkills(job).slice(0, 4);
  return (
    <article className="job bento">
      <div className="bento-top">
        <CompanyMark name={job.company} />
        <span className="badge">{job.type}</span>
        <MatchRing pct={match?.pct} />
      </div>
      <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
      <p className="job-meta"><span>{job.company}</span> · <span>{job.location}</span></p>
      <p className="salary"><strong>{job.salary}</strong> LPA</p>
      {stack.length > 0 && <div className="chips">{stack.map((s) => <span className="chip" key={s}>{s}</span>)}</div>}
      {job.perks?.length > 0 && <ul className="perks">{job.perks.map((p) => <li key={p}>{p}</li>)}</ul>}
      <div className="card-actions">
        {onToggleSave && <button className={`save-btn ${isSaved ? "on" : ""}`} onClick={() => onToggleSave(job.id)}>{isSaved ? "Saved" : "Save"}</button>}
        {showEdit && <Link className="view-btn" to={`/applicants/${job.id}`}>Applicants</Link>}
        {showEdit && <Link className="edit-btn" to={`/edit-job/${job.id}`}>Edit</Link>}
        {onDelete && <button className="delete-btn" onClick={() => onDelete(job.id)}>Delete</button>}
        <Link className="view-btn" to={`/jobs/${job.id}`}>View role</Link>
      </div>
    </article>
  );
}
export default JobCard;
