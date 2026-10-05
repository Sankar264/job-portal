import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getScores, saveScore } from "../services/gameService";
import { GAMES, summarize } from "../utils/iq";
import MemoryGrid from "../games/MemoryGrid";
import NumberSequence from "../games/NumberSequence";
import SpeedMath from "../games/SpeedMath";

const COMP = { memory: MemoryGrid, sequence: NumberSequence, math: SpeedMath };

function Games() {
  const { user } = useAuth();
  const [plays, setPlays] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [result, setResult] = useState(null);
  const [run, setRun] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    getScores(user.id).then(setPlays)
      .catch(() => setErr('Could not load scores. Start the backend and add "gameScores": [] to db.json.'));
  }, []);

  async function finish(score, detail) {
    setResult({ game: playing, score, detail });
    try { await saveScore(user.id, playing, score, detail); setPlays(await getScores(user.id)); }
    catch { setErr('Score not saved. Add "gameScores": [] to db.json and restart the backend.'); }
  }

  const start = (g) => { setPlaying(g); setResult(null); setRun((r) => r + 1); };
  const s = summarize(plays);
  const Game = playing && COMP[playing];

  return (
    <>
      <header className="page-head">
        <h1>Brain games</h1>
        <p className="result-count">Three quick games build your IQ-style level.</p>
      </header>
      {err && <p className="error">{err}</p>}

      <div className="bento-grid">
        <div className="tile s2 hero">
          <h4>Your IQ-style level</h4>
          {s ? (
            <>
              <p className="iq-num">{s.iq}</p>
              <p><b>{s.level}</b> {s.games < s.total && <span className="muted">· provisional, played {s.games} of {s.total} games</span>}</p>
            </>
          ) : <p className="muted">Play a game to get your first estimate.</p>}
          <p className="muted" style={{ fontSize: 13 }}>A fun estimate from short games, based on your last 3 plays of each. It is not a clinical or hiring IQ test.</p>
        </div>

        <div className="tile s2">
          <h4>Skill profile</h4>
          {Object.entries(GAMES).map(([k, g]) => (
            <div className="skill" key={k}>
              <span>{g.emoji} {g.skill} <span className="muted">{s?.per[k] ? `${s.per[k].avg}/100 · best ${s.per[k].best}` : "not played"}</span></span>
              <div className="track"><div className="fill" style={{ width: `${s?.per[k]?.avg ?? 0}%` }} /></div>
            </div>
          ))}
        </div>

        {!playing && Object.entries(GAMES).map(([k, g]) => (
          <div className="tile s2" key={k}>
            <h4>{g.skill}</h4>
            <h3>{g.emoji} {g.name}</h3>
            <p className="muted">{g.how}</p>
            <button className="chip-btn solid" onClick={() => start(k)}>Play</button>
          </div>
        ))}

        {playing && (
          <div className="tile s4">
            <h4>{GAMES[playing].emoji} {GAMES[playing].name}</h4>
            {!result ? <Game key={run} onFinish={finish} /> : (
              <div className="gamebox" style={{ textAlign: "center" }}>
                <p className="iq-num">{result.score}<small style={{ fontSize: 20 }}>/100</small></p>
                <p>{result.detail}</p>
                {s && <p className="muted">Your IQ-style level is now <b>{s.iq}</b> ({s.level}).</p>}
                <div className="act-row" style={{ justifyContent: "center" }}>
                  <button className="chip-btn solid" onClick={() => start(playing)}>Play again</button>
                  <button className="chip-btn" onClick={() => { setPlaying(null); setResult(null); }}>Back to games</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
export default Games;