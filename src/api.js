import { useEffect, useState } from "react";

async function request(method, path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  // expired / invalid token on a protected call: send the user back to login
  if (res.status === 401 && token && !path.startsWith("/auth")) {
    localStorage.clear();
    window.location.href = "/login";
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Something went wrong. Please try again.");
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  del: (p) => request("DELETE", p)
};

export function useApi(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    api.get(path).then((d) => alive && setData(d)).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [path]);
  return { data, error };
}
