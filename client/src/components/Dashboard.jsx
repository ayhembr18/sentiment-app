import { useState, useEffect, useRef } from "react";
import { API, authHeaders, parseCSV, sentimentColor } from "../utils/helpers";
import { exportPDF } from "../utils/exportPDF";
import ReviewCard  from "./ReviewCard";
import BarChart    from "./BarChart";
import Sparkline   from "./Sparkiline";
import AdminPanel  from "./AdminPanel";
import ScraperTool   from "./ScraperTool";
import InsightsPanel from "./Insightspanel";

function AnimatedNumber({ value }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    let s = 0; const step = value / 30;
    const id = setInterval(() => {
      s += step;
      if (s >= value) { setD(value); clearInterval(id); }
      else setD(Math.round(s));
    }, 20);
    return () => clearInterval(id);
  }, [value]);
  return <>{d}</>;
}

export default function Dashboard({ user, onLogout }) {
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm]           = useState({ text: "", auteur: "", etoiles: 5 });
  const [filter, setFilter]       = useState("tous");
  const [newestId, setNewestId]   = useState(null);
  const [csvDrag, setCsvDrag]     = useState(false);
  const [serverOk, setServerOk]   = useState(null);
  const [pendingFlags, setPendingFlags] = useState(0);
  const [insights, setInsights]       = useState(null);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const fileRef = useRef();

  const isAdmin = user?.role === "admin";

  const TABS = [
    { id: "dashboard", label: " Dashboard" },
    { id: "reviews",   label: " Avis" },
    { id: "ajouter",   label: "️ Ajouter" },
    { id: "import",    label: " Import CSV" },
    { id: "scraper",   label: " Scraper" },
    { id: "insights",  label: " Insights" },
    ...(isAdmin ? [{ id: "admin", label: `️ Admin${pendingFlags > 0 ? ` (${pendingFlags})` : ""}` }] : []),
  ];

  const fetchReviews = async () => {
    try {
      const res  = await fetch(`${API}/reviews`, { headers: authHeaders() });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setReviews(data); setServerOk(true);
    } catch { setServerOk(false); }
  };

  const fetchPendingFlags = async () => {
    if (!isAdmin) return;
    try {
      const res  = await fetch(`${API}/flags/stats`, { headers: authHeaders() });
      const data = await res.json();
      setPendingFlags(data.pending || 0);
    } catch { /* silencieux */ }
  };

  useEffect(() => {
    fetchReviews();
    fetchPendingFlags();
  }, []);

  // Rafraîchit le badge admin toutes les 30s
  useEffect(() => {
    if (!isAdmin) return;
    const id = setInterval(fetchPendingFlags, 30000);
    return () => clearInterval(id);
  }, [isAdmin]);

  const handleSubmit = async () => {
    if (!form.text.trim()) return;
    setLoading(true);
    try {
      const res   = await fetch(`${API}/reviews`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ text: form.text, auteur: form.auteur || "Anonyme", etoiles: form.etoiles }),
      });
      if (res.status === 401) { onLogout(); return; }
      const saved = await res.json();
      await fetchReviews();
      setNewestId(saved._id);
      setForm({ text: "", auteur: "", etoiles: 5 });
      setActiveTab("reviews");
    } catch { alert(" Erreur serveur"); }
    setLoading(false);
  };

  const handleCSV = async (file) => {
    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) { alert(" CSV vide ou format incorrect"); return; }
    setActiveTab("reviews");
    for (const row of rows) {
      try {
        await fetch(`${API}/reviews`, {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({ text: row.text, auteur: row.auteur || "Anonyme", etoiles: row.etoiles || 3 }),
        });
      } catch (e) { console.error(e); }
    }
    await fetchReviews();
  };

  // Stats
  const analyzed     = reviews.filter(r => r.sentiment);
  const pos          = analyzed.filter(r => r.sentiment === "positif").length;
  const neg          = analyzed.filter(r => r.sentiment === "négatif").length;
  const neu          = analyzed.filter(r => r.sentiment === "neutre").length;
  const avgScore     = analyzed.length ? analyzed.reduce((a, r) => a + (r.score || 0), 0) / analyzed.length : 0;
  const satisfaction = analyzed.length ? Math.round((pos / analyzed.length) * 100) : 0;
  const filtered     = filter === "tous" ? reviews : reviews.filter(r => r.sentiment === filter);

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="header">
        <div className="header-logo">
          <div className="logo-icon"></div>
          <div>
            <div className="logo-title">SentiMind <span>NLP</span></div>
            <div className="logo-sub">Modèle maison · FR + EN · MERN</div>
          </div>
        </div>
        <div className="header-right">
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0" }}>
              {isAdmin && <span style={{ color: "#ffd166", marginRight: 4 }}>️</span>}
              {user.nom}
            </div>
            {user.boutique && <div style={{ fontSize: 10, color: "#555" }}> {user.boutique}</div>}
            {isAdmin && <div style={{ fontSize: 10, color: "#ffd166" }}>Administrateur</div>}
          </div>
          <span className={`badge ${serverOk ? "badge-success" : "badge-error"}`}>
            {serverOk ? "● Connecté" : "Hors ligne"}
          </span>
          <button
            onClick={async () => {
              setPdfLoading(true);
              try { await exportPDF({ user, reviews, insights }); }
              catch(e) { alert("Erreur PDF: " + e.message); }
              setPdfLoading(false);
            }}
            disabled={pdfLoading || reviews.length === 0}
            style={{
              background: "linear-gradient(135deg,#a78bfa,#0070f3)",
              border: "none", borderRadius: 8, padding: "6px 14px",
              fontSize: 12, cursor: reviews.length > 0 ? "pointer" : "not-allowed",
              color: "#fff", fontWeight: 700, opacity: reviews.length === 0 ? 0.4 : 1,
            }}>
            {pdfLoading ? "Chargement..." : " Export PDF"}
          </button>
          <button onClick={onLogout} className="btn-logout">Deconnexion</button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`tab-btn ${activeTab === t.id ? "active" : "inactive"}`}
            style={t.id === "admin" && pendingFlags > 0 ? { color: "#ffd166" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENU */}
      <div className="content">

        {/* ── DASHBOARD ────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="fade-up">
            <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(0,229,160,0.05)", border: "1px solid #00e5a022", borderRadius: 12 }}>
              <span style={{ fontSize: 14, color: "#00e5a0", fontWeight: 600 }}> Bonjour {user.nom} !</span>
              <span style={{ fontSize: 13, color: "#555", marginLeft: 8 }}>Voici l'analyse de vos {reviews.length} avis clients.</span>
            </div>

            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                { label: "Total Avis",    color: "#0070f3", anim: reviews.length },
                { label: "Satisfaction",  color: "#00e5a0", anim: satisfaction, pct: true },
                { label: "Score Moyen",   color: avgScore >= 0 ? "#00e5a0" : "#ff4d6d", val: (avgScore >= 0 ? "+" : "") + avgScore.toFixed(2) },
                { label: "À surveiller", color: "#ff4d6d", anim: neg },
              ].map((k, i) => (
                <div key={i} className="kpi-card" style={{ borderColor: k.color, borderTopColor: k.color }}>
                  <div className="kpi-value" style={{ color: k.color }}>
                    {k.anim !== undefined
                      ? k.pct ? <><AnimatedNumber value={k.anim} />%</> : <AnimatedNumber value={k.anim} />
                      : k.val}
                  </div>
                  <div className="kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title">Répartition des sentiments</div>
                <BarChart data={[
                  { label: "Positifs", value: pos, color: "#00e5a0" },
                  { label: "Neutres",  value: neu, color: "#ffd166" },
                  { label: "Négatifs", value: neg, color: "#ff4d6d" },
                ]} />
              </div>
              <div className="card">
                <div className="section-title">Évolution du score</div>
                <Sparkline reviews={analyzed} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: "#ff4d6d" }}>← Négatif</span>
                  <span style={{ fontSize: 10, color: "#00e5a0" }}>Positif →</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="section-title" style={{ marginBottom: 0 }}>Indice de satisfaction global</span>
                <span style={{ fontFamily: "'Space Mono',monospace", color: "#00e5a0", fontWeight: 700 }}>{satisfaction}%</span>
              </div>
              <div className="sat-bar-track">
                <div className="sat-bar-fill" style={{
                  width: `${satisfaction}%`,
                  background: satisfaction >= 70
                    ? "linear-gradient(90deg,#00e5a0,#0070f3)"
                    : satisfaction >= 40 ? "linear-gradient(90deg,#ffd166,#ff8c00)"
                    : "linear-gradient(90deg,#ff4d6d,#c0392b)"
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#444" }}>
                <span> {neg} négatifs</span>
                <span> {neu} neutres</span>
                <span> {pos} positifs</span>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS ──────────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div className="fade-up">
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {["tous","positif","neutre","négatif"].map(f => (
                <button key={f} onClick={() => setFilter(f)} className="filter-btn" style={{
                  background: filter === f ? sentimentColor(f === "tous" ? "neutre" : f) + "22" : "transparent",
                  borderColor: filter === f ? sentimentColor(f === "tous" ? "neutre" : f) : "#333",
                  color: filter === f ? sentimentColor(f === "tous" ? "neutre" : f) : "#666",
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

        {/* ── AJOUTER ──────────────────────────────────────────── */}
        {activeTab === "ajouter" && (
          <div className="fade-up" style={{ maxWidth: 560 }}>
            <div className="card" style={{ borderRadius: 16, padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Nouvel Avis Client</div>
                <div style={{ fontSize: 12, color: "#555" }}>Analysé par le modèle NLP · FR + EN</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Auteur</label>
                  <input className="form-input" value={form.auteur}
                    onChange={e => setForm(p => ({ ...p, auteur: e.target.value }))}
                    placeholder="Nom du client..." />
                </div>
                <div>
                  <label className="form-label">Note ({form.etoiles} )</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setForm(p => ({ ...p, etoiles: n }))}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24,
                          color: n <= form.etoiles ? "#ffd166" : "#333", padding: 0 }}></button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Texte de l'avis *</label>
                  <textarea className="form-input" value={form.text}
                    onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                    placeholder="Saisissez l'avis ici... (FR ou EN)" rows={4}
                    style={{ resize: "vertical" }} />
                </div>
                <button onClick={handleSubmit} disabled={loading || !form.text.trim()} className="btn-primary">
                  {loading ? <><div className="spinner" />Analyse NLP...</> : " Analyser & Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── IMPORT CSV ───────────────────────────────────────── */}
        {activeTab === "import" && (
          <div className="fade-up" style={{ maxWidth: 560 }}>
            <div
              className="drop-zone"
              onDragOver={e => { e.preventDefault(); setCsvDrag(true); }}
              onDragLeave={() => setCsvDrag(false)}
              onDrop={e => { e.preventDefault(); setCsvDrag(false); const f = e.dataTransfer.files[0]; if (f) handleCSV(f); }}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${csvDrag ? "#00e5a0" : "#333"}`, background: csvDrag ? "#00e5a011" : "rgba(255,255,255,0.02)" }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}></div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Glissez un fichier CSV ici</div>
              <div style={{ fontSize: 12, color: "#555" }}>ou cliquez pour sélectionner</div>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
                onChange={e => { if (e.target.files[0]) handleCSV(e.target.files[0]); }} />
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#888" }}>FORMAT ATTENDU</div>
              <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12, fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#00e5a0", lineHeight: 1.8 }}>
                text,auteur,etoiles<br />"Super produit!",Marie,5<br />"Not good at all",John,1
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
                Colonnes: text/avis/comment · auteur/author/nom · etoiles/stars/note
              </div>
            </div>
          </div>
        )}

        {/* ── SCRAPER ──────────────────────────────────────────── */}
        {activeTab === "scraper" && (
          <div className="fade-up">
            <ScraperTool onImport={() => { fetchReviews(); setActiveTab("reviews"); }} />
          </div>
        )}

        {/* ── INSIGHTS ─────────────────────────────────────────── */}
        {activeTab === "insights" && (
          <div className="fade-up">
            <InsightsPanel reviewCount={reviews.length} onInsightsReady={setInsights} />
          </div>
        )}

        {/* ── ADMIN ────────────────────────────────────────────── */}
        {activeTab === "admin" && isAdmin && <AdminPanel />}

        {/* Accès refusé si non-admin essaie d'accéder à /admin */}
        {activeTab === "admin" && !isAdmin && (
          <div style={{ textAlign: "center", color: "#ff4d6d", padding: 60 }}>
             Accès réservé aux administrateurs
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="footer">
        <span>MERN Stack · NLP Maison · MongoDB Atlas · React + Vite</span>
        <span>{analyzed.length}/{reviews.length} analysés</span>
      </div>
    </div>
  );
}