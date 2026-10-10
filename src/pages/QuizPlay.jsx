import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";

export default function QuizPlay() {
  const { id } = useParams();
  const nav = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [left, setLeft] = useState(0);
  const [error, setError] = useState("");
  const sending = useRef(false);
  const answersRef = useRef({});
  answersRef.current = answers;

  useEffect(() => {
    api.get(`/quizzes/${id}/start`).then((q) => { setQuiz(q); setLeft(q.seconds); }).catch((e) => setError(e.message));
  }, [id]);

  const submit = useCallback(async () => {
    if (sending.current) return;
    sending.current = true;
    try {
      const r = await api.post(`/quizzes/${id}/submit`, { answers: answersRef.current });
      nav("/result", { state: r });
    } catch (e) {
      setError(e.message); sending.current = false;
    }
  }, [id, nav]);

  useEffect(() => {
    if (!quiz) return;
    if (left <= 0) { submit(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [quiz, left, submit]);

  if (!quiz) return error ? <div className="msg err">{error}</div> : <p>Loading quiz...</p>;

  const qs = quiz.questions;
  const q = qs[i];
  const last = i === qs.length - 1;
  const done = Object.keys(answers).length;
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div className="card">
      <div className="meta">
        <span>{quiz.title} quiz &middot; {done} of {qs.length} answered</span>
        <span className={"timer" + (left <= 15 ? " low" : "")}>{mm}</span>
      </div>
      <div className="bar"><i style={{ width: `${Math.round((done / qs.length) * 100)}%` }} /></div>
      {error && <div className="msg err">{error}</div>}
      <div className="qwrap">
        <div>
          <h2 className="q">{i + 1}. {q.text}</h2>
          {q.options.map((o, k) => (
            <button key={k} className={"opt" + (answers[q.id] === k ? " sel" : "")} onClick={() => setAnswers({ ...answers, [q.id]: k })}>
              {String.fromCharCode(65 + k)}. {o}
            </button>
          ))}
          <div className="row">
            <button className="btn sec sm" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
            <button className="btn sec sm" onClick={() => setFlags({ ...flags, [q.id]: !flags[q.id] })}>{flags[q.id] ? "Remove flag" : "Flag for review"}</button>
            {last
              ? <button className="btn sm" onClick={submit}>Submit quiz</button>
              : <button className="btn sm" onClick={() => setI(i + 1)}>Next question</button>}
          </div>
        </div>
        <div>
          <b style={{ fontSize: 14 }}>Question palette</b>
          <div className="pal" style={{ marginTop: 8 }}>
            {qs.map((x, k) => (
              <button key={x.id} className={(k === i ? "cur " : "") + (flags[x.id] ? "flag" : answers[x.id] !== undefined ? "done" : "")} onClick={() => setI(k)}>{k + 1}</button>
            ))}
          </div>
          <p className="hint">Green: answered. Yellow: flagged.</p>
        </div>
      </div>
    </div>
  );
}
