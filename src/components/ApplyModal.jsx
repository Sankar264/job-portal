import { useRef, useState } from "react";
import { saveResume, applyToJob } from "../services/resumeService";
import { pdfToText } from "../utils/pdfText";

// Apply step: asks for a resume first if the seeker has none
function ApplyModal({ job, user, resume, onClose, onDone }) {
  const [replace, setReplace] = useState(!resume);
  const [draft, setDraft] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();

  async function onFile(e) {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (f.type !== "application/pdf") return setErr("Please choose a PDF file.");
    try { setDraft(await pdfToText(f)); setFileName(f.name); setErr(""); }
    catch { setErr("Could not read that PDF. Paste the text instead."); }
  }

  async function submit() {
    setBusy(true); setErr("");
    try {
      let r = resume;
      if (replace) {
        if (draft.trim().length < 50) throw new Error("short");
        r = await saveResume(user.id, { text: draft, fileName });
      }
      onDone(await applyToJob(user.id, job.id, r), r);
    } catch (e) {
      setErr(e.message === "short" ? "That looks too short to be a resume (50+ characters)."
        : e.response ? `Server error ${e.response.status}.` : "Backend not reachable.");
      setBusy(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>Apply to {job.title}</h2>
        <p className="muted">{job.company} · {job.location}</p>

        {!replace ? (
          <>
            <p>Your saved resume will be sent: <b>{resume.fileName || "pasted resume"}</b></p>
            <button className="chip-btn" onClick={() => setReplace(true)}>Use a different resume</button>
          </>
        ) : (
          <>
            <p>{resume ? "Send a different resume." : "You need a resume before you can apply."}</p>
            <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={onFile} />
            <button className="chip-btn" onClick={() => fileRef.current.click()}>Upload PDF</button>
            <textarea rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="…or paste your resume text here" />
          </>
        )}

        {err && <p className="error">{err}</p>}
        <div className="act-row">
          <button className="chip-btn solid" disabled={busy} onClick={submit}>{busy ? "Sending…" : "Submit application"}</button>
          <button className="chip-btn" disabled={busy} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
export default ApplyModal;
