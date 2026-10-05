import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import { useResumeSkills } from "../utils/useResumeSkills";
import { matchJob } from "../utils/resumeAnalysis";

const emptyFilters = { type: "", minSalary: "", maxSalary: "" };

function Jobs() {
  const { user } = useAuth();
  const isSeeker = user?.role === "seeker";

  const resumeSkills = useResumeSkills(user); // null until a resume exists
  const [jobs, setJobs] = useState([]);
  const [saved, setSaved] = useState([]); // savedJobs records for this user
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    getJobs();
    if (isSeeker) getSaved();
  }, []);

  async function getJobs() {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function getSaved() {
    const res = await api.get("/savedJobs", { params: { userId: user.id } });
    setSaved(res.data);
  }

  async function toggleSave(jobId) {
    const existing = saved.find((s) => String(s.jobId) === String(jobId));
    if (existing) {
      await api.delete(`/savedJobs/${existing.id}`);
      setSaved(saved.filter((s) => s.id !== existing.id));
    } else {
      const res = await api.post("/savedJobs", { userId: user.id, jobId });
      setSaved([...saved, res.data]);
    }
  }

  function resetAll() {
    setKeyword("");
    setLocation("");
    setFilters(emptyFilters);
  }

  const filteredJobs = jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.description}`.toLowerCase();
    return (
      text.includes(keyword.toLowerCase()) &&
      job.location.toLowerCase().includes(location.toLowerCase()) &&
      (filters.type === "" || job.type === filters.type) &&
      (filters.minSalary === "" || job.salary >= Number(filters.minSalary)) &&
      (filters.maxSalary === "" || job.salary <= Number(filters.maxSalary))
    );
  });

  // with a resume: attach a match and show best matches first
  const shown = filteredJobs
    .map((job) => ({ job, match: resumeSkills ? matchJob(resumeSkills, job) : null }))
    .sort((a, b) => (resumeSkills ? (b.match?.pct ?? -1) - (a.match?.pct ?? -1) : 0));

  return (
    <>
      <header className="page-head">
        <h1>Open roles</h1>
        <p className="result-count">{filteredJobs.length} matching your search</p>
      </header>

      <div className="board">
        <aside className="sidebar">
          <SearchBar keyword={keyword} location={location} setKeyword={setKeyword} setLocation={setLocation} />
          <FilterPanel filters={filters} setFilters={setFilters} onReset={resetAll} />
        </aside>

        <div className="destinations">
          {filteredJobs.length === 0 && (
            <p className="empty">No roles match these filters. Try widening the salary range or clearing the location.</p>
          )}
          {shown.map(({ job, match }) => (
            <JobCard
              key={job.id}
              job={job}
              match={match}
              isSaved={saved.some((s) => String(s.jobId) === String(job.id))}
              onToggleSave={isSeeker ? toggleSave : undefined}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Jobs;