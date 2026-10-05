import { useEffect, useMemo, useRef, useState } from "react";
import { makeQuestion, TIERS } from "../utils/sequences";

const TIME = 25;

// 8 questions of rising difficulty. Score = difficulty-weighted share correct.
export default function NumberSequence({ onFinish }) {
  const qs = useMemo(() => Array.from({ length: TIERS }, (_, t) => makeQuestion(t)), []);
  const total = qs.reduce((a, q) => a + q.weight, 0);
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(TIME);
  const [picked, setPicked] = useState(null);
  const [earned, setEarned] = useState(0);
  const [right, setRight] = useState(0);
  const done = useRef(false);

  useEffect(() => { setT(TIME); }, [idx]);

  useEffect(() => {
    if (picked !== null || idx >= TIERS) return;
    const id = setInterval(() => setT((x) => x - 1), 1000);
    return () => clearInterval(id);
  }, [idx, picked]);

  useEffect(() => { if (t <= 0 && picked === null && idx < TIERS) choose(-1); }, [t]);

  useEffect(() => {
    if (idx >= TIERS && !done.current) {
      done.current = true;
      onFinish(Math.round((earned / total) * 100), `${right} of ${TIERS} correct`);
    }
  }, [idx]);

  function choose(opt) {
    const q = qs[idx];
    setPicked(opt);
    if (opt === q.answer) { setEarned((e) => e + q.weight); setRight((r) => r + 1); }
    setTimeout(() => { setPicked(null); setIdx((i) => i + 1); }, 800);
  }

  if (idx >= TIERS) return <p className="muted">Scoring…</p>;
  const q = qs[idx];
  return (
    <div className="gamebox">
      <div className="gstat"><span>Question {idx + 1} / {TIERS}</span><span>{Math.max(t, 0)}s</span></div>
      <div className="timer"><i style={{ width: `${(Math.max(t, 0) / TIME) * 100}%` }} /></div>
      <div className="seq">{q.terms.map((n, i) => <span key={i}>{n}</span>)}<span className="q">?</span></div>
      <div className="opts">
        {q.options.map((o) => (
          <button key={o} className={`chip-btn ${picked !== null ? (o === q.answer ? "right" : o === picked ? "wrong" : "") : ""}`} disabled={picked !== null} onClick={() => choose(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}