import { useState, useEffect } from "react";
import { sentimentColor, sentimentIcon, API, authHeaders } from "../utils/helpers";

function StarDisplay({ n }) {
  return <span style={{ color: "#ffd166" }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

// Modal pour signaler un avis mal classé
function FlagModal({ review, onClose, onSuccess }) {
  const [suggested, setSuggested] = useState("");
  const [reason, setReason]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const LABELS = ["positif", "neutre", "négatif"];

  const submit = async () => {
    if (!suggested) { setError("Choisissez le bon sentiment"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/flags`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reviewId: review._id, suggestedLabel: suggested, reason }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
      onSuccess();
      onClose();
    } catch { setError("Erreur réseau"); }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#12121f", border: "1px solid #1a1a2e", borderRadius: 16,
        padding: 28, width: "100%", maxWidth: 440,
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}> Signaler une erreur</div>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>
          Le modèle a prédit <span style={{ color: sentimentColor(review.sentiment), fontWeight: 700 }}>
            {review.sentiment}
          </span> — vous pensez que c'est :
        </div>

        {/* Texte de l'avis */}
        <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 10, marginBottom: 16,
          fontSize: 12, color: "#888", fontStyle: "italic", lineHeight: 1.5 }}>
          "{review.text.slice(0, 120)}{review.text.length > 120 ? "..." : ""}"
        </div>

        {/* Choix du bon label */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            Sentiment correct *
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {LABELS.filter(l => l !== review.sentiment).map(l => (
              <button key={l} onClick={() => setSuggested(l)} style={{
                flex: 1, padding: "10px 8px", borderRadius: 8, border: "1px solid",
                cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                background: suggested === l ? sentimentColor(l) + "22" : "transparent",
                borderColor: suggested === l ? sentimentColor(l) : "#333",
                color: suggested === l ? sentimentColor(l) : "#666",
              }}>
                {sentimentIcon(l)} {l}
              </button>
            ))}
          </div>
        </div>

        {/* Commentaire optionnel */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            Commentaire (optionnel)
          </div>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Expliquez pourquoi le modèle s'est trompé..."
            rows={2} style={{
              width: "100%", background: "#0d0d1a", border: "1px solid #222",
              borderRadius: 8, padding: "8px 12px", color: "#e0e0e0",
              fontSize: 12, resize: "none", fontFamily: "inherit", outline: "none",
            }} />
        </div>

        {error && <div style={{ background: "#ff4d6d18", border: "1px solid #ff4d6d33",
          borderRadius: 8, padding: "8px 12px", color: "#ff4d6d", fontSize: 12, marginBottom: 12 }}>
          ⚠️ {error}
        </div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, background: "transparent", border: "1px solid #333",
            borderRadius: 8, padding: "10px", color: "#666", cursor: "pointer", fontSize: 13,
          }}>Annuler</button>
          <button onClick={submit} disabled={loading || !suggested} style={{
            flex: 2, background: suggested ? "linear-gradient(135deg,#ffd166,#ff8c00)" : "#1a1a2e",
            border: "none", borderRadius: 8, padding: "10px", color: suggested ? "#000" : "#444",
            cursor: suggested ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 13,
          }}>
            {loading ? "Envoi..." : " Signaler au modérateur"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewCard({ review, isNew }) {
  const [vis, setVis]           = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [flagged, setFlagged]   = useState(false);
  const [flagSuccess, setFlagSuccess] = useState(false);

  useEffect(() => { setTimeout(() => setVis(true), 50); }, []);

  const s     = review.sentiment;
  const score = review.score ?? 0;
  const color = sentimentColor(s);

  const handleFlagSuccess = () => {
    setFlagged(true);
    setFlagSuccess(true);
    setTimeout(() => setFlagSuccess(false), 3000);
  };

  return (
    <>
      {showFlag && (
        <FlagModal
          review={review}
          onClose={() => setShowFlag(false)}
          onSuccess={handleFlagSuccess}
        />
      )}

      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${s ? color + "44" : "#333"}`,
        borderLeft: `3px solid ${s ? color : "#444"}`,
        borderRadius: 10, padding: "14px 16px",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.4s ease", position: "relative",
      }}>
        {isNew && (
          <span style={{
            position: "absolute", top: 8, right: 8,
            background: "#00e5a022", color: "#00e5a0",
            fontSize: 9, padding: "2px 6px", borderRadius: 20,
            fontWeight: 700, letterSpacing: 1,
          }}>NOUVEAU</span>
        )}

        {/* Notification flag envoyé */}
        {flagSuccess && (
          <div style={{
            position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
            background: "#ffd16622", border: "1px solid #ffd16644",
            borderRadius: 20, padding: "4px 12px", fontSize: 11,
            color: "#ffd166", fontWeight: 600, whiteSpace: "nowrap", zIndex: 10,
          }}>✅ Signalement envoyé au modérateur</div>
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <span style={{ fontWeight: 600, color: "#e0e0e0", fontSize: 13 }}>
              {review.auteur || "Anonyme"}
            </span>
            <div style={{ marginTop: 2 }}><StarDisplay n={review.etoiles || 3} /></div>
            {review.lang && (
              <span style={{ fontSize: 10, color: "#555", display: "block", marginTop: 2 }}>
                {review.lang === "FR" ? "🇫🇷 Français" : "🇬🇧 English"}
              </span>
            )}
          </div>
          {s && (
            <div style={{ textAlign: "right" }}>
              <div style={{ color, fontWeight: 700, fontSize: 13 }}>{sentimentIcon(s)} {s}</div>
              <div style={{ fontSize: 11, color: "#666" }}>Score: {score > 0 ? "+" : ""}{score.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: "#555" }}>Conf: {((review.confidence || 0) * 100).toFixed(0)}%</div>
            </div>
          )}
        </div>

        {/* Texte */}
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.5, margin: "0 0 10px 0", fontStyle: "italic" }}>
          "{review.text}"
        </p>

        {/* Score bar */}
        {s && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 5, background: "#1a1a2e", borderRadius: 999, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: "100%", background: "#333" }} />
              <div style={{
                position: "absolute", top: 0, height: "100%", borderRadius: 999,
                transition: "all 0.8s ease", background: color,
                left: score >= 0 ? "50%" : `${Math.round(((score + 1) / 2) * 100)}%`,
                width: `${Math.abs(score) * 50}%`,
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
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {review.emotions.map((e, i) => (
              <span key={i} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                background: color + "22", color,
              }}>{e}</span>
            ))}
          </div>
        )}

        {/* Footer : date + bouton signaler */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "#333" }}>
            {new Date(review.createdAt).toLocaleString("fr-FR")}
          </span>

          {s && (
            <button
              onClick={() => !flagged && setShowFlag(true)}
              title={flagged ? "Déjà signalé" : "Signaler une erreur du modèle"}
              style={{
                background: flagged ? "#ffd16611" : "transparent",
                border: `1px solid ${flagged ? "#ffd16633" : "#333"}`,
                borderRadius: 20, padding: "3px 10px",
                fontSize: 10, cursor: flagged ? "default" : "pointer",
                color: flagged ? "#ffd166" : "#444",
                transition: "all 0.2s", fontWeight: 600,
              }}
            >
              {flagged ? " Signalé" : " Signaler"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}