import { useState } from "react";
import { API, authHeaders, sentimentColor, sentimentIcon } from "../utils/helpers";

const SOURCE_INFO = {
  amazon:     {  label: "Amazon",      color: "#FF9900", hint: "https://www.amazon.fr/dp/XXXXXXXXXX" },
  trustpilot: {  label: "Trustpilot",  color: "#00b67a", hint: "https://www.trustpilot.com/review/example.com" },
  google:     {  label: "Google Maps", color: "#4285F4", hint: "https://www.google.com/maps/place/NomDuLieu" },
};

function detectSource(url) {
  if (url.includes('amazon.'))    return 'amazon';
  if (url.includes('trustpilot')) return 'trustpilot';
  if (url.includes('google.com/maps') || url.includes('goo.gl/maps')) return 'google';
  return null;
}

function MiniCard({ review }) {
  const color = sentimentColor(review.sentiment);
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "10px 14px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 12, color: "#e0e0e0" }}>{review.auteur}</span>
          <span style={{ marginLeft: 8, color: "#ffd166", fontSize: 11 }}>
            {"★".repeat(review.etoiles)}{"☆".repeat(5 - review.etoiles)}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ color, fontWeight: 700, fontSize: 12 }}>{sentimentIcon(review.sentiment)} {review.sentiment}</span>
          <span style={{ fontSize: 11, color: "#555", marginLeft: 8 }}>
            {review.score > 0 ? "+" : ""}{review.score?.toFixed(2)}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#888", fontStyle: "italic", lineHeight: 1.4,
        margin: 0, overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        "{review.text}"
      </p>
    </div>
  );
}

