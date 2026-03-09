import { useState } from "react";
import { API, authHeaders } from "../utils/helpers";

const PRIORITY_COLOR = (p) => p >= 70 ? "#ff4d6d" : p >= 40 ? "#ffd166" : "#00e5a0";
const EFFORT_COLOR   = { faible: "#00e5a0", moyen: "#ffd166", élevé: "#ff4d6d" };
const IMPACT_COLOR   = { court: "#00e5a0", moyen: "#ffd166", long: "#0070f3" };

function PriorityBar({ value }) {
  const color = PRIORITY_COLOR(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#1a1a2e", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width 1s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color, fontWeight: 700, minWidth: 32 }}>
        {value}
      </span>
    </div>
  );
}

function ThemeRow({ theme }) {
  const color = theme.sentiment === 'positif' ? "#00e5a0" : theme.sentiment === 'négatif' ? "#ff4d6d" : "#ffd166";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #111" }}>
      <span style={{ fontSize: 20, minWidth: 28 }}>{theme.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#e0e0e0", marginBottom: 4 }}>{theme.label}</div>
        <PriorityBar value={theme.priority} />
      </div>
      <div style={{ textAlign: "right", minWidth: 80 }}>
        <div style={{ fontSize: 11, color: "#555" }}>{theme.totalMentions} mention{theme.totalMentions > 1 ? "s" : ""}</div>
        <div style={{ fontSize: 10, color }}>
          {theme.posMentions}✅ {theme.negMentions}❌
        </div>
      </div>
    </div>
  );
}

