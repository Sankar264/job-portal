import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { CompanyMark } from "../components/JobCard";
import MatchRing from "../components/MatchRing";
import Toast from "../components/Toast";
import ApplyModal from "../components/ApplyModal";
import ApplicationStatus from "../components/ApplicationStatus";
import { getMyApplications, getResume } from "../services/resumeService";
import { detectSkills, matchJob, jobSkills } from "../utils/resumeAnalysis";

const CITY = { hyderabad: [17.385, 78.4867], bengaluru: [12.9716, 77.5946], bangalore: [12.9716, 77.5946], chennai: [13.0827, 80.2707], mumbai: [19.076, 72.8777], delhi: [28.6139, 77.209], pune: [18.5204, 73.8567] };

// Culture tile: employer can set job.videoUrl (YouTube or mp4) and job.photos[]
function Media({ job }) {
  const yt = job.videoUrl?.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return (
    <div className="tile s2">
      <h4>Culture & team</h4>
      {yt ? <iframe title="Culture reel" src={`https://www.youtube.com/embed/${yt[1]}`} allowFullScreen />
        : job.videoUrl ? <video src={job.videoUrl} controls />
        : null}
      {job.photos?.length > 0 && <div className="photos">{job.photos.slice(0, 3).map((p) => <img key={p} src={p} alt="Team" />)}</div>}
      {!job.videoUrl && !job.photos?.length && <p className="muted">{job.company} has not added a culture reel or team photos yet.</p>}
    </div>
  );
}

function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const isSeeker = user?.role === "seeker";
  const [job, setJob] = useState(null);
  const [resume, setResume] = useState(null);
  const [app, setApp] = useState(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({ msg: "", kind: "ok" });

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data)).catch(console.log);
    if (isSeeker) {
      getResume(user.id).then(setResume).catch(() => {});
      getMyApplications(user.id).then((a) => setApp(a.find((x) => String(x.jobId) === String(id)) || null)).catch(() => {});
    }
  }, [id]);

  if (!job) return <p className="empty">Loading role…</p>;
  const match = resume ? matchJob(detectSkills(resume.text), job) : null;
  const c = CITY[job.location.toLowerCase()];
  const map = c && `https://www.openstreetmap.org/export/embed.html?bbox=${c[1] - 0.06}%2C${c[0] - 0.04}%2C${c[1] + 0.06}%2C${c[0] + 0.04}&layer=mapnik&marker=${c[0]}%2C${c[1]}`;

  return (
    <>
      <Toast {...toast} onDone={() => setToast({ msg: "", kind: "ok" })} />
      {open && <ApplyModal job={job} user={user} resume={resume} onClose={() => setOpen(false)}
        onDone={(a, r) => { setApp(a); setResume(r); setOpen(false); setToast({ msg: "Application sent.", kind: "ok" }); }} />}
      <Link to="/jobs" className="back">Back to all roles</Link>
      <div className="bento-grid">
        <div className="tile s2 hero">
          <CompanyMark name={job.company} size="lg" />
          <h1>{job.title}</h1>
          <p className="muted">{job.company} · {job.location} · {job.type}</p>
          {isSeeker && !app && <button className="add-btn apply" onClick={() => setOpen(true)}>Apply</button>}
          {!user && <Link className="add-btn apply" to="/login">Log in to apply</Link>}
        </div>
        <div className="tile"><h4>Salary</h4><p className="big">{job.salary}<small> LPA</small></p></div>
        <div className="tile">
          <h4>{match ? "Match with your stack" : "Your match"}</h4>
          {match ? <MatchRing pct={match.pct} size={90} /> : <p className="muted">{isSeeker ? "Add a resume to see it." : "Log in as a job seeker."}</p>}
        </div>

        <div className="tile s2"><h4>Tech stack</h4>
          <div className="chips">{jobSkills(job).map((s) => <span key={s} className={`chip ${match?.missing.includes(s) ? "miss" : ""}`}>{s}</span>)}</div>
          {match?.missing.length > 0 && <p className="muted">Red = not on your resume yet.</p>}
        </div>
        <div className="tile s2"><h4>Perks</h4>
          {job.perks?.length ? <ul className="perks" style={{ display: "flex" }}>{job.perks.map((p) => <li key={p}>{p}</li>)}</ul> : <p className="muted">No perks listed.</p>}
        </div>

        <Media job={job} />
        <div className="tile s2"><h4>Location preview</h4>
          {map ? <iframe title="Map" loading="lazy" src={map} /> : <p className="muted">{job.location} role, no office map.</p>}
        </div>

        <div className="tile s4"><h4>About the role</h4><p>{job.description}</p></div>
        {isSeeker && app && <div className="tile s4"><h4>Your application</h4><ApplicationStatus app={app} /></div>}
      </div>
    </>
  );
}
export default JobDetails;
