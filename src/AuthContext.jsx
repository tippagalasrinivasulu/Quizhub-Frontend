import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const save = (d) => {
    const u = { username: d.username, role: d.role };
    localStorage.setItem("token", d.token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); };
  return <Ctx.Provider value={{ user, save, logout }}>{children}</Ctx.Provider>;
}
