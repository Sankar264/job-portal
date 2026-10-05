import { useEffect, useRef, useState } from "react";

const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const TIME = 45;

function question(level) {
  if (level < 2) { const a = ri(10, 60), b = ri(10, 60); return { text: `${a} + ${b}`, ans: a + b }; }
  if (level < 4) { const a = ri(30, 99), b = ri(10, a); return { text: `${a} − ${b}`, ans: a - b }; }
  if (level < 7) { const a = ri(3, 12), b = ri(3, 12); return { text: `${a} × ${b}`, ans: a * b }; }
  const a = ri(12, 30), b = ri(3, 9);
  return { text: `${a} × ${b}`, ans: a * b };
}

// 45 seconds. Score = (correct - wrong/2) out of 24 (12 correct = 50)
export default function SpeedMath({ onFinish }) {
  const [time, setTime] = useState(TIME);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [q, setQ] = useState(question(0));
  const [val, setVal] = useState("");
  const done = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (time <= 0 && !done.current) {
      done.current = true;
      const net = Math.max(0, correct - wrong * 0.5);
      onFinish(Math.min(100, Math.round((net * 100) / 24)), `${correct} correct, ${wrong} wrong`);
    }
  }, [time]);

  function submit(e) {
    e.preventDefault();
    if (time <= 0 || val.trim() === "") return;
    if (parseInt(val, 10) === q.ans) { setCorrect(correct + 1); setQ(question(Math.floor((correct + 1) / 3))); }
    else { setWrong(wrong + 1); setQ(question(Math.floor(correct / 3))); }
    setVal("");
  }

  if (time <= 0) return <p className="muted">Time is up. Scoring…</p>;
  return (
    <form className="gamebox" onSubmit={submit}>
      <div className="gstat"><span>✓ {correct} · ✗ {wrong}</span><span>{time}s</span></div>
      <div className="timer"><i style={{ width: `${(time / TIME) * 100}%` }} /></div>
      <p className="mathq">{q.text}</p>
      <input className="mathin" autoFocus inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d-]/g, ""))} placeholder="Answer" />
      <button className="chip-btn solid" type="submit" style={{ justifySelf: "center" }}>Enter</button>
    </form>
  );
}