import { Link, Navigate, useLocation } from "react-router-dom";

export default function Result() {
  const r = useLocation().state;
  if (!r) return <Navigate to="/" replace />;
  const C = 2 * Math.PI * 52;
  return (
    <>
      <div className="card" style={{ textAlign: "center" }}>
        <h2>{r.quiz} quiz result</h2>
        <svg className="ring" width="150" height="150" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="10" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--acc)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(C * r.percent) / 100} ${C}`} transform="rotate(-90 60 60)" />
          <text x="60" y="68" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">{r.percent}%</text>
        </svg>
        <p>{r.score} of {r.total} correct</p>
        <span className="badge">{r.badge}</span>
        <div className="msg good">Result saved to the database.</div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Answer review</h3>
        {r.review.map((x, k) => {
          const ok = x.picked === x.correct;
          return (
            <div key={k} className={"rev " + (ok ? "ok" : "no")}>
              <b>{k + 1}. {x.question}</b>
              <small>Your answer: {x.picked == null ? "Not answered" : x.options[x.picked]}{ok ? "" : ` | Correct: ${x.options[x.correct]}`}</small>
            </div>
          );
        })}
        <div className="row">
          <Link className="btn sec sm" to="/leaderboard" style={{ textDecoration: "none" }}>See leaderboard</Link>
          <Link className="btn sm" to="/quizzes" style={{ textDecoration: "none" }}>Take another quiz</Link>
        </div>
      </div>
    </>
  );
}
