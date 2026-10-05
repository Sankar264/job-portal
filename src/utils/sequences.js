const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const make = (f) => Array.from({ length: 6 }, (_, i) => f(i));

// 8 pattern types, easy -> hard. Each returns 6 terms; the 6th is the answer.
const BUILD = [
  () => { const a = ri(1, 9), d = ri(2, 6); return make((i) => a + d * i); },                 // +d
  () => { const a = ri(1, 4); return make((i) => a * 2 ** i); },                              // x2
  () => { const a = ri(1, 6); return make((i) => a + (i * (i + 1)) / 2); },                   // +1, +2, +3...
  () => { const k = ri(1, 4); return make((i) => (i + k) ** 2); },                            // squares
  () => { const p = ri(2, 5), s = [ri(1, 5)]; for (let i = 1; i < 6; i++) s.push(i % 2 ? s[i - 1] + p : s[i - 1] * 2); return s; }, // +p, x2
  () => { const s = [ri(1, 4), ri(2, 6)]; for (let i = 2; i < 6; i++) s.push(s[i - 1] + s[i - 2]); return s; }, // fibonacci-like
  () => { const a = ri(1, 9), b = ri(20, 40), d1 = ri(2, 5), d2 = ri(2, 5); return make((i) => (i % 2 ? b + d2 * ((i - 1) / 2) : a + d1 * (i / 2))); }, // two interleaved
  () => { const s = [ri(1, 3)]; for (let i = 1; i < 6; i++) s.push(s[i - 1] * 2 + i); return s; }, // x2 + n
];

export const TIERS = BUILD.length;

export function makeQuestion(tier) {
  const t = BUILD[tier]();
  const answer = t[5];
  const step = Math.abs(t[5] - t[4]) || 1;
  const opts = new Set([answer]);
  for (const c of shuffle([answer + 1, answer - 1, answer + 2, answer - 2, answer + step, answer - step, t[4] + step, answer * 2])) {
    if (opts.size >= 4) break;
    if (c !== answer && c > 0) opts.add(c);
  }
  while (opts.size < 4) opts.add(answer + ri(3, 15));
  return { terms: t.slice(0, 5), answer, options: shuffle([...opts]), weight: tier + 1 };
}