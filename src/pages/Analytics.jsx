import { useApi } from "../api.js";

export default function Analytics() {
  const stats = useApi("/results/stats");
  const hist = useApi("/results/me");
  if (stats.error || hist.error) return <div className="msg err">{stats.error || hist.error}</div>;
  if (!stats.data || !hist.data) return <p>Loading...</p>;
  return (
    <>
      <div className="card">
        <h1>My analytics</h1>
        <p className="muted">Average score per subject. Practice the lowest bar first.</p>
        {stats.data.map((s) => (
          <div className="hb" key={s.quiz}>
            <span>{s.quiz}</span>
            <div className="bar"><i style={{ width: `${s.average}%` }} /></div>
            <b>{s.average}%</b>
          </div>
        ))}
        {!stats.data.length && <p>No attempts yet. Take a quiz to see your analytics.</p>}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>My results history</h3>
        <div className="tw">
          <table>
            <thead><tr><th>Date</th><th>Quiz</th><th>Score</th><th>Percent</th></tr></thead>
            <tbody>
              {hist.data.map((r) => (
                <tr key={r.id}><td>{new Date(r.takenAt).toLocaleString()}</td><td>{r.quiz}</td><td>{r.score}/{r.total}</td><td>{r.percent}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
