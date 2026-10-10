import { Link } from "react-router-dom";
import { useApi } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error } = useApi("/results/me");
  if (error) return <div className="msg err">{error}</div>;
  if (!data) return <p>Loading...</p>;
  const avg = data.length ? Math.round(data.reduce((a, r) => a + r.percent, 0) / data.length) : 0;
  const best = data.length ? Math.max(...data.map((r) => r.percent)) : 0;
  return (
    <>
      <h1>Hello, {user.username}</h1>
      <p className="muted">Here is how your practice is going.</p>
      <div className="grid">
        <div className="stat"><div className="big">{data.length}</div><span>Quizzes taken</span></div>
        <div className="stat"><div className="big">{avg}%</div><span>Average score</span></div>
        <div className="stat"><div className="big">{best}%</div><span>Best score</span></div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ margin: "0 0 8px" }}>
          <h3>Recent attempts</h3>
          <Link className="btn sm" to="/quizzes" style={{ textDecoration: "none" }}>Start a quiz</Link>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Date</th><th>Quiz</th><th>Score</th></tr></thead>
            <tbody>
              {data.slice(0, 4).map((r) => (
                <tr key={r.id}><td>{new Date(r.takenAt).toLocaleDateString()}</td><td>{r.quiz}</td><td>{r.score}/{r.total}</td></tr>
              ))}
              {!data.length && <tr><td colSpan="3">No attempts yet. Start your first quiz.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
