// Turns game scores (0-100 each, ~50 = typical player) into an "IQ-style" estimate.
// This is a fun estimate from short games. It is NOT a clinical or hiring IQ test.
export const GAMES = {
  memory:   { name: "Memory Grid",     skill: "Memory", emoji: "🧠", how: "Watch the tiles light up, then repeat the pattern. It grows by one each round. You have 2 mistakes." },
  sequence: { name: "Number Sequence", skill: "Logic",  emoji: "🔢", how: "8 number patterns, easy to hard. Pick the next number. 25 seconds each. Harder ones score more." },
  math:     { name: "Speed Math",      skill: "Speed",  emoji: "⚡", how: "Solve as many sums as you can in 45 seconds. Wrong answers cost half a point." },
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function levelFor(iq) {
  if (iq >= 125) return "Exceptional";
  if (iq >= 115) return "Sharp";
  if (iq >= 105) return "Above average";
  if (iq >= 95) return "Average";
  if (iq >= 85) return "Developing";
  return "Warming up";
}

// plays: [{ game, score, playedAt }] -> null, or { iq, level, per, games, total }
export function summarize(plays) {
  const per = {};
  for (const g of Object.keys(GAMES)) {
    const mine = plays.filter((p) => p.game === g).sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
    if (!mine.length) continue;
    const last3 = mine.slice(0, 3);                               // recent form, not one lucky run
    per[g] = { avg: Math.round(last3.reduce((a, p) => a + p.score, 0) / last3.length), best: Math.max(...mine.map((p) => p.score)), plays: mine.length };
  }
  const played = Object.keys(per);
  if (!played.length) return null;
  const composite = played.reduce((a, g) => a + per[g].avg, 0) / played.length;
  const iq = clamp(Math.round(100 + (composite - 50) * 0.6), 70, 130);   // 50 -> 100, 0 -> 70, 100 -> 130
  return { iq, level: levelFor(iq), per, games: played.length, total: Object.keys(GAMES).length };
}