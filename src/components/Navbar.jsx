import { Link, NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav>
      <Link to="/" className="brand">Job<b>Portal</b></Link>
      <NavLink to="/jobs">Jobs</NavLink>
      {user?.role === "seeker" && <NavLink to="/swipe">Swipe</NavLink>}
      {user?.role === "seeker" && <NavLink to="/games">Games</NavLink>} {/* NEW */}
      {user?.role === "seeker" && <NavLink to="/ai-dashboard">AI dashboard</NavLink>}
      {user?.role === "seeker" && <NavLink to="/saved-jobs">Saved</NavLink>}
      {user?.role === "employer" && <NavLink to="/dashboard">My postings</NavLink>}

      <div className="nav-right">
        <ThemeToggle />
        {user ? (
          <>
            <span className="welcome"><i>{user.name[0]}</i>{user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link className="add-btn nav-cta" to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;