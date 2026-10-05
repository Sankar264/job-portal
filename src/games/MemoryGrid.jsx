import { useEffect, useRef, useState } from "react";

const rnd = () => Math.floor(Math.random() * 9);

// Sequence memory: score = longest pattern repeated (12 steps = 100)
export default function MemoryGrid({ onFinish }) {
  const [seq, setSeq] = useState([rnd(), rnd(), rnd()]);
  const [phase, setPhase] = useState("show");   // show | input | over
  const [lit, setLit] = useState(null);
  const [pos, setPos] = useState(0);
  const [lives, setLives] = useState(2);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState("");
  const done = useRef(false);

  useEffect(() => {
    if (phase !== "show") return;
    const timers = [];
    seq.forEach((cell, i) => {
      timers.push(setTimeout(() => setLit(cell), 800 + i * 750));
      timers.push(setTimeout(() => setLit(null), 800 + i * 750 + 450));
    });
    timers.push(setTimeout(() => { setPos(0); setPhase("input"); }, 800 + seq.length * 750));
    return () => timers.forEach(clearTimeout);
  }, [phase, seq]);

  function finish(l) {
    if (done.current) return;
    done.current = true;
    setPhase("over");
    onFinish(Math.min(100, Math.round((l * 100) / 12)), `Longest pattern: ${l}`);
  }

  function blink(kind) { setFlash(kind); setTimeout(() => setFlash(""), 450); }

  function tap(i) {
    if (phase !== "input") return;
    setLit(i); setTimeout(() => setLit(null), 160);
    if (i === seq[pos]) {
      if (pos + 1 === seq.length) {
        setBest(seq.length); blink("ok");
        setSeq((s) => [...s, rnd()]); setPhase("show");
      } else setPos(pos + 1);
    } else {
      blink("bad");
      if (lives <= 1) finish(best);
      else { setLives(lives - 1); setPhase("show"); }   // replay the same pattern
    }
  }

  return (
    <div className="gamebox">
      <div className="gstat"><span>Pattern length {seq.length}</span><span>{"♥".repeat(lives)}</span></div>
      <p className="muted" style={{ textAlign: "center" }}>{phase === "show" ? "Watch carefully…" : phase === "input" ? `Your turn: ${pos + 1} of ${seq.length}` : "Done"}</p>
      <div className={`gboard ${flash}`}>
        {Array.from({ length: 9 }, (_, i) => <button key={i} className={`cell ${lit === i ? "lit" : ""}`} onClick={() => tap(i)} aria-label={`Tile ${i + 1}`} />)}
      </div>
    </div>
  );
}