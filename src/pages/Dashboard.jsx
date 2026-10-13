import { Link } from "react-router-dom";
import { useApi } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  // Student specific data
  const studentResults = useApi(isAdmin ? null : "/results/me");
  const profile = useApi(isAdmin ? null : "/users/profile");

  // Admin specific data
  const adminStats = useApi(isAdmin ? "/admin/dashboard" : null);

  if (isAdmin) {
    const stats = adminStats.data || {
      totalStudents: 0,
      totalQuizzes: 0,
      totalQuestions: 0,
      totalSubmissions: 0,
      recentSubmissions: []
    };

    return (
      <div className="page-container dashboard-page">
        {/* Admin Welcome Banner */}
        <div className="dash-hero-card">
          <div className="dash-hero-info">
            <div className="user-welcome-row">
              <h1 className="hero-heading">Welcome, Administrator {user?.username}!</h1>
              <span className="rank-tag rank-grandmaster">🛡️ System Admin</span>
              <span className="lvl-pill">QuizHub Console</span>
            </div>
            <p className="hero-sub">
              QuizHub Administration Hub. Manage academic subjects, set exam timers, extract PYQs from PDF notes with AI, and track student mastery.
            </p>
          </div>
          <div className="dash-hero-actions">
            <Link to="/admin" className="btn btn-primary sm">
              ⚙️ Admin Hub
            </Link>
            <Link to="/admin/students" className="btn btn-secondary sm">
              📊 Student Analytics
            </Link>
            <Link to="/ai-studio" className="btn btn-secondary sm">
              🤖 AI PYQ Studio
            </Link>
          </div>
        </div>

        {/* High Scale Admin Metrics Grid */}
        <div className="stats-metric-grid">
          <div className="metric-card card">
            <span className="metric-icon">🎓</span>
            <div className="metric-val">{stats.totalStudents}</div>
            <span className="metric-label">Registered Students</span>
          </div>
          <div className="metric-card card">
            <span className="metric-icon">📚</span>
            <div className="metric-val">{stats.totalQuizzes}</div>
            <span className="metric-label">Published Quizzes</span>
          </div>
          <div className="metric-card card">
            <span className="metric-icon">❓</span>
            <div className="metric-val">{stats.totalQuestions}</div>
            <span className="metric-label">Total MCQs in DB</span>
          </div>
          <div className="metric-card card">
            <span className="metric-icon">📝</span>
            <div className="metric-val">{stats.totalSubmissions}</div>
            <span className="metric-label">Total Student Attempts</span>
          </div>
        </div>

        {/* Recent Student Submissions Table */}
        <div className="card table-card" style={{ marginTop: "24px" }}>
          <div className="card-header-flex">
            <div>
              <h3>Recent Student Submissions</h3>
              <p className="muted">Live feed of quizzes and PYQs submitted by registered students.</p>
            </div>
            <Link to="/admin/students" className="btn btn-secondary sm">
              View Detailed Analytics by Email
            </Link>
          </div>

          {adminStats.loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading real-time submissions...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Email</th>
                    <th>Username</th>
                    <th>Quiz Title</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                    stats.recentSubmissions.map((s) => (
                      <tr key={s.id}>
                        <td>{new Date(s.takenAt).toLocaleDateString()}</td>
                        <td><b>✉️ {s.email}</b></td>
                        <td><span className="table-username">{s.username}</span></td>
                        <td>{s.quizTitle}</td>
                        <td><span className="quiz-subject-badge">{s.subject || "General"}</span></td>
                        <td>{s.score}/{s.total}</td>
                        <td>
                          <span className={`percent-badge ${s.percent >= 75 ? "good" : s.percent >= 50 ? "mid" : "bad"}`}>
                            {s.percent}%
                          </span>
                        </td>
                        <td><span className="reward-badge primary-badge sm">{s.badge || "Completed"}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center muted">
                        No student test submissions yet. When registered students take quizzes, their attempts will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STUDENT VIEW
  const results = studentResults.data || [];
  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.percent, 0) / results.length) : 0;
  const best = results.length ? Math.max(...results.map((r) => r.percent)) : 0;
  const xp = profile.data?.xp || user?.xp || 0;
  const level = profile.data?.level || user?.level || 1;
  const rank = profile.data?.rank || user?.rank || "Bronze";

  if (studentResults.error) return <div className="msg-banner msg-error">{studentResults.error}</div>;

  return (
    <div className="page-container dashboard-page">
      {/* Welcome Banner */}
      <div className="dash-hero-card">
        <div className="dash-hero-info">
          <div className="user-welcome-row">
            <h1 className="hero-heading">Welcome back, {user?.username}!</h1>
            <span className={`rank-tag rank-${rank.toLowerCase()}`}>🛡️ {rank} Tier</span>
            <span className="lvl-pill">Level {level}</span>
          </div>
          <p className="hero-sub">
            Your personalized learning dashboard. Test yourself with timed quizzes or import PYQ exam papers via AI.
          </p>
        </div>
        <div className="dash-hero-actions">
          <Link to="/quizzes" className="btn btn-primary sm">
            🚀 Browse Quizzes
          </Link>
          <Link to="/ai-studio" className="btn btn-secondary sm">
            🤖 AI PYQ Studio
          </Link>
        </div>
      </div>

      {/* High Scale Metrics Grid */}
      <div className="stats-metric-grid">
        <div className="metric-card card">
          <span className="metric-icon">📝</span>
          <div className="metric-val">{results.length}</div>
          <span className="metric-label">Quizzes Completed</span>
        </div>
        <div className="metric-card card">
          <span className="metric-icon">🎯</span>
          <div className="metric-val">{avg}%</div>
          <span className="metric-label">Average Accuracy</span>
        </div>
        <div className="metric-card card">
          <span className="metric-icon">⭐</span>
          <div className="metric-val">{best}%</div>
          <span className="metric-label">Personal Best</span>
        </div>
        <div className="metric-card card">
          <span className="metric-icon">⚡</span>
          <div className="metric-val">{xp}</div>
          <span className="metric-label">Experience Points</span>
        </div>
      </div>

      {/* Recent Attempts Table Card */}
      <div className="card table-card" style={{ marginTop: "24px" }}>
        <div className="card-header-flex">
          <div>
            <h3>Recent Quiz Attempts</h3>
            <p className="muted">Your most recent mock tests and previous year papers.</p>
          </div>
          <Link to="/quizzes" className="btn btn-secondary sm">
            Start New Quiz
          </Link>
        </div>

        {studentResults.loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading activity...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Quiz Title</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Badge Awarded</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.takenAt).toLocaleDateString()}</td>
                    <td><b>{r.quiz}</b></td>
                    <td><span className="quiz-subject-badge">{r.subject || "General"}</span></td>
                    <td>{r.score}/{r.total}</td>
                    <td>
                      <span className={`percent-badge ${r.percent >= 75 ? "good" : r.percent >= 50 ? "mid" : "bad"}`}>
                        {r.percent}%
                      </span>
                    </td>
                    <td><span className="reward-badge primary-badge sm">{r.badge || "Passed"}</span></td>
                  </tr>
                ))}
                {!results.length && (
                  <tr>
                    <td colSpan="6" className="text-center muted">
                      No attempts yet. Explore the quizzes or try our AI PYQ Studio!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
