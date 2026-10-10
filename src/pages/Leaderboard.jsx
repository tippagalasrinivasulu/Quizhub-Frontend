import { useApi } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Leaderboard() {
  const { data, error } = useApi("/leaderboard");
  const { user } = useAuth();
  if (error) return <div className="msg err">{error}</div>;
  if (!data) return <p>Loading...</p>;
  return (
    <div className="card">
      <h1>Leaderboard</h1>
      <p className="muted">Ranked by total correct answers.</p>
      <div className="tw">
        <table>
          <thead><tr><th>Rank</th><th>User</th><th>Quizzes</th><th>Points</th></tr></thead>
          <tbody>
            {data.map((r, k) => (
              <tr key={r.username}><td>{k + 1}</td><td>{r.username}{r.username === user.username ? " (you)" : ""}</td><td>{r.quizzes}</td><td>{r.points}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
