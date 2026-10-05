function JobForm({ formData, setFormData, onSubmit, buttonText, title }) {
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div className="form-container">
      <h2>{title}</h2>
      <form onSubmit={onSubmit}>
        <input name="title" placeholder="Job Title" value={formData.title} onChange={handleChange} required />
        <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} required />
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
        <input type="number" name="salary" placeholder="Salary (LPA)" value={formData.salary} onChange={handleChange} required />

        <select name="type" value={formData.type} onChange={handleChange}>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Internship</option>
          <option>Contract</option>
        </select>

        <textarea name="description" placeholder="Job Description" value={formData.description} onChange={handleChange} required />

        <button className="submit-btn">{buttonText}</button>
      </form>
    </div>
  );
}

export default JobForm;
