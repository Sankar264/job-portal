import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getResume, getMyApplications, applyToJob } from "../services/resumeService";
import { detectSkills, matchJob, jobSkills } from "../utils/resumeAnalysis";
import MatchRing from "../components/MatchRing";
import Toast from "../components/Toast";

// Swipe right = one-tap apply with your saved resume, left = skip
function SwipeCard({ job, match, x = 0, back, handlers }) {
  return (
    <div className={`swipe ${back ? "back" : ""}`} style={back ? undefined : { transform: `translateX(${x}px) rotate(${x / 18}deg)` }} {...handlers}>
      {!back && <><span className="stamp yes" style={{ opacity: Math.min(1, x / 110) }}>APPLY</span><span className="stamp no" style={{ opacity: Math.min(1, -x / 110) }}>SKIP</span></>}
      <MatchRing pct={match?.pct} size={72} />
      <h2>{job.title}</h2>
      <p className="muted">{job.company} · {job.location} · {job.type}</p>
      <p className="salary"><strong style={{ fontSize: 34 }}>{job.salary}</strong> LPA</p>
      <div className="chips">{jobSkills(job).map((s) => <span className="chip" key={s}>{s}</span>)}</div>
      {job.perks?.length > 0 && <ul className="perks" style={{ display: "flex" }}>{job.perks.map((p) => <li key={p}>{p}</li>)}</ul>}
      <p className="muted">{job.description}</p>
    </div>
  );
}

function Swipe() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [resume, setResume] = useState(null);
  const [x, setX] = useState(0);
  const [toast, setToast] = useState({ msg: "", kind: "ok" });
  const start = useRef(null);

  useEffect(() => {
    Promise.all([api.get("/jobs"), getMyApplications(user.id), getResume(user.id)])
      .then(([j, a, r]) => {
        const done = new Set(a.map((z) => String(z.jobId)));
        setJobs(j.data.filter((z) => !done.has(String(z.id)))); setResume(r);
      }).catch(() => setJobs([]));
  }, []);

  const skills = resume ? detectSkills(resume.text) : null;
  const m = (job) => (skills && job ? matchJob(skills, job) : null);
  const job = jobs?.[0];

  async function decide(apply) {
    setX(0);
    if (!job) return;
    try {
      if (apply) {
        if (!resume) return setToast({ msg: "Save a resume on the AI dashboard first.", kind: "err" });
        await applyToJob(user.id, job.id, resume);
        setToast({ msg: `Applied to ${job.title}`, kind: "ok" });
      }
      setJobs((js) => js.slice(1));
    } catch { setToast({ msg: "Backend not reachable.", kind: "err" }); }
  }

  const handlers = {
    onPointerDown: (e) => { start.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); },
    onPointerMove: (e) => start.current !== null && setX(e.clientX - start.current),
    onPointerUp: () => { const d = x; start.current = null; d > 110 ? decide(true) : d < -110 ? decide(false) : setX(0); },
  };

  if (!jobs) return <p className="empty">Loading roles…</p>;
  return (
    <div className="swipe-wrap">
      <Toast {...toast} onDone={() => setToast({ msg: "", kind: "ok" })} />
      <h1>Swipe to apply</h1>
      {!resume && <p className="muted">No resume yet. <Link to="/ai-dashboard">Add one</Link> to apply with one tap.</p>}
      {job ? (
        <>
          <div className="deck">
            {jobs[1] && <SwipeCard job={jobs[1]} match={m(jobs[1])} back />}
            <SwipeCard key={job.id} job={job} match={m(job)} x={x} handlers={handlers} />
          </div>
          <div className="swipe-btns">
            <button onClick={() => decide(false)} aria-label="Skip">✕</button>
            <button className="go" onClick={() => decide(true)} aria-label="Apply">✓</button>
          </div>
        </>
      ) : <p className="empty">You have gone through every open role. <Link to="/ai-dashboard">See your applications</Link></p>}
    </div>
  );
}
export default Swipe;
