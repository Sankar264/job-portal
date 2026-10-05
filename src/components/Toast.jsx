import { useEffect } from "react";

function Toast({ msg, kind = "ok", onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return <div className={`toast ${kind}`} role="status">{msg}</div>;
}
export default Toast;
