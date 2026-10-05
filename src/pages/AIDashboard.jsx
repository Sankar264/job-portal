import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getResume, saveResume, getMyApplications } from "../services/resumeService";
import { atsScore, matchJob } from "../utils/resumeAnalysis";
import { pdfToText } from "../utils/pdfText";
import MatchBadge from "../components/MatchBadge";
import ApplicationStatus from "../components/ApplicationStatus";
import Toast from "../components/Toast";
import "./aidashboard.css";

// one isometric cube; "lit" brightens it when that stage has applications
function Cube({ color, lit }) {
  return (
    <svg viewBox="0 0 80 80" className={`cube ${lit ? "lit" : ""}`} style={{ "--c": color }} aria-hidden="true">
      <polygon points="40,6 74,24 40,42 6,24" className="top" />
      <polygon points="6,24 40,42 40,76 6,58" className="left" />
      <polygon points="74,24 40,42 40,76 74,58" className="right" />
    </svg>
  );
}

function Spark({ data }) {
  const max = Math.max(1, ...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 200},${46 - (v / max) * 40}`).join(" ");
  return (
    <svg viewBox="0 0 200 50" className="spark" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="url(#sg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <defs><linearGradient id="sg"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#c084fc" /></linearGradient></defs>
    </svg>
  );
}

function AIDashboard() {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [paste, setPaste] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ msg: "", kind: "ok" });
  const fileRef = useRef();

  useEffect(() => { load(); }, []);
  // pick up shortlist / exam updates from the employer
  useEffect(() => {
    const t = setInterval(() => getMyApplications(user.id).then(setApps).catch(() => {}), 15000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      const [r, j, a] = await Promise.all([getResume(user.id), api.get("/jobs"), getMyApplications(user.id)]);
      setResume(r); setJobs(j.data); setApps(a);
    } catch {
      setToast({ msg: "Backend not reachable. Run `npm run server` (port 3000).", kind: "err" });
    } finally { setLoading(false); }
  }

  async function store(text, fileName) {
    if (text.trim().length < 50) return setToast({ msg: "That looks too short to be a resume.", kind: "err" });
    setBusy(true);
    try {
      setResume(await saveResume(user.id, { text, fileName }));
      setPaste(false); setDraft("");
      setToast({ msg: "Resume saved.", kind: "ok" });
    } catch (e) {
      setToast({ msg: e.response ? `Save failed (server ${e.response.status}). Is "resumes" in db.json?` : "Backend not reachable. Run `npm run server`.", kind: "err" });
    } finally { setBusy(false); }
  }

  async function onFile(e) {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (f.type !== "application/pdf") return setToast({ msg: "Please choose a PDF file.", kind: "err" });
    try { store(await pdfToText(f), f.name); }
    catch { setToast({ msg: "Could not read that PDF. Try Paste text.", kind: "err" }); }
  }

  if (loading) return <div className="aid"><p className="aid-muted">Loading your dashboard…</p></div>;

  const analysis = resume ? atsScore(resume.text) : null;
  const skills = analysis ? analysis.skills : [];
  const count = (s) => apps.filter((a) =>
    s === "applied" ? true
    : s === "viewed" ? a.status !== "applied"
    : s === "shortlisted" ? ["shortlisted", "exam_scheduled"].includes(a.status)
    : a.status === "exam_scheduled").length;
  const jobOf = (id) => jobs.find((j) => String(j.id) === String(id));
  const appliedIds = new Set(apps.map((a) => String(a.jobId)));

  // applications per day, last 7 days
  const day = 864e5, now = Date.now();
  const week = Array.from({ length: 7 }, (_, i) =>
    apps.filter((a) => Math.floor((now - new Date(a.appliedAt)) / day) === 6 - i).length);
  const thisWeek = week.reduce((a, b) => a + b, 0);

  const latest = jobs
    .filter((j) => `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q.toLowerCase()))
    .map((job) => ({ job, match: resume ? matchJob(skills, job) : null }))
    .sort((a, b) => (b.match?.pct ?? -1) - (a.match?.pct ?? -1));

  return (
    <div className="aid">
      <Toast {...toast} onDone={() => setToast({ msg: "", kind: "ok" })} />
      <div className="aid-grid">

        <section className="card hero">
          <p className="hello">Welcome back, {user.name}</p>
          <h1>Find roles that fit<br />you, <span>faster.</span></h1>
          <label className="searchbar">
            <i>AI</i>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter jobs by title, company or city" />
            <Link to="/jobs">All jobs</Link>
          </label>
          <button className="pill" onClick={() => (resume ? setPaste(false) : fileRef.current.click())}>
            {resume ? `Personalised by ${resume.fileName || "your resume"}` : "Upload a resume to personalise this"}
          </button>
          <div className="lens" aria-hidden="true"><b /></div>
        </section>

        <section className="card apps">
          <h2>Applications</h2>
          <p className="big">{apps.length}</p>
          <span className="tag">{thisWeek} this week</span>
          <Spark data={week} />
        </section>

        <section className="card resume">
          <h2>Resume</h2>
          <div className="folder" aria-hidden="true" />
          <p className="strong">{resume ? resume.fileName || "Pasted resume" : "No resume yet"}</p>
          <p className="aid-muted">
            {resume ? `${analysis.words} words · saved ${new Date(resume.updatedAt).toLocaleDateString()}` : "Upload a PDF or paste the text."}
          </p>
          <div className="row">
            <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={onFile} />
            <button className="btn solid" disabled={busy} onClick={() => fileRef.current.click()}>{resume ? "Replace PDF" : "Upload PDF"}</button>
            <button className="btn" disabled={busy} onClick={() => setPaste(!paste)}>Paste text</button>
          </div>
          {paste && (
            <>
              <textarea rows={7} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Paste your resume text here" />
              <button className="btn solid" disabled={busy} onClick={() => store(draft, "")}>{busy ? "Saving…" : "Save resume"}</button>
            </>
          )}
        </section>

        <section className="card status">
          <h2>Application status</h2>
          <div className="cubes">
            {[["Applied", "applied", "#8b5cf6"], ["Reviewed", "viewed", "#3b82f6"], ["Shortlisted", "shortlisted", "#22d3ee"], ["Exam", "exam_scheduled", "#f472b6"]].map(([l, s, c], i) => (
              <div key={s} className="stage" style={{ marginTop: i * 34 }}>
                <Cube color={c} lit={count(s) > 0} />
                <span className="bar" style={{ background: c }} />
                <span className="lbl">{l}</span>
                <strong>{count(s)}</strong>
              </div>
            ))}
          </div>
          {apps.map((a) => (
            <div key={a.id} className="approw">
              <Link to={`/jobs/${a.jobId}`}>{jobOf(a.jobId)?.title || "Removed job"}</Link>
              <ApplicationStatus app={a} />
            </div>
          ))}
        </section>

        <section className="card ats">
          <h2>ATS score estimate</h2>
          {!analysis ? <p className="aid-muted">Upload your resume to see your score and what to improve.</p> : (
            <>
              <p className="big">{analysis.score}<small>/100</small></p>
              <ul className="checks">
                {analysis.checks.map((c) => (
                  <li key={c.label} className={c.pts === c.max ? "ok" : "todo"}>
                    {c.label}{c.pts < c.max && <em>{c.tip}</em>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card skills">
          <h2>Skills detected</h2>
          {!analysis ? <p className="aid-muted">Waiting for your resume.</p>
            : skills.length === 0 ? <p className="aid-muted">No known skills found. Add a Skills section.</p>
            : <div className="chips">{skills.map((s) => <span key={s}>{s}</span>)}</div>}
        </section>

        <section className="card jobs">
          <h2>{resume ? "Recommended jobs" : "Latest jobs"} · {latest.length}</h2>
          {latest.length === 0 && <p className="aid-muted">No jobs match your filter.</p>}
          {latest.map(({ job, match }) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="jobrow">
              <div><b>{job.title}</b><span> {job.company} · {job.location}</span></div>
              <div>
                {appliedIds.has(String(job.id)) && <span className="tag">Applied</span>}
                <MatchBadge pct={match?.pct} />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

export default AIDashboard;
