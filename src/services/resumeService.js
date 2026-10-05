import api from "./api";

export async function getResume(userId) {
  const { data } = await api.get("/resumes", { params: { userId } });
  return data[0] || null;
}

export async function saveResume(userId, { text, fileName }) {
  const existing = await getResume(userId);
  const body = { userId, fileName, text, updatedAt: new Date().toISOString() };
  const res = existing
    ? await api.put(`/resumes/${existing.id}`, body)
    : await api.post("/resumes", body);
  return res.data;
}

export async function getMyApplications(userId) {
  const { data } = await api.get("/applications", { params: { userId } });
  return data;
}

// The resume is copied into the application, so the employer sees exactly what was sent
export async function applyToJob(userId, jobId, resume) {
  const { data: dup } = await api.get("/applications", { params: { userId, jobId } });
  if (dup.length) return dup[0];
  const now = new Date().toISOString();
  const { data } = await api.post("/applications", {
    userId, jobId, status: "applied", appliedAt: now,
    resumeText: resume.text, resumeFileName: resume.fileName || "",
    exam: null, history: [{ status: "applied", at: now }],
  });
  return data;
}

export async function setStatus(app, status, extra = {}) {
  const changed = app.status !== status;
  const history = changed ? [...(app.history || []), { status, at: new Date().toISOString() }] : app.history;
  const { data } = await api.patch(`/applications/${app.id}`, { status, history, ...extra });
  return data;
}

export const scheduleExam = (app, exam) => setStatus(app, "exam_scheduled", { exam });
