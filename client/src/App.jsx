import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api";

// ─── Helpers ──────────────────────────────────────────────────
const sentimentColor = (s) => ({
  positif: "#00e5a0",
  négatif: "#ff4d6d",
  neutre:  "#ffd166"
}[s] || "#aaa");

const sentimentIcon = (s) => ({ positif: "▲", négatif: "▼", neutre: "●" }[s] || "?");

function StarDisplay({ n }) {
  return (
    <span style={{ color: "#ffd166", letterSpacing: 1 }}>
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 30;
    const id = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(id); }
      else setDisplay(Math.round(start));
    }, 20);
    return () => clearInterval(id);
  }, [value]);
  return <>{display}</>;
}

// ─── Bar Chart ────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>{d.value}</span>
          <div style={{
            width: "100%", background: d.color, borderRadius: "4px 4px 0 0",
            height: `${(d.value / max) * 56}px`, minHeight: d.value > 0 ? 4 : 0,
            transition: "height 0.6s cubic-bezier(.4,0,.2,1)"
          }} />
          <span style={{ fontSize: 10, color: "#aaa" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────
function Sparkline({ reviews }) {
  const pts = [...reviews].reverse().slice(0, 20);
  if (pts.length < 2) return <div style={{ color: "#555", fontSize: 12 }}>Pas assez de données</div>;
  const scores = pts.map(r => r.score ?? 0);
  const W = 280, H = 50, pad = 4;
  const minS = Math.min(...scores), maxS = Math.max(...scores);
  const range = maxS - minS || 1;
  const points = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
    const y = H - pad - ((s - minS) / range) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff4d6d" />
          <stop offset="50%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#00e5a0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#sparkGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {scores.map((s, i) => {
        const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
        const y = H - pad - ((s - minS) / range) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r={3} fill={s >= 0 ? "#00e5a0" : "#ff4d6d"} />;
      })}
    </svg>
  );
}

