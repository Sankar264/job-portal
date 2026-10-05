import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { CompanyMark } from "../components/JobCard";

function Home() {
  const { user } = useAuth();
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    api.get("/jobs").then((r) => setLatest(r.data.slice(-3).reverse())).catch(() => {});
  }, []);

  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>Your next role is already hiring.</h1>
        <p>Search openings by city, salary and job type. Save the ones you like and come back when you're ready.</p>
        <div className="hero-actions">
          <Link className="add-btn" to="/jobs">Browse jobs</Link>
          {!user && <Link className="add-btn alt" to="/signup">Create account</Link>}
          {user?.role === "employer" && <Link className="add-btn alt" to="/add-job">Post a job</Link>}
        </div>
      </div>

      <div className="hero-stack" aria-label="Recently posted roles">
        {latest.map((job) => (
          <Link to={`/jobs/${job.id}`} className="stack-item" key={job.id}>
            <CompanyMark name={job.company} />
            <span><b>{job.title}</b><small>{job.company}, {job.location}</small></span>
            <em>{job.salary} LPA</em>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Home;