function ActionCard({ item, index }) {
  const priorityColor = PRIORITY_COLOR(item.priority);
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: `1px solid ${priorityColor}33`,
      borderLeft: `4px solid ${priorityColor}`, borderRadius: 10, padding: "16px",
      animation: `fadeUp 0.4s ease ${index * 0.1}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0" }}>{item.theme}</div>
            <div style={{ fontSize: 10, color: priorityColor, fontWeight: 600, marginTop: 2 }}>
              Priorité : {item.priority}/100
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 600,
            background: (EFFORT_COLOR[item.effort] || "#888") + "22",
            color: EFFORT_COLOR[item.effort] || "#888",
            border: `1px solid ${(EFFORT_COLOR[item.effort] || "#888")}44`,
          }}>
            Effort {item.effort}
          </span>
          <span style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 600,
            background: (IMPACT_COLOR[item.impact] || "#888") + "22",
            color: IMPACT_COLOR[item.impact] || "#888",
            border: `1px solid ${(IMPACT_COLOR[item.impact] || "#888")}44`,
          }}>
            Impact {item.impact}
          </span>
        </div>
      </div>
      <div style={{
        background: "#0a0a0f", borderRadius: 8, padding: "10px 14px",
        fontSize: 13, color: "#ccc", lineHeight: 1.6,
      }}>
         {item.action}
      </div>
    </div>
  );
}

function StrengthCard({ item, index }) {
  return (
    <div style={{
      background: "#00e5a011", border: "1px solid #00e5a033",
      borderRadius: 10, padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 12,
      animation: `fadeUp 0.4s ease ${index * 0.1}s both`,
    }}>
      <span style={{ fontSize: 24 }}>{item.icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#00e5a0", marginBottom: 2 }}>{item.theme}</div>
        <div style={{ fontSize: 12, color: "#888", lineHeight: 1.4 }}> {item.message}</div>
      </div>
    </div>
  );
}

export default function InsightsPanel({ reviewCount, onInsightsReady }) {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [data, setData]         = useState(null);
  const [activeTab, setActiveTab] = useState("actions");

  const handleGenerate = async () => {
    setLoading(true); setError(""); setData(null);
    try {
      const res  = await fetch(`${API}/insights`, { method: "POST", headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erreur"); setLoading(false); return; }
      setData(json);
      if (onInsightsReady) onInsightsReady(json.insights);
    } catch { setError("Impossible de contacter le serveur"); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 750, animation: "fadeUp 0.4s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(167,139,250,0.05)", border: "1px solid #a78bfa22", borderRadius: 12 }}>
        <span style={{ fontSize: 14, color: "#a78bfa", fontWeight: 600 }}> Insights & Recommandations IA</span>
        <span style={{ fontSize: 12, color: "#555", marginLeft: 8 }}>
          Analyse NLP maison + Claude AI · Basé sur vos {reviewCount} avis
        </span>
      </div>

      {/* Bouton générer */}
      {!data && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e0e0e0", marginBottom: 8 }}>
            Analyser vos avis clients
          </div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            Notre moteur NLP extrait les thèmes clés, calcule les scores de priorité,
            puis Claude AI génère des conseils concrets et actionnables.
          </div>

          {error && (
            <div style={{ background: "#ff4d6d18", border: "1px solid #ff4d6d33", borderRadius: 8,
              padding: "10px 14px", color: "#ff4d6d", fontSize: 13, marginBottom: 16 }}>
               {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading || reviewCount < 3} style={{
            padding: "14px 32px", borderRadius: 12, border: "none",
            background: reviewCount >= 3 && !loading
              ? "linear-gradient(135deg, #a78bfa, #0070f3)"
              : "#1a1a2e",
            color: reviewCount >= 3 && !loading ? "#fff" : "#444",
            fontWeight: 700, fontSize: 15, cursor: reviewCount >= 3 ? "pointer" : "not-allowed",
            transition: "all 0.3s",
          }}>
            {loading
              ? " Analyse en cours..."
              : reviewCount < 3
              ? ` Il faut au moins 3 avis (vous en avez ${reviewCount})`
              : " Générer mes insights"}
          </button>

          {loading && (
            <div style={{ marginTop: 16, fontSize: 12, color: "#555" }}>
               Extraction des thèmes →  Calcul des priorités → génèrer vos conseils...
            </div>
          )}
        </div>
      )}

      {/* Résultats */}
      {data && (
        <div>
          {/* Conseil global */}
          <div style={{
            background: "linear-gradient(135deg, #a78bfa11, #0070f311)",
            border: "1px solid #a78bfa33", borderRadius: 12, padding: "16px 20px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
               Conseil stratégique global
            </div>
            <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7 }}>
              {data.insights.globalAdvice}
            </div>
          </div>

          {/* Sous-tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#0d0d1a", borderRadius: 8, padding: 3, width: "fit-content" }}>
            {[
              ["actions",  " Actions prioritaires"],
              ["strengths"," Points forts"],
              ["themes",   " Tous les thèmes"],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 12, transition: "all 0.2s",
                background: activeTab === id ? "linear-gradient(135deg,#a78bfa,#0070f3)" : "transparent",
                color: activeTab === id ? "#fff" : "#555",
              }}>{label}</button>
            ))}
          </div>

          {/* Tab : Actions prioritaires */}
          {activeTab === "actions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.insights.topPriorities?.length ? (
                data.insights.topPriorities.map((item, i) => (
                  <ActionCard key={i} item={item} index={i} />
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#555", padding: 40 }}>
                   Aucune action urgente détectée — vos avis sont globalement positifs !
                </div>
              )}
            </div>
          )}

          {/* Tab : Points forts */}
          {activeTab === "strengths" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.insights.strengths?.length ? (
                data.insights.strengths.map((item, i) => (
                  <StrengthCard key={i} item={item} index={i} />
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#555", padding: 40 }}>
                  Pas encore assez de données positives pour identifier des points forts.
                </div>
              )}
            </div>
          )}

          {/* Tab : Tous les thèmes */}
          {activeTab === "themes" && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a2e", borderRadius: 12, padding: "8px 16px" }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 4, paddingTop: 8,
                textTransform: "uppercase", letterSpacing: 1 }}>
                Score de priorité = fréquence × impact négatif (0–100)
              </div>
              {data.themes.map((t, i) => <ThemeRow key={i} theme={t} />)}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "#333" }}>
              Généré le {new Date(data.generatedAt).toLocaleString("fr-FR")} · {data.reviewCount} avis analysés
            </div>
            <button onClick={() => { setData(null); setError(""); }} style={{
              background: "transparent", border: "1px solid #333", borderRadius: 8,
              padding: "6px 14px", color: "#555", cursor: "pointer", fontSize: 12,
            }}>
               Regénérer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}