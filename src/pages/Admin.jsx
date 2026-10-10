import { useEffect, useState } from "react";
import { api } from "../api.js";

const blank = { text: "", o: ["", "", "", ""], c: 0 };

export default function Admin() {
  const [quizzes, setQuizzes] = useState([]);
  const [qid, setQid] = useState("");
  const [list, setList] = useState([]);
  const [f, setF] = useState(blank);
  const [nq, setNq] = useState({ title: "", description: "", difficulty: "Easy" });
  const [msg, setMsg] = useState(null);

  const loadQuizzes = () => api.get("/quizzes").then((d) => { setQuizzes(d); setQid((cur) => cur || (d.length ? String(d[0].id) : "")); });
  const loadQs = () => (qid ? api.get(`/admin/quizzes/${qid}/questions`).then(setList) : null);
  useEffect(() => { loadQuizzes(); }, []);
  useEffect(() => { loadQs(); }, [qid]);

  const run = async (fn, ok) => {
    try { await fn(); setMsg({ ok: true, t: ok }); } catch (e) { setMsg({ ok: false, t: e.message }); }
  };
  const addQuestion = () => run(async () => {
    await api.post("/admin/questions", { quizId: +qid, text: f.text, options: f.o, correctOption: +f.c });
    setF(blank); await loadQs(); await loadQuizzes();
  }, "Question added.");
  const remove = (id) => run(async () => { await api.del(`/admin/questions/${id}`); await loadQs(); await loadQuizzes(); }, "Question deleted.");
  const addQuiz = () => run(async () => {
    const q = await api.post("/admin/quizzes", nq);
    setNq({ title: "", description: "", difficulty: "Easy" }); await loadQuizzes(); setQid(String(q.id));
  }, "Quiz created.");

  return (
    <>
      <div className="card">
        <h1>Admin panel</h1>
        {msg && <div className={"msg " + (msg.ok ? "good" : "err")}>{msg.t}</div>}
        <h3 style={{ marginTop: 18 }}>Create a quiz</h3>
        <label htmlFor="nt">Title</label><input id="nt" value={nq.title} onChange={(e) => setNq({ ...nq, title: e.target.value })} />
        <label htmlFor="nd">Description</label><input id="nd" value={nq.description} onChange={(e) => setNq({ ...nq, description: e.target.value })} />
        <label htmlFor="nl">Difficulty</label>
        <select id="nl" value={nq.difficulty} onChange={(e) => setNq({ ...nq, difficulty: e.target.value })}>
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <button className="btn sm" style={{ marginTop: 14 }} onClick={addQuiz}>Create quiz</button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Add a question</h3>
        <label htmlFor="sq">Quiz</label>
        <select id="sq" value={qid} onChange={(e) => setQid(e.target.value)}>
          {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title} ({q.questionCount})</option>)}
        </select>
        <label htmlFor="qt">Question</label><input id="qt" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} />
        <label>Options</label>
        {f.o.map((v, k) => (
          <input key={k} style={{ marginTop: k ? 6 : 0 }} placeholder={`Option ${String.fromCharCode(65 + k)}`} value={v}
                 onChange={(e) => setF({ ...f, o: f.o.map((x, j) => (j === k ? e.target.value : x)) })} />
        ))}
        <label htmlFor="cc">Correct answer</label>
        <select id="cc" value={f.c} onChange={(e) => setF({ ...f, c: e.target.value })}>
          <option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option>
        </select>
        <button className="btn sm" style={{ marginTop: 14 }} disabled={!qid} onClick={addQuestion}>Add question</button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Questions in this quiz</h3>
        {list.map((x) => (
          <div className="rev ok" key={x.id}>
            <b>{x.text}</b>
            <small>Correct: {x.options[x.correctOption]}</small>
            <button className="link" onClick={() => remove(x.id)}>Delete</button>
          </div>
        ))}
        {!list.length && <p className="muted">No questions yet.</p>}
      </div>
    </>
  );
}
