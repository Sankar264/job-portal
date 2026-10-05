const TYPES = ["Full-time", "Part-time", "Internship", "Contract"];

function FilterPanel({ filters, setFilters, onReset }) {
  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div className="filter-panel">
      <p className="field-label">Job type</p>
      <div className="chips">
        {["", ...TYPES].map((t) => (
          <button
            key={t || "all"}
            className={`chip ${filters.type === t ? "on" : ""}`}
            onClick={() => setFilters({ ...filters, type: t })}
          >
            {t || "Any"}
          </button>
        ))}
      </div>

      <p className="field-label">Salary (LPA)</p>
      <div className="range">
        <input type="number" name="minSalary" placeholder="Min" value={filters.minSalary} onChange={handleChange} />
        <input type="number" name="maxSalary" placeholder="Max" value={filters.maxSalary} onChange={handleChange} />
      </div>

      <button className="reset-btn" onClick={onReset}>Clear all filters</button>
    </div>
  );
}

export default FilterPanel;