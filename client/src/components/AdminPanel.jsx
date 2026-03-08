import { useState, useEffect } from "react";
import { API, authHeaders, sentimentColor, sentimentIcon } from "../utils/helpers";

const LABEL_MAP = { 1: "positif", 0: "neutre", "-1": "négatif" };

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`,
      borderTop: `3px solid ${color}`, borderRadius: 12, padding: "14px 16px", flex: 1,
    }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function FlagRow({ flag, onAction }) {
  const [loading, setLoading]   = useState(false);
  const [comment, setComment]   = useState("");
  const [expanded, setExpanded] = useState(false);

  const handle = async (action) => {
    setLoading(true);
    await onAction(flag._id, action, comment);
    setLoading(false);
  };

  const predColor = sentimentColor(flag.predictedLabel);
  const suggColor = sentimentColor(flag.suggestedLabel);

  const statusStyle = {
    pending:  { bg: "#ffd16622", border: "#ffd16644", color: "#ffd166", label: "⏳ En attente" },
    accepted: { bg: "#00e5a022", border: "#00e5a044", color: "#00e5a0", label: "✅ Accepté" },
    rejected: { bg: "#ff4d6d22", border: "#ff4d6d44", color: "#ff4d6d", label: "❌ Rejeté" },
  }[flag.status];

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a2e",
      borderRadius: 10, padding: "14px 16px", marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#e0e0e0" }}>
            🚩 {flag.userNom || "Utilisateur"}
          </span>
          <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
            {new Date(flag.createdAt).toLocaleString("fr-FR")}
          </div>
        </div>
        <span style={{
          background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
          color: statusStyle.color, borderRadius: 20, padding: "3px 10px",
          fontSize: 11, fontWeight: 600,
        }}>{statusStyle.label}</span>
      </div>

      {/* Texte de l'avis */}
      <div style={{
        background: "#0a0a0f", borderRadius: 8, padding: "10px 12px",
        fontSize: 12, color: "#888", fontStyle: "italic", lineHeight: 1.5, marginBottom: 10,
        cursor: "pointer",
      }} onClick={() => setExpanded(!expanded)}>
        "{expanded ? flag.reviewText : flag.reviewText.slice(0, 100) + (flag.reviewText.length > 100 ? "..." : "")}"
        {flag.reviewText.length > 100 && (
          <span style={{ color: "#555", marginLeft: 4 }}>{expanded ? "▲ Moins" : "▼ Plus"}</span>
        )}
      </div>

      {/* Prédiction vs Suggestion */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <div style={{
          flex: 1, padding: "8px 12px", borderRadius: 8,
          background: predColor + "11", border: `1px solid ${predColor}33`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>MODÈLE A DIT</div>
          <div style={{ color: predColor, fontWeight: 700, fontSize: 14 }}>
            {sentimentIcon(flag.predictedLabel)} {flag.predictedLabel}
          </div>
        </div>

        <div style={{ color: "#555", fontSize: 18 }}>→</div>

        <div style={{
          flex: 1, padding: "8px 12px", borderRadius: 8,
          background: suggColor + "22", border: `1px solid ${suggColor}55`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>USER SUGGÈRE</div>
          <div style={{ color: suggColor, fontWeight: 700, fontSize: 14 }}>
            {sentimentIcon(flag.suggestedLabel)} {flag.suggestedLabel}
          </div>
        </div>
      </div>

      {/* Raison de l'user */}
      {flag.reason && (
        <div style={{
          background: "#0d0d1a", borderRadius: 8, padding: "8px 12px",
          fontSize: 11, color: "#666", marginBottom: 10,
        }}>
          💬 <em>"{flag.reason}"</em>
        </div>
      )}

      {/* Actions admin (seulement si pending) */}
      {flag.status === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Commentaire admin (optionnel)..."
            rows={2} style={{
              width: "100%", background: "#0d0d1a", border: "1px solid #222",
              borderRadius: 8, padding: "8px 12px", color: "#e0e0e0",
              fontSize: 12, resize: "none", fontFamily: "inherit", outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handle("reject")} disabled={loading} style={{
              flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer",
              background: "#ff4d6d18", border: "1px solid #ff4d6d44",
              color: "#ff4d6d", fontWeight: 700, fontSize: 12,
            }}>
              ❌ Rejeter
            </button>
            <button onClick={() => handle("accept")} disabled={loading} style={{
              flex: 2, padding: "9px", borderRadius: 8, cursor: "pointer",
              background: "linear-gradient(135deg,#00e5a0,#0070f3)",
              border: "none", color: "#fff", fontWeight: 700, fontSize: 12,
            }}>
              {loading ? "..." : "✅ Accepter → Ajouter au dataset"}
            </button>
          </div>
        </div>
      )}

      {/* Commentaire admin si déjà traité */}
      {flag.status !== "pending" && flag.adminComment && (
        <div style={{
          background: "#0d0d1a", borderRadius: 8, padding: "8px 12px",
          fontSize: 11, color: "#555", marginTop: 8,
        }}>
          🛡️ Admin: <em>"{flag.adminComment}"</em>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [flags, setFlags]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [extraData, setExtraData] = useState([]);
  const [filter, setFilter]   = useState("pending");
  const [tab, setTab]         = useState("flags");   // "flags" | "dataset"
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [fRes, sRes, dRes] = await Promise.all([
        fetch(`${API}/flags?status=${filter}`, { headers: authHeaders() }),
        fetch(`${API}/flags/stats`,            { headers: authHeaders() }),
        fetch(`${API}/flags/extra-data`,       { headers: authHeaders() }),
      ]);
      setFlags(await fRes.json());
      setStats(await sRes.json());
      setExtraData(await dRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [filter]);

  const handleAction = async (flagId, action, comment) => {
    await fetch(`${API}/flags/${flagId}`, {
      method: "PUT", headers: authHeaders(),
      body: JSON.stringify({ action, adminComment: comment }),
    });
    await fetchAll();
  };

  const handleRemoveExample = async (flagId) => {
    if (!confirm("Retirer cet exemple du dataset ?")) return;
    await fetch(`${API}/flags/extra-data/${flagId}`, { method: "DELETE", headers: authHeaders() });
    await fetchAll();
  };

  const LABEL_COLOR = { 1: "#00e5a0", 0: "#ffd166", "-1": "#ff4d6d" };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>

      {/* Titre */}
      <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(255,180,0,0.05)", border: "1px solid #ffd16622", borderRadius: 12 }}>
        <span style={{ fontSize: 14, color: "#ffd166", fontWeight: 600 }}>🛡️ Panel Administrateur</span>
        <span style={{ fontSize: 12, color: "#555", marginLeft: 8 }}>Modération des signalements · Human-in-the-Loop</span>
      </div>

      {/* Stats KPIs */}
      {stats && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatBox label="Total flags"     value={stats.total}          color="#0070f3" />
          <StatBox label="En attente"      value={stats.pending}        color="#ffd166" />
          <StatBox label="Acceptés"        value={stats.accepted}       color="#00e5a0" />
          <StatBox label="Rejetés"         value={stats.rejected}       color="#ff4d6d" />
          <StatBox label="Dataset enrichi" value={stats.validatedCount} color="#a78bfa" />
        </div>
      )}

      {/* Sous-tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#0d0d1a", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {[["flags", "🚩 Signalements"], ["dataset", "📚 Dataset enrichi"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 13, transition: "all 0.2s",
            background: tab === id ? "linear-gradient(135deg,#00e5a0,#0070f3)" : "transparent",
            color: tab === id ? "#fff" : "#555",
          }}>{label}</button>
        ))}
      </div>

      {/* TAB : SIGNALEMENTS */}
      {tab === "flags" && (
        <>
          {/* Filtres */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[["pending", "⏳ En attente", "#ffd166"], ["accepted", "✅ Acceptés", "#00e5a0"], ["rejected", "❌ Rejetés", "#ff4d6d"], ["", "Tous", "#888"]].map(([v, label, color]) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer",
                fontWeight: 600, border: "1px solid",
                background: filter === v ? color + "22" : "transparent",
                borderColor: filter === v ? color : "#333",
                color: filter === v ? color : "#555",
              }}>{label}</button>
            ))}
            <button onClick={fetchAll} style={{
              marginLeft: "auto", background: "transparent", border: "1px solid #333",
              borderRadius: 20, padding: "6px 12px", color: "#555", cursor: "pointer", fontSize: 11,
            }}>🔄 Actualiser</button>
          </div>

          {loading && <div style={{ color: "#555", textAlign: "center", padding: 20 }}>Chargement...</div>}

          {!loading && flags.length === 0 && (
            <div style={{ textAlign: "center", color: "#444", padding: 40, fontSize: 14 }}>
              {filter === "pending" ? "✅ Aucun signalement en attente" : "Aucun signalement pour ce filtre"}
            </div>
          )}

          {flags.map(f => (
            <FlagRow key={f._id} flag={f} onAction={handleAction} />
          ))}
        </>
      )}

      {/* TAB : DATASET ENRICHI */}
      {tab === "dataset" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
              Ces exemples sont ajoutés automatiquement au dataset lors du prochain <code style={{ color: "#00e5a0", background: "#00e5a011", padding: "1px 6px", borderRadius: 4 }}>node index.js</code>
            </div>
            <div style={{ fontSize: 11, color: "#444" }}>
              Total : <strong style={{ color: "#a78bfa" }}>{extraData.length}</strong> exemples validés par l'admin
            </div>
          </div>

          {extraData.length === 0 && (
            <div style={{ textAlign: "center", color: "#444", padding: 40 }}>
              Aucun exemple validé pour l'instant. Acceptez des flags pour enrichir le dataset.
            </div>
          )}

          {extraData.map((ex, i) => {
            const labelStr = LABEL_MAP[String(ex.label)] || "neutre";
            const color    = LABEL_COLOR[String(ex.label)] || "#888";
            return (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`,
                borderLeft: `3px solid ${color}`, borderRadius: 10,
                padding: "12px 16px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", fontStyle: "italic", lineHeight: 1.4 }}>
                    "{ex.text.slice(0, 120)}{ex.text.length > 120 ? "..." : ""}"
                  </div>
                  <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>
                    Validé le {new Date(ex.date).toLocaleDateString("fr-FR")} · source: {ex.source}
                  </div>
                </div>
                <div style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: color + "22", color, border: `1px solid ${color}44`, whiteSpace: "nowrap",
                }}>
                  {sentimentIcon(labelStr)} {labelStr}
                </div>
                <button onClick={() => handleRemoveExample(ex.flagId)} title="Retirer du dataset" style={{
                  background: "transparent", border: "1px solid #333", borderRadius: 6,
                  padding: "4px 8px", color: "#555", cursor: "pointer", fontSize: 12,
                }}>🗑️</button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}