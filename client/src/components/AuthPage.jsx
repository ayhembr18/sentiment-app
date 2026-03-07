import { useState } from "react";
import { API, saveAuth } from "../utils/helpers";

export default function AuthPage({ onLogin }) {
  const [mode, setMode]     = useState("login");
  const [form, setForm]     = useState({ nom: "", email: "", password: "", boutique: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body     = mode === "login"
        ? { email: form.email, password: form.password }
        : { nom: form.nom, email: form.email, password: form.password, boutique: form.boutique };

      const res  = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }

      saveAuth(data.token, data.user);
      onLogin(data.user);
    } catch { setError("Impossible de contacter le serveur"); }
    setLoading(false);
  };

  const inputStyle = { width: "100%", background: "#0d0d1a", border: "1px solid #222", borderRadius: 8, padding: "10px 14px", color: "#e0e0e0", fontSize: 14, fontFamily: "inherit", outline: "none" };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="logo-icon" style={{ width: 52, height: 52, borderRadius: 16, fontSize: 26, margin: "0 auto 12px" }}>🧠</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 22 }}>
            SentiMind <span style={{ color: "#00e5a0" }}>NLP</span>
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>
            Analyse de sentiment · FR + EN
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ borderRadius: 16, padding: 28 }}>
          {/* Toggle */}
          <div className="auth-toggle">
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} className="auth-toggle-btn" style={{
                background: mode === m ? "linear-gradient(135deg,#00e5a0,#0070f3)" : "transparent",
                color: mode === m ? "#fff" : "#555",
              }}>
                {m === "login" ? "Se connecter" : "S'inscrire"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mode === "register" && (
              <input style={inputStyle} type="text" placeholder="Nom complet *"
                value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handle()} />
            )}
            <input style={inputStyle} type="email" placeholder="Email *"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handle()} />
            <input style={inputStyle} type="password" placeholder="Mot de passe * (min. 6 caractères)"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handle()} />
            {mode === "register" && (
              <input style={inputStyle} type="text" placeholder="Nom de votre boutique (optionnel)"
                value={form.boutique} onChange={e => setForm(p => ({ ...p, boutique: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handle()} />
            )}

            {error && <div className="alert-error">⚠️ {error}</div>}

            <button onClick={handle} disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
              {loading
                ? <><div className="spinner" />Chargement...</>
                : mode === "login" ? "🔐 Se connecter" : "✨ Créer mon compte"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#444" }}>
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ color: "#00e5a0", cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "S'inscrire" : "Se connecter"}
          </span>
        </div>
      </div>
    </div>
  );
}