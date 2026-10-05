import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  function saveUser(data) {
    const { password, ...safeUser } = data; // never keep password in state
    setUser(safeUser);
    localStorage.setItem("user", JSON.stringify(safeUser));
  }

  async function login(email, password) {
    const res = await api.get("/users", { params: { email, password } });
    if (res.data.length === 0) throw new Error("Invalid email or password");
    saveUser(res.data[0]);
  }

  async function signup(formData) {
    const exists = await api.get("/users", { params: { email: formData.email } });
    if (exists.data.length > 0) throw new Error("Email already registered");
    const res = await api.post("/users", formData);
    saveUser(res.data);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
