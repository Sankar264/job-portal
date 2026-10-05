function MatchBadge({ pct }) {
  if (pct == null) return null;
  const tone = pct >= 70 ? "good" : pct >= 40 ? "mid" : "low";
  return <span className={`match ${tone}`}>{pct}% match</span>;
}
export default MatchBadge;
