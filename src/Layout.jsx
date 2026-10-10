import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const toggle = () => {
    const r = document.documentElement;
    const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
    r.dataset.theme = dark ? "light" : "dark";
  };
  const links = [["/", "Dashboard"], ["/quizzes", "Quizzes"], ["/leaderboard", "Leaderboard"], ["/analytics", "My analytics"]];
  if (user.role === "ADMIN") links.push(["/admin", "Admin panel"]);
  return (
    <>
      <header>
        <div className="top">
          <div className="brand">Quiz<b>Hub</b> Pro</div>
          <div className="tools">
            <span>{user.username} ({user.role.toLowerCase()})</span>
            <button className="chip" onClick={toggle}>Dark / light</button>
            <button className="chip" onClick={() => { logout(); nav("/login"); }}>Log out</button>
          </div>
        </div>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "on" : "")}>{label}</NavLink>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
