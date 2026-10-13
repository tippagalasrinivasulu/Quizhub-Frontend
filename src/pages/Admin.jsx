import { useEffect, useState } from "react";
import { api } from "../api.js";

const blankQuestion = { text: "", o: ["", "", "", ""], c: 0 };

export default function Admin() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [questionsList, setQuestionsList] = useState([]);
  const [qForm, setQForm] = useState(blankQuestion);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Quiz form
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    subject: "Computer Science",
    description: "",
    difficulty: "Medium",
    durationMinutes: 10,
    isPyq: false,
    year: "2024"
  });

  // AI PYQ PDF form in Admin
  const [aiPdfFile, setAiPdfFile] = useState(null);
  const [aiSubject, setAiSubject] = useState("Computer Science");
  const [aiTitle, setAiTitle] = useState("");
  const [aiDuration, setAiDuration] = useState(10);
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(8);

  const subjectsList = [
    "Computer Science",
    "Data Structures",
    "Operating Systems",
    "Database Systems",
    "Computer Networks",
    "Electronics",
    "Mathematics",
    "PYQ Papers",
    "Aptitude & Reasoning"
  ];

  const loadQuizzes = () =>
    api.get("/quizzes").then((d) => {
      setQuizzes(d);
      setSelectedQuizId((cur) => cur || (d.length ? String(d[0].id) : ""));
    });

  const loadQuestions = () => {
    if (selectedQuizId) {
      api.get(`/admin/quizzes/${selectedQuizId}/questions`).then(setQuestionsList);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedQuizId]);

  const runAction = async (fn, successMsg) => {
    setLoading(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, t: successMsg });
    } catch (e) {
      setMsg({ ok: false, t: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () =>
    runAction(async () => {
      if (!newQuiz.title.trim()) throw new Error("Title is required");
      const created = await api.post("/admin/quizzes", {
        ...newQuiz,
        durationMinutes: Number(newQuiz.durationMinutes)
      });
      setNewQuiz({
        title: "",
        subject: "Computer Science",
        description: "",
        difficulty: "Medium",
        durationMinutes: 10,
        isPyq: false,
        year: "2024"
      });
      await loadQuizzes();
      setSelectedQuizId(String(created.id));
    }, "New Quiz & Subject created successfully!");

  const handleAddQuestion = () =>
    runAction(async () => {
      if (!qForm.text.trim()) throw new Error("Question text cannot be empty");
      if (qForm.o.some((opt) => !opt.trim())) throw new Error("All 4 options must be filled");
      await api.post("/admin/questions", {
        quizId: Number(selectedQuizId),
        text: qForm.text,
        options: qForm.o,
        correctOption: Number(qForm.c)
      });
      setQForm(blankQuestion);
      await loadQuestions();
      await loadQuizzes();
    }, "Question added to quiz successfully.");

  const handleDeleteQuestion = (id) =>
    runAction(async () => {
      await api.del(`/admin/questions/${id}`);
      await loadQuestions();
      await loadQuizzes();
    }, "Question deleted.");

  const handleDeleteQuiz = (id) =>
    runAction(async () => {
      if (!window.confirm("Are you sure you want to delete this entire quiz?")) return;
      await api.del(`/admin/quizzes/${id}`);
      setSelectedQuizId("");
      await loadQuizzes();
    }, "Quiz deleted successfully.");

  const handleAiPdfImport = (e) => {
    e.preventDefault();
    if (!aiPdfFile) {
      setMsg({ ok: false, t: "Please select a PYQ PDF file to upload." });
      return;
    }
    runAction(async () => {
      const fd = new FormData();
      fd.append("file", aiPdfFile);
      if (aiTitle.trim()) fd.append("title", aiTitle.trim());
      fd.append("subject", aiSubject);
      fd.append("difficulty", aiDifficulty);
      fd.append("durationMinutes", aiDuration);
      fd.append("questionCount", aiCount);

      const created = await api.upload("/ai/upload-pyq-pdf", fd);
      setAiPdfFile(null);
      setAiTitle("");
      await loadQuizzes();
      setSelectedQuizId(String(created.id));
    }, "AI Agent parsed PYQ PDF and created quiz with questions!");
  };

  return (
    <div className="page-container admin-page">
      <div className="section-header">
        <div>
          <span className="badge-pill gradient-pill">🛡️ System Administration</span>
          <h1 className="hero-heading">Admin Management Console</h1>
          <p className="hero-sub">
            Add new subjects, set quiz time limits, import PYQ papers via AI, and manage question databases.
          </p>
        </div>
      </div>

      {msg && <div className={`msg-banner ${msg.ok ? "msg-success" : "msg-error"}`}>{msg.t}</div>}

      <div className="admin-grid-layout">
        {/* Card 1: Add New Quiz & Subject */}
        <div className="card admin-card">
          <div className="card-title-badge">
            <h3>➕ Create New Quiz / Add Subject</h3>
          </div>
          <p className="muted">Specify subject, time limit, and difficulty level.</p>

          <label htmlFor="nqTitle">Quiz Title</label>
          <input
            id="nqTitle"
            placeholder="e.g. Operating Systems Memory Management"
            value={newQuiz.title}
            onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
          />

          <div className="form-grid-2">
            <div>
              <label htmlFor="nqSub">Subject / Category</label>
              <input
                id="nqSub"
                list="subjectsList"
                placeholder="Select or type new subject"
                value={newQuiz.subject}
                onChange={(e) => setNewQuiz({ ...newQuiz, subject: e.target.value })}
              />
              <datalist id="subjectsList">
                {subjectsList.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="nqTimer">Time Limit (Minutes)</label>
              <select
                id="nqTimer"
                value={newQuiz.durationMinutes}
                onChange={(e) => setNewQuiz({ ...newQuiz, durationMinutes: e.target.value })}
              >
                <option value="3">3 Minutes (Fast)</option>
                <option value="5">5 Minutes</option>
                <option value="10">10 Minutes (Standard)</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label htmlFor="nqDiff">Difficulty</label>
              <select
                id="nqDiff"
                value={newQuiz.difficulty}
                onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value })}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="nqPyq">Is PYQ Paper?</label>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="nqPyq"
                  checked={newQuiz.isPyq}
                  onChange={(e) => setNewQuiz({ ...newQuiz, isPyq: e.target.checked })}
                />
                <label htmlFor="nqPyq" style={{ margin: 0, fontWeight: "normal" }}>
                  Previous Year Paper
                </label>
              </div>
            </div>
          </div>

          {newQuiz.isPyq && (
            <div>
              <label htmlFor="nqYear">Exam Year / Paper Tag</label>
              <input
                id="nqYear"
                placeholder="e.g. GATE 2024, Semester Midterm"
                value={newQuiz.year}
                onChange={(e) => setNewQuiz({ ...newQuiz, year: e.target.value })}
              />
            </div>
          )}

          <label htmlFor="nqDesc">Short Description</label>
          <input
            id="nqDesc"
            placeholder="Key concepts covered in this quiz"
            value={newQuiz.description}
            onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
          />

          <button className="btn btn-primary sm" style={{ marginTop: "16px" }} onClick={handleCreateQuiz} disabled={loading}>
            Create Quiz
          </button>
        </div>

        {/* Card 2: AI Agent PYQ PDF Importer */}
        <div className="card admin-card ai-accent-card">
          <div className="card-title-badge">
            <span className="badge-pill gradient-pill">🤖 AI Importer</span>
            <h3>Upload PYQ PDF to Auto-Create Quiz</h3>
          </div>
          <p className="muted">Upload an exam paper PDF. AI will extract questions, choices, and set the quiz up.</p>

          <form onSubmit={handleAiPdfImport}>
            <div className="dropzone-box sm">
              <input
                type="file"
                id="adminPdf"
                accept=".pdf"
                className="file-input-hidden"
                onChange={(e) => setAiPdfFile(e.target.files[0] || null)}
              />
              <label htmlFor="adminPdf" className="dropzone-label sm">
                <span>📂</span>
                <span>{aiPdfFile ? aiPdfFile.name : "Select Exam Paper PDF"}</span>
              </label>
            </div>

            <div className="form-grid-2">
              <div>
                <label htmlFor="aiSub">Subject</label>
                <select id="aiSub" value={aiSubject} onChange={(e) => setAiSubject(e.target.value)}>
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="aiDuration">Time Limit (Minutes)</label>
                <select id="aiDuration" value={aiDuration} onChange={(e) => setAiDuration(e.target.value)}>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label htmlFor="aiDiff">Difficulty</label>
                <select id="aiDiff" value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label htmlFor="aiCount">Questions to Extract</label>
                <select id="aiCount" value={aiCount} onChange={(e) => setAiCount(e.target.value)}>
                  <option value="4">4 Questions</option>
                  <option value="8">8 Questions</option>
                  <option value="12">12 Questions</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary sm" style={{ marginTop: "16px" }} disabled={loading || !aiPdfFile}>
              {loading ? "⚙️ AI Agent Extracting..." : "⚡ Extract & Create Quiz"}
            </button>
          </form>
        </div>
      </div>

      {/* Card 3: Add Question to Quiz */}
      <div className="card admin-card" style={{ marginTop: "20px" }}>
        <h3>📝 Add Question Manually</h3>
        <p className="muted">Choose a quiz and enter question options.</p>

        <label htmlFor="selectQuiz">Select Target Quiz</label>
        <div className="quiz-select-row">
          <select id="selectQuiz" value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)}>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.subject || "General"}] {q.title} ({q.questionCount} questions &middot; {q.durationMinutes || 5} min)
              </option>
            ))}
          </select>
          {selectedQuizId && (
            <button className="btn btn-danger sm" onClick={() => handleDeleteQuiz(selectedQuizId)}>
              🗑️ Delete Quiz
            </button>
          )}
        </div>

        <label htmlFor="questionText">Question Text</label>
        <textarea
          id="questionText"
          rows="3"
          placeholder="Enter question statement..."
          value={qForm.text}
          onChange={(e) => setQForm({ ...qForm, text: e.target.value })}
        />

        <label>Answer Choices</label>
        <div className="options-input-grid">
          {qForm.o.map((val, idx) => (
            <div key={idx} className="opt-input-row">
              <span className="opt-label">{String.fromCharCode(65 + idx)}</span>
              <input
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                value={val}
                onChange={(e) =>
                  setQForm({
                    ...qForm,
                    o: qForm.o.map((x, j) => (j === idx ? e.target.value : x))
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="form-grid-2">
          <div>
            <label htmlFor="correctSelect">Correct Option</label>
            <select id="correctSelect" value={qForm.c} onChange={(e) => setQForm({ ...qForm, c: e.target.value })}>
              <option value="0">Option A</option>
              <option value="1">Option B</option>
              <option value="2">Option C</option>
              <option value="3">Option D</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary sm" style={{ marginTop: "16px" }} disabled={!selectedQuizId || loading} onClick={handleAddQuestion}>
          Save Question
        </button>
      </div>

      {/* Card 4: Questions in this quiz */}
      <div className="card admin-card" style={{ marginTop: "20px" }}>
        <h3>Current Questions in Selected Quiz ({questionsList.length})</h3>
        <div className="admin-questions-list">
          {questionsList.map((q, idx) => (
            <div className="admin-q-item" key={q.id}>
              <div className="admin-q-header">
                <b>{idx + 1}. {q.text}</b>
                <button className="delete-icon-btn" onClick={() => handleDeleteQuestion(q.id)} title="Delete Question">
                  🗑️ Delete
                </button>
              </div>
              <div className="admin-q-options">
                {q.options.map((opt, oIdx) => (
                  <span key={oIdx} className={`admin-opt-tag ${oIdx === q.correctOption ? "is-correct" : ""}`}>
                    {String.fromCharCode(65 + oIdx)}: {opt}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {!questionsList.length && <p className="muted">No questions yet in this quiz.</p>}
        </div>
      </div>
    </div>
  );
}
