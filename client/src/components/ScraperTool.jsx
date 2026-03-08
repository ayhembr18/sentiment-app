import { useState } from "react";
import { API, authHeaders, sentimentColor, sentimentIcon } from "../utils/helpers";

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
          <span style={{ color, fontWeight: 700, fontSize: 12 }}>
            {sentimentIcon(review.sentiment)} {review.sentiment}
          </span>
          <span style={{ fontSize: 11, color: "#555", marginLeft: 8 }}>
            {review.score > 0 ? "+" : ""}{review.score?.toFixed(2)}
          </span>
        </div>
      </div>
      <p style={{
        fontSize: 12, color: "#888", fontStyle: "italic", lineHeight: 1.4, margin: 0,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
      }}>
        "{review.text}"
      </p>
    </div>
  );
}

export default function ScraperTool({ onImport }) {
  const [url, setUrl]             = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported]   = useState(false);

  const isGoogleMaps = url.includes('google.com/maps') || url.includes('goo.gl/maps');

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
    for (const r of result.reviews) {
      try {
        await fetch(`${API}/reviews`, {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({ text: r.text, auteur: r.auteur, etoiles: r.etoiles }),
        });
      } catch { /* continue */ }
    }
    setImporting(false);
    setImported(true);
    if (onImport) onImport();
  };

  return (
    <div style={{ maxWidth: 700, animation: "fadeUp 0.4s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(66,133,244,0.05)", border: "1px solid #4285F422", borderRadius: 12 }}>
        <span style={{ fontSize: 14, color: "#4285F4", fontWeight: 600 }}>🗺️ Scraper Google Maps</span>
        <span style={{ fontSize: 12, color: "#555", marginLeft: 8 }}>
          Extrait et analyse les avis d'un lieu Google Maps automatiquement
        </span>
      </div>

      {/* Instructions */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a2e", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
          Comment ça marche
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["1️⃣", "Ouvrez Google Maps et cherchez votre lieu"],
            ["2️⃣", "Copiez l'URL depuis la barre d'adresse"],
            ["3️⃣", "Collez-la ci-dessous et cliquez Analyser"],
            ["4️⃣", "Importez les avis analysés dans votre dashboard"],
          ].map(([num, text]) => (
            <div key={num} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>{num}</span>
              <span style={{ fontSize: 12, color: "#666" }}>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, background: "#0a0a0f", borderRadius: 8, padding: "8px 12px" }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Exemple d'URL valide</div>
          <code style={{ fontSize: 11, color: "#4285F4" }}>
            https://www.google.com/maps/place/NomDuLieu/@...
          </code>
        </div>
      </div>

      {/* Input URL */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
          URL Google Maps *
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={url}
            onChange={e => { setUrl(e.target.value); setError(""); setResult(null); setImported(false); }}
            onKeyDown={e => e.key === "Enter" && isGoogleMaps && handleScrape()}
            placeholder="https://www.google.com/maps/place/..."
            style={{
              flex: 1, background: "#0d0d1a",
              border: `1px solid ${isGoogleMaps ? "#4285F466" : url ? "#ff4d6d44" : "#222"}`,
              borderRadius: 8, padding: "10px 14px", color: "#e0e0e0",
              fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border 0.2s",
            }}
          />
          <button
            onClick={handleScrape}
            disabled={loading || !isGoogleMaps}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "none",
              cursor: loading || !isGoogleMaps ? "not-allowed" : "pointer",
              background: isGoogleMaps && !loading
                ? "linear-gradient(135deg, #4285F4, #0070f3)"
                : "#1a1a2e",
              color: isGoogleMaps && !loading ? "#fff" : "#444",
              fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", transition: "all 0.2s",
            }}
          >
            {loading ? " Scraping..." : " Analyser"}
          </button>
        </div>

        {/* Feedback URL */}
        {url && !isGoogleMaps && (
          <div style={{ fontSize: 11, color: "#ff4d6d", marginTop: 6 }}>
            ⚠️ URL non reconnue — collez une URL Google Maps (google.com/maps/place/...)
          </div>
        )}
        {isGoogleMaps && (
          <div style={{ fontSize: 11, color: "#4285F4", marginTop: 6 }}>
            ✅ URL Google Maps détectée
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          background: "#ff4d6d18", border: "1px solid #ff4d6d33", borderRadius: 8,
          padding: "10px 14px", color: "#ff4d6d", fontSize: 13, marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Avis récupérés", value: result.total,        color: "#4285F4" },
              { label: "Positifs",       value: result.stats.pos,    color: "#00e5a0" },
              { label: "Neutres",        value: result.stats.neu,    color: "#ffd166" },
              { label: "Négatifs",       value: result.stats.neg,    color: "#ff4d6d" },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: s.color + "11", border: `1px solid ${s.color}33`,
                borderRadius: 10, padding: "12px 8px", textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 700, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Barre de sentiment */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 8, borderRadius: 999, overflow: "hidden", display: "flex" }}>
              {[
                { count: result.stats.pos, color: "#00e5a0" },
                { count: result.stats.neu, color: "#ffd166" },
                { count: result.stats.neg, color: "#ff4d6d" },
              ].map((b, i) => (
                <div key={i} style={{
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
              <div style={{
                background: "#00e5a022", border: "1px solid #00e5a044", borderRadius: 10,
                padding: "12px 16px", color: "#00e5a0", fontWeight: 600, textAlign: "center",
              }}>
                ✅ {result.total} avis importés dans votre dashboard !
              </div>
            ) : (
              <button onClick={handleImport} disabled={importing} style={{
                width: "100%", padding: "12px", borderRadius: 10, border: "none",
                background: importing ? "#1a1a2e" : "linear-gradient(135deg,#00e5a0,#0070f3)",
                color: importing ? "#444" : "#fff", fontWeight: 700, fontSize: 14,
                cursor: importing ? "not-allowed" : "pointer", transition: "all 0.2s",
              }}>
                {importing ? "⏳ Import en cours..." : ` Importer les ${result.total} avis dans mon dashboard`}
              </button>
            )}
          </div>

          {/* Preview */}
          <div>
            <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Aperçu des avis analysés
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
              {result.reviews.map((r, i) => <MiniCard key={i} review={r} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}