// ─── Review Card ──────────────────────────────────────────────
function ReviewCard({ review, isNew }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);
  const sentiment = review.sentiment;
  const score     = review.score ?? 0;
  const scoreBar  = Math.round(((score + 1) / 2) * 100);

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${sentiment ? sentimentColor(sentiment) + "44" : "#333"}`,
      borderLeft: `3px solid ${sentiment ? sentimentColor(sentiment) : "#444"}`,
      borderRadius: 10, padding: "14px 16px",
      transition: "all 0.4s ease",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      position: "relative", overflow: "hidden"
    }}>
      {isNew && (
        <span style={{
          position: "absolute", top: 8, right: 8,
          background: "#00e5a022", color: "#00e5a0",
          fontSize: 9, padding: "2px 6px", borderRadius: 20, fontWeight: 700, letterSpacing: 1
        }}>NOUVEAU</span>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <span style={{ fontWeight: 600, color: "#e0e0e0", fontSize: 13 }}>{review.auteur || "Anonyme"}</span>
          <div style={{ marginTop: 2 }}><StarDisplay n={review.etoiles || 3} /></div>
          {review.lang && <span style={{ fontSize: 10, color: "#555", marginTop: 2, display: "block" }}>{review.lang === "FR" ? "🇫🇷 Français" : "🇬🇧 English"}</span>}
        </div>
        {sentiment && (
          <div style={{ textAlign: "right" }}>
            <div style={{ color: sentimentColor(sentiment), fontWeight: 700, fontSize: 13 }}>
              {sentimentIcon(sentiment)} {sentiment}
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
              Score: {score > 0 ? "+" : ""}{score.toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: "#555" }}>
              Conf: {((review.confidence || 0) * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      {/* Texte */}
      <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.5, margin: "0 0 10px 0", fontStyle: "italic" }}>
        "{review.text}"
      </p>

      {/* Score bar */}
      {sentiment && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ height: 5, background: "#1a1a2e", borderRadius: 999, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: "100%", background: "#333" }} />
            <div style={{
              position: "absolute", top: 0, height: "100%",
              left: score >= 0 ? "50%" : `${scoreBar}%`,
              width: `${Math.abs(score) * 50}%`,
              background: sentimentColor(sentiment), borderRadius: 999,
              transition: "all 0.8s ease"
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 9, color: "#ff4d6d" }}>–1</span>
            <span style={{ fontSize: 9, color: "#ffd166" }}>0</span>
            <span style={{ fontSize: 9, color: "#00e5a0" }}>+1</span>
          </div>
        </div>
      )}

      {/* Émotions */}
      {review.emotions?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          {review.emotions.map((e, i) => (
            <span key={i} style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20,
              background: sentimentColor(sentiment) + "22",
              color: sentimentColor(sentiment), fontWeight: 600
            }}>{e}</span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 10, color: "#333", marginTop: 6 }}>
        {new Date(review.createdAt).toLocaleString("fr-FR")}
      </div>
    </div>
  );
}

// ─── CSV Parser ───────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
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

// ─── APP PRINCIPALE ───────────────────────────────────────────
export default function App() {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState("dashboard");
  const [form, setForm]             = useState({ text: "", auteur: "", etoiles: 5 });
  const [filter, setFilter]         = useState("tous");
  const [newestId, setNewestId]     = useState(null);
  const [csvDrag, setCsvDrag]       = useState(false);
  const [serverOk, setServerOk]     = useState(null);
  const fileRef = useRef();

  // Vérifier connexion backend + charger les avis
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res  = await fetch(`${API}/reviews`);
      const data = await res.json();
      setReviews(data);
      setServerOk(true);
    } catch (e) {
      setServerOk(false);
    }
  };

  // Soumettre un avis manuel → backend → NLP → MongoDB
  const handleSubmit = async () => {
    if (!form.text.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text:    form.text,
          auteur:  form.auteur || "Anonyme",
          etoiles: form.etoiles,
        }),
      });
      const saved = await res.json();
      // Recharger la liste et marquer le nouveau
      await fetchReviews();
      setNewestId(saved._id);
      setForm({ text: "", auteur: "", etoiles: 5 });
      setActiveTab("reviews");
    } catch (e) {
      alert("❌ Erreur : vérifie que le serveur tourne sur le port 5000");
    }
    setLoading(false);
  };

  // Import CSV → envoyer chaque ligne au backend
  const handleCSV = async (file) => {
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length === 0) {
      alert("❌ Fichier CSV vide ou format incorrect");
      return;
    }
    setActiveTab("reviews");
    for (const row of rows) {
      try {
        await fetch(`${API}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text:    row.text,
            auteur:  row.auteur || "Anonyme",
            etoiles: row.etoiles || 3,
          }),
        });
        // Recharger après chaque avis pour voir en temps réel
        await fetchReviews();
      } catch (e) {
        console.error("Erreur sur:", row.text, e);
      }
    }
    // Rechargement final
    await fetchReviews();
  };

  // Stats
  const analyzed    = reviews.filter(r => r.sentiment);
  const pos         = analyzed.filter(r => r.sentiment === "positif").length;
  const neg         = analyzed.filter(r => r.sentiment === "négatif").length;
  const neu         = analyzed.filter(r => r.sentiment === "neutre").length;
  const avgScore    = analyzed.length ? analyzed.reduce((a, r) => a + (r.score || 0), 0) / analyzed.length : 0;
  const satisfaction = analyzed.length ? Math.round((pos / analyzed.length) * 100) : 0;
  const filtered    = filter === "tous" ? reviews : reviews.filter(r => r.sentiment === filter);

  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "reviews",   label: "💬 Avis" },
    { id: "ajouter",   label: "✍️ Ajouter" },
    { id: "import",    label: "📂 Import CSV" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", color: "#e0e0e0",
      fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        textarea:focus, input:focus { outline: none; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg,#0d0d1a 0%,#12121f 100%)",
        borderBottom: "1px solid #1a1a2e", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#00e5a0,#0070f3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>🧠</div>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>
              SentiMind <span style={{ color: "#00e5a0" }}>NLP</span>
            </div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, textTransform: "uppercase" }}>
              Modèle maison · FR + EN · MERN Stack
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Statut serveur */}
          <div style={{
            background: serverOk === null ? "#33330022" : serverOk ? "#00e5a022" : "#ff4d6d22",
            border: `1px solid ${serverOk === null ? "#555" : serverOk ? "#00e5a044" : "#ff4d6d44"}`,
            color: serverOk === null ? "#555" : serverOk ? "#00e5a0" : "#ff4d6d",
            fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: serverOk === null ? "#555" : serverOk ? "#00e5a0" : "#ff4d6d",
              animation: serverOk === null ? "pulse 1s infinite" : "none"
            }} />
            {serverOk === null ? "Connexion…" : serverOk ? "Backend connecté" : "Backend hors ligne"}
          </div>

          <div style={{
            background: "#0070f322", border: "1px solid #0070f344",
            color: "#0070f3", fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600
          }}>
            {reviews.length} avis · NLP maison 95%
          </div>
        </div>
      </div>

      {/* Alerte backend hors ligne */}
      {serverOk === false && (
        <div style={{
          background: "#ff4d6d18", border: "1px solid #ff4d6d33",
          padding: "10px 24px", fontSize: 12, color: "#ff4d6d",
          display: "flex", alignItems: "center", gap: 8
        }}>
          ⚠️ Le backend n'est pas accessible. Lance <code style={{ background: "#ff4d6d22", padding: "1px 6px", borderRadius: 4 }}>node index.js</code> dans le dossier <code style={{ background: "#ff4d6d22", padding: "1px 6px", borderRadius: 4 }}>server/</code>
        </div>
      )}

      {/* ── TABS ── */}
      <div style={{
        background: "#0d0d1a", borderBottom: "1px solid #1a1a2e",
        padding: "0 24px", display: "flex", gap: 4
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "12px 16px", fontSize: 13, fontWeight: 500,
            color: activeTab === t.id ? "#00e5a0" : "#555",
            borderBottom: `2px solid ${activeTab === t.id ? "#00e5a0" : "transparent"}`,
            transition: "all 0.2s", fontFamily: "inherit"
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── CONTENU ── */}
      <div style={{ flex: 1, padding: 24, maxWidth: 900, margin: "0 auto", width: "100%" }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total Avis",    value: reviews.length,   color: "#0070f3", icon: "📝", raw: reviews.length },
                { label: "Satisfaction",  value: satisfaction+"%", color: "#00e5a0", icon: "✅", raw: satisfaction },
                { label: "Score Moyen",   value: (avgScore >= 0 ? "+" : "") + avgScore.toFixed(2), color: avgScore >= 0 ? "#00e5a0" : "#ff4d6d", icon: "📈" },
                { label: "À surveiller", value: neg,              color: "#ff4d6d", icon: "⚠️", raw: neg },
              ].map((k, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${k.color}33`,
                  borderRadius: 12, padding: "16px",
                  borderTop: `3px solid ${k.color}`
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: "'Space Mono',monospace" }}>
                    {k.raw !== undefined
                      ? k.label === "Satisfaction" ? <><AnimatedNumber value={k.raw} />%</> : <AnimatedNumber value={k.raw} />
                      : k.value}
                  </div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Graphiques */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a2e", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Répartition des sentiments</div>
                <BarChart data={[
                  { label: "Positifs", value: pos, color: "#00e5a0" },
                  { label: "Neutres",  value: neu, color: "#ffd166" },
                  { label: "Négatifs", value: neg, color: "#ff4d6d" },
                ]} />
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a2e", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Évolution du Score</div>
                <Sparkline reviews={analyzed} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: "#ff4d6d" }}>← Négatif</span>
                  <span style={{ fontSize: 10, color: "#00e5a0" }}>Positif →</span>
                </div>
              </div>
            </div>

            {/* Barre satisfaction */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a2e", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Indice de Satisfaction Global</span>
                <span style={{ fontFamily: "'Space Mono',monospace", color: "#00e5a0", fontWeight: 700 }}>{satisfaction}%</span>
              </div>
              <div style={{ background: "#1a1a2e", borderRadius: 999, height: 10, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  background: satisfaction >= 70
                    ? "linear-gradient(90deg,#00e5a0,#0070f3)"
                    : satisfaction >= 40
                    ? "linear-gradient(90deg,#ffd166,#ff8c00)"
                    : "linear-gradient(90deg,#ff4d6d,#c0392b)",
                  width: `${satisfaction}%`, transition: "width 1s ease"
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#444" }}>
                <span>🔴 {neg} négatifs</span>
                <span>🟡 {neu} neutres</span>
                <span>🟢 {pos} positifs</span>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === "reviews" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {["tous","positif","neutre","négatif"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  background: filter === f ? sentimentColor(f === "tous" ? "neutre" : f) + "22" : "transparent",
                  border: `1px solid ${filter === f ? sentimentColor(f === "tous" ? "neutre" : f) : "#333"}`,
                  color: filter === f ? sentimentColor(f === "tous" ? "neutre" : f) : "#666",
                  borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 600, transition: "all 0.2s"
                }}>
                  {f === "tous" ? "Tous" : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== "tous" && ` (${reviews.filter(r => r.sentiment === f).length})`}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#444", alignSelf: "center" }}>
                {filtered.length} résultat(s)
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0
                ? <div style={{ textAlign: "center", color: "#444", padding: 40 }}>Aucun avis pour ce filtre.</div>
                : filtered.map(r => <ReviewCard key={r._id} review={r} isNew={r._id === newestId} />)
              }
            </div>
          </div>
        )}

        {/* AJOUTER */}
        {activeTab === "ajouter" && (
          <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 560 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a2e", borderRadius: 16, padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Nouvel Avis Client</div>
                <div style={{ fontSize: 12, color: "#555" }}>Analysé par le modèle NLP maison (95% accuracy · FR + EN)</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Auteur</label>
                  <input
                    value={form.auteur}
                    onChange={e => setForm(p => ({ ...p, auteur: e.target.value }))}
                    placeholder="Nom du client..."
                    style={{ width: "100%", background: "#0d0d1a", border: "1px solid #222", borderRadius: 8, padding: "10px 14px", color: "#e0e0e0", fontSize: 14, fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Note ({form.etoiles} ★)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setForm(p => ({ ...p, etoiles: n }))} style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 24, color: n <= form.etoiles ? "#ffd166" : "#333",
                        transition: "transform 0.1s", padding: 0
                      }}>★</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Texte de l'avis *</label>
                  <textarea
                    value={form.text}
                    onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                    placeholder="Saisissez l'avis client ici... (FR ou EN)"
                    rows={4}
                    style={{ width: "100%", background: "#0d0d1a", border: "1px solid #222", borderRadius: 8, padding: "10px 14px", color: "#e0e0e0", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.text.trim() || !serverOk}
                  style={{
                    background: loading || !form.text.trim() || !serverOk
                      ? "#1a1a2e"
                      : "linear-gradient(135deg,#00e5a0,#0070f3)",
                    border: "none", borderRadius: 10, padding: "12px 24px",
                    color: loading || !form.text.trim() || !serverOk ? "#444" : "#fff",
                    fontWeight: 700, fontSize: 14,
                    cursor: loading || !form.text.trim() || !serverOk ? "not-allowed" : "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8, transition: "all 0.3s"
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Analyse NLP en cours...
                    </>
                  ) : !serverOk ? "⚠️ Backend hors ligne" : "🧠 Analyser & Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMPORT CSV */}
        {activeTab === "import" && (
          <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 560 }}>
            <div
              onDragOver={e => { e.preventDefault(); setCsvDrag(true); }}
              onDragLeave={() => setCsvDrag(false)}
              onDrop={e => { e.preventDefault(); setCsvDrag(false); const f = e.dataTransfer.files[0]; if (f) handleCSV(f); }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${csvDrag ? "#00e5a0" : "#333"}`,
                borderRadius: 16, padding: 48, textAlign: "center",
                cursor: "pointer", transition: "all 0.3s",
                background: csvDrag ? "#00e5a011" : "rgba(255,255,255,0.02)"
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Glissez un fichier CSV ici</div>
              <div style={{ fontSize: 12, color: "#555" }}>ou cliquez pour sélectionner</div>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
                onChange={e => { if (e.target.files[0]) handleCSV(e.target.files[0]); }} />
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a2e", borderRadius: 12, padding: 16, marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#888" }}>FORMAT ATTENDU</div>
              <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12, fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#00e5a0", lineHeight: 1.8 }}>
                text,auteur,etoiles<br />
                "Super produit!",Marie,5<br />
                "Not good at all",John,1<br />
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
                Colonnes: text/avis/comment · auteur/author/nom · etoiles/stars/note
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #111", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#333", fontFamily: "'Space Mono',monospace" }}>
          MERN Stack · NLP Maison · MongoDB Atlas · React + Vite
        </span>
        <span style={{ fontSize: 10, color: "#333" }}>
          {analyzed.length}/{reviews.length} analysés
        </span>
      </div>
    </div>
  );
}