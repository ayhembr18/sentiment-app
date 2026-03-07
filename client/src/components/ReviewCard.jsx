import { useState, useEffect } from "react";
import { sentimentColor, sentimentIcon } from "../utils/helpers";

function StarDisplay({ n }) {
  return <span style={{ color: "#ffd166" }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export default function ReviewCard({ review, isNew }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 50); }, []);

  const s     = review.sentiment;
  const score = review.score ?? 0;
  const bar   = Math.round(((score + 1) / 2) * 100);
  const color = sentimentColor(s);

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${s ? color + "44" : "#333"}`,
      borderLeft: `3px solid ${s ? color : "#444"}`,
      borderRadius: 10, padding: "14px 16px",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.4s ease", position: "relative"
    }}>
      {isNew && (
        <span className="review-badge">NOUVEAU</span>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <span style={{ fontWeight: 600, color: "#e0e0e0", fontSize: 13 }}>{review.auteur || "Anonyme"}</span>
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
          <div className="score-bar-track">
            <div className="score-bar-mid" />
            <div className="score-bar-fill" style={{
              left: score >= 0 ? "50%" : `${bar}%`,
              width: `${Math.abs(score) * 50}%`,
              background: color,
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
            <span key={i} className="emotion-tag" style={{ background: color + "22", color }}>
              {e}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 10, color: "#333", marginTop: 6 }}>
        {new Date(review.createdAt).toLocaleString("fr-FR")}
      </div>
    </div>
  );
}