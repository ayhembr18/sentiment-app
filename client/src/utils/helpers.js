// ── Sentiment helpers ──────────────────────────────────────────
export const sentimentColor = (s) => ({
  positif: "#00e5a0",
  négatif: "#ff4d6d",
  neutre:  "#ffd166",
}[s] || "#aaa");

export const sentimentIcon = (s) => ({
  positif: "▲",
  négatif: "▼",
  neutre:  "●",
}[s] || "?");

// ── Auth helpers ───────────────────────────────────────────────
export const getToken  = () => localStorage.getItem("token");
export const getUser   = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
export const saveAuth  = (token, user) => { localStorage.setItem("token", token); localStorage.setItem("user", JSON.stringify(user)); };
export const clearAuth = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); };
export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── CSV Parser ─────────────────────────────────────────────────
export function parseCSV(text) {
  const lines   = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",");
    const obj  = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").trim().replace(/^"|"$/g, ""); });
    return {
      text:    obj.text || obj.avis || obj.comment || "",
      auteur:  obj.auteur || obj.author || obj.nom || "Anonyme",
      etoiles: parseInt(obj.etoiles || obj.stars || obj.note || "3") || 3,
    };
  }).filter(r => r.text);
}

// ── API base URL ───────────────────────────────────────────────
export const API = "http://localhost:5000/api";