import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";

function SavedJobs() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]); // [{ saveId, job }]

  useEffect(() => {
    getSavedJobs();
  }, []);

  async function getSavedJobs() {
    try {
      const [savedRes, jobsRes] = await Promise.all([
        api.get("/savedJobs", { params: { userId: user.id } }),
        api.get("/jobs")
      ]);

      const list = savedRes.data
        .map((s) => ({
          saveId: s.id,
          job: jobsRes.data.find((j) => String(j.id) === String(s.jobId))
        }))
        .filter((item) => item.job); // skip jobs that were deleted

      setSavedJobs(list);
    } catch (error) {
      console.log(error);
    }
  }

  async function removeSaved(jobId) {
    const item = savedJobs.find((s) => String(s.job.id) === String(jobId));
    await api.delete(`/savedJobs/${item.saveId}`);
    setSavedJobs(savedJobs.filter((s) => s.saveId !== item.saveId));
  }

  return (
    <>
      <h1>Saved Jobs</h1>

      {savedJobs.length === 0 && <p>No saved jobs yet. Go bookmark some!</p>}

      <div className="destinations">
        {savedJobs.map(({ saveId, job }) => (
          <JobCard
            key={saveId}
            job={job}
            isSaved={true}
            onToggleSave={removeSaved}
          />
        ))}
      </div>
    </>
  );
}

export default SavedJobs;
