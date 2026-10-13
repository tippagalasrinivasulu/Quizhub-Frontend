import { useState, useEffect } from "react";
import { api, useApi } from "../api.js";

export default function StudentAnalytics() {
  const { data: students, loading: loadingStudents, error: studentsError } = useApi("/admin/students");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [errorAnalytics, setErrorAnalytics] = useState("");

  // Select first student automatically when students list loads
  useEffect(() => {
    if (students && students.length > 0 && !selectedEmail) {
      setSelectedEmail(students[0].email);
    }
  }, [students, selectedEmail]);

  // Load analytics when selectedEmail changes
  useEffect(() => {
    if (!selectedEmail) return;
    setLoadingAnalytics(true);
    setErrorAnalytics("");
    api.get(`/admin/students/analytics?email=${encodeURIComponent(selectedEmail)}`)
      .then((d) => setStudentData(d))
      .catch((e) => setErrorAnalytics(e.message))
      .finally(() => setLoadingAnalytics(false));
  }, [selectedEmail]);

  const filteredStudents = (students || []).filter((s) => {
    const q = searchFilter.toLowerCase().trim();
    return (
      !q ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.username && s.username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-container student-analytics-page">
      <div className="section-header">
        <div>
          <span className="badge-pill gradient-pill">📊 Student Performance Intelligence</span>
          <h1 className="hero-heading">Admin Student &amp; Subject Analytics</h1>
          <p className="hero-sub">
            Monitor registered student test results, subject-by-subject accuracy, and overall academic mastery filtered by student email.
          </p>
        </div>
      </div>

      {studentsError && <div className="msg-banner msg-error">{studentsError}</div>}

      {/* Search and Selector Bar */}
      <div className="card" style={{ marginBottom: "24px", padding: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 280px" }}>
            <label htmlFor="searchStudent" style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
              🔍 Search Registered Student by Email or Username
            </label>
            <input
              id="searchStudent"
              type="text"
              placeholder="e.g. student@college.edu or username..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ flex: "1 1 320px" }}>
            <label htmlFor="selectStudent" style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
              ✉️ Select Student by Registered Email ({filteredStudents.length} Students)
            </label>
            <select
              id="selectStudent"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              style={{ width: "100%" }}
              disabled={loadingStudents || filteredStudents.length === 0}
            >
              {filteredStudents.length === 0 ? (
                <option value="">No registered students found</option>
              ) : (
                filteredStudents.map((s) => (
                  <option key={s.id} value={s.email}>
                    {s.email} &middot; ({s.username}) &middot; {s.quizCount} quizzes &middot; {s.avgPercent}% avg
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loadingAnalytics && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing student subject performance...</p>
        </div>
      )}

      {errorAnalytics && <div className="msg-banner msg-error">{errorAnalytics}</div>}

      {/* Student Analytics Drilldown */}
      {!loadingAnalytics && studentData && (
        <>
          {/* Top Profile Summary Card */}
          <div className="dash-hero-card" style={{ marginBottom: "24px" }}>
            <div className="dash-hero-info">
              <div className="user-welcome-row">
                <div className="avatar-circle" style={{ width: "48px", height: "48px", fontSize: "20px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--acc)", color: "#fff", borderRadius: "50%", fontWeight: "bold", marginRight: "12px" }}>
                  {studentData.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: "22px", margin: 0 }}>
                    {studentData.username} <span className="muted" style={{ fontSize: "16px", fontWeight: "normal" }}>({studentData.email})</span>
                  </h2>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <span className="lvl-pill">Level {studentData.level}</span>
                    <span className={`rank-tag rank-${studentData.rank?.toLowerCase() || "bronze"}`}>
                      🛡️ {studentData.rank} Tier
                    </span>
                    <span className="badge-pill" style={{ background: "var(--bg3)", color: "var(--txt)" }}>
                      ⚡ {studentData.xp} Total XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-hero-actions" style={{ display: "flex", gap: "16px" }}>
              <div className="metric-card card" style={{ padding: "12px 20px", minWidth: "130px", textAlign: "center" }}>
                <span className="metric-icon">📝</span>
                <div className="metric-val" style={{ fontSize: "24px" }}>{studentData.totalQuizzes}</div>
                <span className="metric-label">Quizzes Taken</span>
              </div>
              <div className="metric-card card" style={{ padding: "12px 20px", minWidth: "130px", textAlign: "center" }}>
                <span className="metric-icon">🎯</span>
                <div className="metric-val" style={{ fontSize: "24px" }}>{studentData.overallAccuracy}%</div>
                <span className="metric-label">Overall Accuracy</span>
              </div>
            </div>
          </div>

          {/* Badges Earned */}
          {studentData.badges && studentData.badges.length > 0 && (
            <div className="card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "var(--mut)" }}>
                🏅 Badges Unlocked by this Student
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {studentData.badges.map((b) => (
                  <span key={b} className="reward-badge primary-badge">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SUBJECT-BY-SUBJECT PERFORMANCE GRID */}
          <div style={{ marginBottom: "28px" }}>
            <div className="section-header" style={{ marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700" }}>
                  📚 Performance in Each Subject
                </h2>
                <p className="muted" style={{ margin: 0 }}>
                  Detailed accuracy, mastery rating, and total questions attempted broken down by subject.
                </p>
              </div>
            </div>

            {(!studentData.subjectPerformance || studentData.subjectPerformance.length === 0) ? (
              <div className="card empty-state">
                <p>No subject performance recorded yet for this student.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "18px" }}>
                {studentData.subjectPerformance.map((sp) => {
                  const acc = Math.round(sp.accuracy);
                  const isGood = acc >= 75;
                  const isMid = acc >= 50 && !isGood;
                  const color = isGood ? "var(--good)" : isMid ? "var(--acc2)" : "var(--bad)";

                  return (
                    <div className="card" key={sp.subject} style={{ padding: "20px", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <span className="quiz-subject-badge">{sp.subject}</span>
                        <span className="badge-pill" style={{ fontSize: "12px", background: "var(--bg3)", fontWeight: 600 }}>
                          {sp.masteryLevel}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "14px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "14px", color: "var(--mut)" }}>Subject Accuracy</span>
                        <span style={{ fontSize: "22px", fontWeight: "800", color }}>
                          {sp.accuracy}%
                        </span>
                      </div>

                      {/* Accuracy Progress Bar */}
                      <div className="bar" style={{ height: "8px", background: "var(--bg3)", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(5, sp.accuracy))}%`,
                            height: "100%",
                            backgroundColor: color,
                            transition: "width 0.4s ease"
                          }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "12px", fontSize: "13px" }}>
                        <div>
                          <span className="muted">Quizzes Attempted:</span>
                          <div><b>{sp.quizzesTaken} tests</b></div>
                        </div>
                        <div>
                          <span className="muted">Correct Questions:</span>
                          <div><b>{sp.correctAnswers} / {sp.totalQuestions}</b></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student Quiz History Table */}
          <div className="card table-card" style={{ marginBottom: "32px" }}>
            <h3 className="table-title">Quiz History for {studentData.username} ({studentData.email})</h3>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Quiz Title</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Time</th>
                    <th>Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {(!studentData.recentAttempts || studentData.recentAttempts.length === 0) ? (
                    <tr>
                      <td colSpan="7" className="text-center muted">
                        No quiz attempts recorded yet.
                      </td>
                    </tr>
                  ) : (
                    studentData.recentAttempts.map((h) => {
                      const mins = Math.floor(h.timeTakenSeconds / 60);
                      const secs = h.timeTakenSeconds % 60;
                      return (
                        <tr key={h.id}>
                          <td>{new Date(h.takenAt).toLocaleDateString()}</td>
                          <td><b>{h.quiz}</b></td>
                          <td><span className="quiz-subject-badge">{h.subject || "General"}</span></td>
                          <td>{h.score} / {h.total}</td>
                          <td>
                            <span className={`percent-badge ${h.percent >= 75 ? "good" : h.percent >= 50 ? "mid" : "bad"}`}>
                              {h.percent}%
                            </span>
                          </td>
                          <td>{mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}</td>
                          <td><span className="reward-badge primary-badge sm">{h.badge || "Completed"}</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ALL REGISTERED STUDENTS TABLE */}
      <div className="card table-card">
        <h3 className="table-title">All Registered Students Directory ({filteredStudents.length})</h3>
        <p className="muted" style={{ padding: "0 20px 12px 20px" }}>
          Click "View Performance" on any student to review their individual subject breakdown.
        </p>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Registered Email</th>
                <th>Username</th>
                <th>Level</th>
                <th>Tier Rank</th>
                <th>Quizzes Taken</th>
                <th>Avg Accuracy</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center muted">
                    No registered students found. When students register and take tests, they will appear here.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = s.email === selectedEmail;
                  return (
                    <tr key={s.id} className={isSelected ? "highlight-user-row" : ""}>
                      <td>
                        <b>✉️ {s.email}</b>
                      </td>
                      <td>
                        <span className="table-username">{s.username}</span>
                      </td>
                      <td>
                        <span className="lvl-pill">Lv. {s.level}</span>
                      </td>
                      <td>
                        <span className={`rank-tag rank-${s.rank?.toLowerCase() || "bronze"}`}>
                          {s.rank || "Bronze"}
                        </span>
                      </td>
                      <td>{s.quizCount}</td>
                      <td>
                        <span className={`percent-badge ${s.avgPercent >= 75 ? "good" : s.avgPercent >= 50 ? "mid" : "bad"}`}>
                          {s.avgPercent}%
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn ${isSelected ? "btn-primary" : "btn-secondary"} sm`}
                          onClick={() => {
                            setSelectedEmail(s.email);
                            window.scrollTo({ top: 180, behavior: "smooth" });
                          }}
                        >
                          {isSelected ? "Currently Viewing" : "View Performance"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
