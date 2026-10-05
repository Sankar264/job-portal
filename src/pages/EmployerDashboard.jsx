import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";

function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getMyJobs();
  }, []);

  async function getMyJobs() {
    try {
      const res = await api.get("/jobs", { params: { employerId: user.id } });
      setJobs(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteJob(id) {
    if (!window.confirm("Delete this job posting?")) return;
    await api.delete(`/jobs/${id}`);
    setJobs(jobs.filter((job) => job.id !== id));
  }

  return (
    <>
      <h1>My Job Postings</h1>

      <Link className="add-btn" to="/add-job">+ Post New Job</Link>

      {jobs.length === 0 && <p>You have not posted any jobs yet.</p>}

      <div className="destinations">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} showEdit={true} onDelete={deleteJob} />
        ))}
      </div>
    </>
  );
}

export default EmployerDashboard;