export default function ScraperTool({ onImport }) {
  const [url, setUrl]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const source = detectSource(url);
  const info   = SOURCE_INFO[source] || null;

  const handleScrape = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(""); setResult(null); setImported(false);
    try {
      const res  = await fetch(`${API}/scrape`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
      setResult(data);
    } catch { setError("Impossible de contacter le serveur"); }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!result?.reviews?.length) return;
    setImporting(true);
    let ok = 0;
    for (const r of result.reviews) {
      try {
        await fetch(`${API}/reviews`, {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({ text: r.text, auteur: r.auteur, etoiles: r.etoiles }),
        });
        ok++;
      } catch { /* continue */ }
    }
    setImporting(false);
    setImported(true);
    if (onImport) onImport(); // refresh dashboard
  };

  // Répartition couleur
  const barData = result ? [
    { label: "Positifs", count: result.stats.pos, color: "#00e5a0" },
    { label: "Neutres",  count: result.stats.neu, color: "#ffd166" },
    { label: "Négatifs", count: result.stats.neg, color: "#ff4d6d" },
  ] : [];

  return (
    <div style={{ maxWidth: 700, animation: "fadeUp 0.4s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(0,112,243,0.05)", border: "1px solid #0070f322", borderRadius: 12 }}>
        <span style={{ fontSize: 14, color: "#0070f3", fontWeight: 600 }}>🔗 Scraper d'avis</span>
        <span style={{ fontSize: 12, color: "#555", marginLeft: 8 }}>Amazon · Trustpilot · Google Maps → NLP direct</span>
      </div>

      {/* Sources supportées */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {Object.entries(SOURCE_INFO).map(([key, s]) => (
          <div key={key} style={{
            flex: 1, padding: "10px 12px", borderRadius: 10, textAlign: "center",
            background: source === key ? s.color + "22" : "rgba(255,255,255,0.02)",
            border: `1px solid ${source === key ? s.color + "66" : "#1a1a2e"}`,
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: source === key ? s.color : "#555" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Input URL */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
          URL de la page d'avis *
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={url} onChange={e => { setUrl(e.target.value); setError(""); setResult(null); setImported(false); }}
            onKeyDown={e => e.key === "Enter" && handleScrape()}
            placeholder={info ? `Ex: ${info.hint}` : "Collez une URL Amazon, Trustpilot ou Google Maps..."}
            style={{
              flex: 1, background: "#0d0d1a", border: `1px solid ${info ? info.color + "66" : "#222"}`,
              borderRadius: 8, padding: "10px 14px", color: "#e0e0e0",
              fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border 0.2s",
            }}
          />
          <button onClick={handleScrape} disabled={loading || !url.trim() || !source} style={{
            padding: "10px 20px", borderRadius: 8, border: "none", cursor: loading || !source ? "not-allowed" : "pointer",
            background: source && !loading ? `linear-gradient(135deg, ${info?.color || "#0070f3"}, #0070f3)` : "#1a1a2e",
            color: source && !loading ? "#fff" : "#444",
            fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", transition: "all 0.2s",
          }}>
            {loading ? " Scraping..." : " Analyser"}
          </button>
        </div>

        {/* Hint URL format */}
        {info && !result && (
          <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>
            {info.icon} {info.label} détecté — format attendu : <code style={{ color: info.color, fontSize: 10 }}>{info.hint}</code>
          </div>
        )}
        {url && !source && (
          <div style={{ fontSize: 11, color: "#ff4d6d", marginTop: 6 }}>
             URL non reconnue — supporté : amazon.fr/com · trustpilot.com · google.com/maps
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div style={{ background: "#ff4d6d18", border: "1px solid #ff4d6d33", borderRadius: 8,
          padding: "10px 14px", color: "#ff4d6d", fontSize: 13, marginBottom: 16 }}>
           {error}
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>

          {/* Stats rapides */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a2e",
              borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 700, color: "#0070f3" }}>
                {result.total}
              </div>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Avis récupérés</div>
            </div>
            {barData.map(b => (
              <div key={b.label} style={{ flex: 1, background: b.color + "11", border: `1px solid ${b.color}33`,
                borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 700, color: b.color }}>
                  {b.count}
                </div>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>{b.label}</div>
              </div>
            ))}
          </div>

          {/* Barre de sentiment */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 8, borderRadius: 999, overflow: "hidden", display: "flex" }}>
              {barData.map(b => (
                <div key={b.label} style={{
                  width: `${(b.count / result.total) * 100}%`,
                  background: b.color, transition: "width 0.8s ease",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#444" }}>
              <span style={{ color: "#00e5a0" }}>{Math.round((result.stats.pos / result.total) * 100)}% positifs</span>
              <span style={{ color: "#ffd166" }}>{Math.round((result.stats.neu / result.total) * 100)}% neutres</span>
              <span style={{ color: "#ff4d6d" }}>{Math.round((result.stats.neg / result.total) * 100)}% négatifs</span>
            </div>
          </div>

          {/* Bouton import */}
          <div style={{ marginBottom: 16 }}>
            {imported ? (
              <div style={{ background: "#00e5a022", border: "1px solid #00e5a044", borderRadius: 10,
                padding: "12px 16px", color: "#00e5a0", fontWeight: 600, textAlign: "center" }}>
                 {result.total} avis importés dans votre dashboard !
              </div>
            ) : (
              <button onClick={handleImport} disabled={importing} style={{
                width: "100%", padding: "12px", borderRadius: 10, border: "none",
                background: importing ? "#1a1a2e" : "linear-gradient(135deg,#00e5a0,#0070f3)",
                color: importing ? "#444" : "#fff", fontWeight: 700, fontSize: 14,
                cursor: importing ? "not-allowed" : "pointer", transition: "all 0.2s",
              }}>
                {importing ? "⏳ Import en cours..." : `📥 Importer les ${result.total} avis dans mon dashboard`}
              </button>
            )}
          </div>

          {/* Preview des reviews */}
          <div>
            <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Aperçu des avis analysés
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto",
              paddingRight: 4 }}>
              {result.reviews.map((r, i) => <MiniCard key={i} review={r} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}