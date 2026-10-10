import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [f, setF] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { save } = useAuth();
  const nav = useNavigate();
  const login = tab === "login";
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const body = login ? { username: f.username.trim(), password: f.password } : { ...f, username: f.username.trim() };
      save(await api.post(login ? "/auth/login" : "/auth/register", body));
      nav("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main>
      <div className="card auth">
        <div className="side">
          <div className="brand" style={{ color: "#fff" }}>QuizHub Pro</div>
          <h1>Learn. Practice. Test. Improve.</h1>
          <ul>
            <li>Timed quizzes with auto-submit</li>
            <li>Question palette and review flags</li>
            <li>Leaderboard and score analytics</li>
            <li>Admin panel to manage questions</li>
          </ul>
        </div>
        <form className="form" onSubmit={submit}>
          <div className="tabs">
            <button type="button" className={login ? "on" : ""} onClick={() => { setTab("login"); setError(""); }}>Login</button>
            <button type="button" className={login ? "" : "on"} onClick={() => { setTab("reg"); setError(""); }}>Register</button>
          </div>
          <label htmlFor="u">Username</label>
          <input id="u" value={f.username} onChange={set("username")} autoComplete="username" required />
          {!login && (<><label htmlFor="e">Email</label><input id="e" type="email" value={f.email} onChange={set("email")} required /></>)}
          <label htmlFor="p">Password</label>
          <input id="p" type="password" value={f.password} onChange={set("password")} autoComplete={login ? "current-password" : "new-password"} required />
          {error && <div className="msg err">{error}</div>}
          <button className="btn" disabled={busy}>{busy ? "Please wait..." : login ? "Sign in" : "Create account"}</button>
          {login && <p className="hint">Demo logins: <b>demo / demo123</b> (student), <b>admin / admin123</b> (admin).</p>}
        </form>
      </div>
    </main>
  );
}
