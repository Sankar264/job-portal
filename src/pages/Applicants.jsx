import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { setStatus, scheduleExam } from "../services/resumeService";
import { detectSkills, matchJob, STATUS_LABEL } from "../utils/resumeAnalysis";
import MatchBadge from "../components/MatchBadge";
import Pipeline from "../components/Pipeline";
import { ExamCard } from "../components/ApplicationStatus";
import Toast from "../components/Toast";

const EMPTY = { date: "", time: "", mode: "Online", where: "", notes: "" };

// Employer view: read each resume, shortlist or reject, schedule the exam
function Applicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);      // resume shown
  const [form, setForm] = useState(null);      // { id, ...exam } being edited
  const [toast, setToast] = useState({ msg: "", kind: "ok" });

  useEffect(() => { load(); }, [jobId]);

  async function load() {
    try {
      const [{ data: j }, { data: apps }] = await Promise.all([
        api.get(`/jobs/${jobId}`), api.get("/applications", { params: { jobId } }),
      ]);
      const out = [];
      for (let a of apps) {
        if (a.status === "applied") a = await setStatus(a, "viewed"); // employer opened it
        const { data: u } = await api.get(`/users/${a.userId}`);
        const text = a.resumeText || "";
        out.push({ app: a, user: u, match: text ? matchJob(detectSkills(text), j) : null });
      }
      out.sort((x, y) => (y.match?.pct ?? -1) - (x.match?.pct ?? -1));
      setJob(j); setRows(out);
    } catch {
      setToast({ msg: "Could not load applicants. Is the backend running?", kind: "err" });
    } finally { setLoading(false); }
  }

  const replace = (app) => setRows((rs) => rs.map((r) => (r.app.id === app.id ? { ...r, app } : r)));

  async function decide(row, status) {
    try {
      replace(await setStatus(row.app, status));
      setToast({ msg: status === "shortlisted" ? "Shortlisted." : "Marked not shortlisted.", kind: "ok" });
    } catch { setToast({ msg: "Could not update. Try again.", kind: "err" }); }
  }

  async function saveExam(row) {
    if (!form.date || !form.time) return setToast({ msg: "Choose a date and a time.", kind: "err" });
    try {
      const { id, ...exam } = form;
      replace(await scheduleExam(row.app, exam));
      setForm(null);
      setToast({ msg: "Exam scheduled. The candidate can see it now.", kind: "ok" });
    } catch { setToast({ msg: "Could not save the exam.", kind: "err" }); }
  }

  if (loading) return <p className="empty">Loading applicants…</p>;

  return (
    <>
      <Toast {...toast} onDone={() => setToast({ msg: "", kind: "ok" })} />
      <Link to="/dashboard" className="back">Back to my postings</Link>
      <header className="page-head">
        <h1>{job?.title}</h1>
        <p className="result-count">{rows.length} applicant{rows.length === 1 ? "" : "s"}, best match first</p>
      </header>

      {rows.length === 0 && <p className="empty">No one has applied yet.</p>}

      <div className="rec-list">
        {rows.map((r) => {
          const a = r.app;
          const decided = ["shortlisted", "exam_scheduled"].includes(a.status);
          return (
            <article key={a.id} className="applicant">
              <div className="applicant-top">
                <div><b>{r.user.name}</b> <span className="muted">{r.user.email}</span></div>
                <MatchBadge pct={r.match?.pct} />
                <span className={`statusbadge s-${a.status}`}>{STATUS_LABEL[a.status]}</span>
              </div>
              <Pipeline app={a} />
              {r.match?.missing.length > 0 && <p className="muted">Missing: {r.match.missing.join(", ")}</p>}

              <div className="act-row">
                <button className="chip-btn" onClick={() => setOpen(open === a.id ? null : a.id)}>{open === a.id ? "Hide resume" : "View resume"}</button>
                {a.status !== "shortlisted" && a.status !== "exam_scheduled" && <button className="chip-btn good" onClick={() => decide(r, "shortlisted")}>Shortlist</button>}
                {a.status !== "not_shortlisted" && a.status !== "exam_scheduled" && <button className="chip-btn bad" onClick={() => decide(r, "not_shortlisted")}>Not shortlist</button>}
                {decided && <button className="chip-btn solid" onClick={() => setForm({ id: a.id, ...(a.exam || EMPTY) })}>{a.exam ? "Reschedule exam" : "Schedule exam"}</button>}
              </div>

              {open === a.id && <pre className="ai-out">{a.resumeText || "No resume attached."}</pre>}
              <ExamCard exam={a.exam} />

              {form?.id === a.id && (
                <div className="exam-form">
                  <label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
                  <label>Time<input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
                  <label>Mode
                    <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                      <option>Online</option><option>On-site</option>
                    </select>
                  </label>
                  <label>{form.mode === "Online" ? "Link" : "Venue"}<input value={form.where} onChange={(e) => setForm({ ...form, where: e.target.value })} placeholder={form.mode === "Online" ? "https://meet…" : "Address / room"} /></label>
                  <label className="full">Notes<input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Duration, what to bring…" /></label>
                  <div className="act-row full">
                    <button className="chip-btn solid" onClick={() => saveExam(r)}>Save exam</button>
                    <button className="chip-btn" onClick={() => setForm(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
export default Applicants;
