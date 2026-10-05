import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobForm from "../components/JobForm";

function EditJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    getJob();
  }, []);

  async function getJob() {
    const res = await api.get(`/jobs/${id}`);
    // employers can only edit their own jobs
    if (String(res.data.employerId) !== String(user.id)) {
      navigate("/dashboard");
      return;
    }
    setFormData(res.data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await api.put(`/jobs/${id}`, {
      ...formData,
      salary: Number(formData.salary)
    });
    navigate("/dashboard");
  }

  if (!formData) return <h2>Loading...</h2>;

  return (
    <JobForm
      title="Edit Job"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      buttonText="Update Job"
    />
  );
}

export default EditJob;
