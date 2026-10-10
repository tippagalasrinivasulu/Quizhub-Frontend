import { Link } from "react-router-dom";
import { useApi } from "../api.js";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function Quizzes() {
  const { data, error } = useApi("/quizzes");
  if (error) return <div className="msg err">{error}</div>;
  if (!data) return <p>Loading...</p>;
  return (
    <>
      <h1>Choose a quiz</h1>
      <p className="muted">Questions are shuffled each time. The quiz submits itself when time runs out.</p>
      <div className="grid">
        {data.map((q) => (
          <div className="sub" key={q.id}>
            <span className="tag">{q.difficulty}</span>
            <h3>{q.title}</h3>
            <p>{q.description} {q.questionCount} questions, {fmt(q.seconds)} minutes.</p>
            {q.questionCount > 0
              ? <Link className="btn sm" to={`/quiz/${q.id}`} style={{ textDecoration: "none", textAlign: "center" }}>Start quiz</Link>
              : <span className="muted">No questions yet</span>}
          </div>
        ))}
      </div>
    </>
  );
}
