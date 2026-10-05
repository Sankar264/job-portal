import axios from "axios";

// Local: http://localhost:3000   Deployed: set VITE_API_URL to your Render address
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://jobportal-backend-2-6yke.onrender.com",
});

export default api;
