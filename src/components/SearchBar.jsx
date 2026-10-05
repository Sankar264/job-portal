function SearchBar({ keyword, location, setKeyword, setLocation }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search job title, company, keyword..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
