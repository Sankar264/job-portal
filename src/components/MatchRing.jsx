import { useEffect, useState } from "react";

// Animated compatibility ring: "94%" fills in on load
export default function MatchRing({ pct, size = 54 }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(pct ?? 0), 80); return () => clearTimeout(t); }, [pct]);
  if (pct == null) return null;
  const tone = pct >= 70 ? "good" : pct >= 40 ? "mid" : "low";
  return (
    <svg className={`ring ${tone}`} width={size} height={size} viewBox="0 0 54 54" role="img" aria-label={`${pct}% match with your stack`}>
      <circle cx="27" cy="27" r="22" className="ring-bg" />
      <circle cx="27" cy="27" r="22" className="ring-fg" strokeDasharray={`${v * 1.382} 138.2`} transform="rotate(-90 27 27)" />
      <text x="27" y="31" textAnchor="middle">{pct}%</text>
    </svg>
  );
}
