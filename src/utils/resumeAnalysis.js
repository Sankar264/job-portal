// Pure functions: no network, no AI. Easy to test and extend.

// canonical name -> aliases (all lowercase)
export const SKILLS = {
  React: ["react", "reactjs", "react.js"],
  "Node.js": ["node", "nodejs", "node.js"],
  JavaScript: ["javascript", "js", "es6"],
  TypeScript: ["typescript", "ts"],
  Python: ["python"],
  Java: ["java"],
  "C++": ["c++"],
  "C#": ["c#"],
  SQL: ["sql", "mysql", "postgresql", "postgres", "sqlite"],
  MongoDB: ["mongodb", "mongo"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3", "tailwind", "sass"],
  "REST APIs": ["rest", "rest api", "rest apis", "restful"],
  Django: ["django"],
  Flask: ["flask"],
  Express: ["express", "expressjs"],
  Git: ["git", "github", "gitlab"],
  Docker: ["docker"],
  AWS: ["aws", "amazon web services"],
  Azure: ["azure"],
  Linux: ["linux"],
  "Machine Learning": ["machine learning", "ml", "tensorflow", "pytorch", "scikit-learn"],
  "Data Analysis": ["data analysis", "pandas", "numpy", "excel", "power bi", "tableau"],
  Angular: ["angular"],
  Vue: ["vue", "vuejs"],
  "Spring Boot": ["spring", "spring boot"],
  Figma: ["figma"],
  "UI/UX": ["ui/ux", "ux", "ui design", "wireframing"],
  Testing: ["jest", "testing", "selenium", "cypress", "unit testing"],
  Agile: ["agile", "scrum", "jira"],
  Communication: ["communication", "teamwork", "leadership"],
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export function detectSkills(text = "") {
  const t = text.toLowerCase();
  return Object.entries(SKILLS)
    .filter(([, aliases]) =>
      aliases.some((a) => new RegExp(`(^|[^a-z0-9+#])${esc(a)}($|[^a-z0-9+#])`).test(t))
    )
    .map(([name]) => name);
}

export const jobSkills = (job) => detectSkills(`${job.title} ${job.description}`);

// -> { pct, matched[], missing[] } or null if the job lists no known skills
export function matchJob(resumeSkills, job) {
  const required = jobSkills(job);
  if (!required.length) return null;
  const have = new Set(resumeSkills);
  const matched = required.filter((s) => have.has(s));
  const missing = required.filter((s) => !have.has(s));
  return { pct: Math.round((matched.length / required.length) * 100), matched, missing };
}

export function atsScore(text = "") {
  const t = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const skills = detectSkills(text);
  const numbers = (text.match(/\d+(\.\d+)?\s?(%|k\b|lpa|users|x\b)|\b\d{2,}\b/gi) || []).length;
  const has = (re) => re.test(t);

  const checks = [
    { label: "Email address", max: 10, pts: has(/[\w.+-]+@[\w-]+\.[\w.]+/) ? 10 : 0, tip: "Add a professional email address." },
    { label: "Phone number", max: 10, pts: has(/(\+?\d[\d\s-]{8,}\d)/) ? 10 : 0, tip: "Add a phone number recruiters can call." },
    { label: "Experience section", max: 10, pts: has(/experience|internship|employment/) ? 10 : 0, tip: 'Add an "Experience" or "Internship" heading.' },
    { label: "Education section", max: 10, pts: has(/education|b\.?tech|degree|university|college/) ? 10 : 0, tip: 'Add an "Education" heading.' },
    { label: "Skills section", max: 10, pts: has(/skills|technologies|tech stack/) ? 10 : 0, tip: 'Add a clear "Skills" heading.' },
    { label: "Measurable results", max: 20, pts: numbers >= 3 ? 20 : numbers >= 1 ? 10 : 0, tip: 'Add numbers: "cut load time by 40%", "served 2k users".' },
    { label: "Sensible length (250–900 words)", max: 15, pts: words >= 250 && words <= 900 ? 15 : words >= 120 ? 7 : 0, tip: words > 900 ? "Trim it to 1–2 pages." : "Add more detail about projects and roles." },
    { label: "Enough keywords (8+ skills)", max: 15, pts: Math.min(15, Math.round((skills.length / 8) * 15)), tip: "Mention more tools and technologies you actually use." },
  ];
  const score = checks.reduce((a, c) => a + c.pts, 0);
  return { score, checks, words, skills };
}

export const STATUSES = ["applied", "viewed", "shortlisted", "exam_scheduled", "not_shortlisted"];
export const STATUS_LABEL = {
  applied: "Applied",
  viewed: "Under review",
  shortlisted: "Shortlisted",
  exam_scheduled: "Exam scheduled",
  not_shortlisted: "Not shortlisted",
};
