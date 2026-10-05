import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobForm from "../components/JobForm";

function AddJob() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "Full-time",
    description: ""
  });

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post("/jobs", {
      ...formData,
      salary: Number(formData.salary),
      employerId: user.id
    });
    navigate("/dashboard");
  }

  return (
    <JobForm
      title="Post a Job"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      buttonText="Post Job"
    />
  );
}

export default AddJob;
