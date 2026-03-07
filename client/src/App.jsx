import { useState } from "react";
import { getUser, saveAuth, clearAuth } from "./utils/helpers";
import AuthPage  from "./components/authpage";
import Dashboard from "./components/Dashboard";
import "./styles/app.css";

export default function App() {
  const [user, setUser] = useState(getUser());

  const handleLogin  = (u) => { setUser(u); };
  const handleLogout = () => { clearAuth(); setUser(null); };

  if (!user) return <AuthPage onLogin={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}