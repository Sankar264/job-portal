import { useState } from "react";

export default function ThemeToggle() {
  const [t, setT] = useState(document.documentElement.dataset.theme || "dark");
  function flip() {
    const n = t === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = n;
    localStorage.setItem("theme", n);
    setT(n);
  }
  return <button className="theme-btn" onClick={flip} aria-label="Toggle dark mode">{t === "dark" ? "☀" : "☾"}</button>;
}
