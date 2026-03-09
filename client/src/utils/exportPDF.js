// ── Import jsPDF via npm (pas de CDN) ─────────────────────────
// Dans le terminal client : npm install jspdf

export async function exportPDF({ user, reviews, insights }) {
  // Import dynamique compatible Vite
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  let y = 0;

  // Couleurs
  const DARK   = [10, 10, 15];
  const GREEN  = [0, 200, 140];
  const RED    = [220, 60, 90];
  const YELLOW = [230, 190, 80];
  const BLUE   = [0, 100, 220];
  const PURPLE = [150, 120, 230];
  const GRAY   = [100, 100, 120];
  const LIGHT  = [210, 210, 220];
  const WHITE  = [240, 240, 245];

  const fillRect = (x, ry, w, h, color) => {
    doc.setFillColor(...color);
    doc.rect(x, ry, w, h, "F");
  };

  const txt = (str, x, ry, size = 10, color = WHITE, align = "left", bold = false) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(String(str ?? ""), x, ry, { align });
  };

  // Stats
  const analyzed     = reviews.filter(r => r.sentiment);
  const pos          = analyzed.filter(r => r.sentiment === "positif").length;
  const neg          = analyzed.filter(r => r.sentiment === "negative" || r.sentiment === "negatif" || r.sentiment === "négatif").length;
  const neu          = analyzed.length - pos - neg;
  const avgScore     = analyzed.length ? analyzed.reduce((a, r) => a + (r.score || 0), 0) / analyzed.length : 0;
  const satisfaction = analyzed.length ? Math.round((pos / analyzed.length) * 100) : 0;
  const date         = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  // ════════════════════════════════════════
  // PAGE 1 — KPIs + Stats
  // ════════════════════════════════════════
  fillRect(0, 0, W, 50, DARK);
  fillRect(0, 0, W, 3, GREEN);

  txt("SentiMind", 14, 18, 22, WHITE, "left", true);
  txt("NLP", 62, 18, 22, GREEN, "left", true);
  txt("Rapport d'analyse de sentiment", 14, 26, 9, GRAY);
  txt(`Boutique : ${user.boutique || user.nom}`, W - 14, 16, 9, LIGHT, "right");
  txt(`Genere le ${date}`, W - 14, 23, 8, GRAY, "right");
  txt(`${reviews.length} avis analyses`, W - 14, 30, 8, GRAY, "right");

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.line(14, 36, W - 14, 36);
  txt("Vue d'ensemble", 14, 44, 13, WHITE, "left", true);

  y = 58;

  // KPI Cards
  const kpis = [
    { label: "Total Avis",   value: reviews.length,                                          color: BLUE   },
    { label: "Satisfaction", value: `${satisfaction}%`,                                      color: GREEN  },
    { label: "Score Moyen",  value: `${avgScore >= 0 ? "+" : ""}${avgScore.toFixed(2)}`,     color: avgScore >= 0 ? GREEN : RED },
    { label: "Negatifs",     value: neg,                                                     color: RED    },
  ];

  kpis.forEach((k, i) => {
    const kx = 14 + i * 47;
    fillRect(kx, y, 43, 22, [18, 18, 35]);
    doc.setDrawColor(...k.color);
    doc.setLineWidth(0.5);
    doc.line(kx, y, kx + 43, y);
    txt(String(k.value), kx + 21, y + 11, 16, k.color, "center", true);
    txt(k.label, kx + 21, y + 18, 7, GRAY, "center");
  });

  y += 32;

  // Repartition
  txt("Repartition des sentiments", 14, y, 11, WHITE, "left", true);
  y += 8;

  const total = analyzed.length || 1;
  const barW  = 170;

  fillRect(14, y, barW, 8, [18, 18, 35]);
  let bx = 14;
  [[pos, GREEN], [neu, YELLOW], [neg, RED]].forEach(([count, color]) => {
    const sw = (count / total) * barW;
    if (sw > 0) { fillRect(bx, y, sw, 8, color); bx += sw; }
  });

  y += 13;
  [["Positifs", pos, GREEN], ["Neutres", neu, YELLOW], ["Negatifs", neg, RED]].forEach(([label, count, color], i) => {
    const lx = 14 + i * 58;
    doc.setFillColor(...color);
    doc.circle(lx + 2, y - 1.5, 2, "F");
    txt(`${label} : ${count} (${Math.round((count / total) * 100)}%)`, lx + 6, y, 8, LIGHT);
  });

  y += 14;

  // Satisfaction bar
  txt("Indice de satisfaction global", 14, y, 11, WHITE, "left", true);
  txt(`${satisfaction}%`, W - 14, y, 11, GREEN, "right", true);
  y += 7;
  fillRect(14, y, 170, 6, [18, 18, 35]);
  const satColor = satisfaction >= 70 ? GREEN : satisfaction >= 40 ? YELLOW : RED;
  fillRect(14, y, (satisfaction / 100) * 170, 6, satColor);

  y += 16;

  // Histogramme scores
  txt("Distribution des scores NLP", 14, y, 11, WHITE, "left", true);
  y += 8;

  const buckets  = [
    { label: "Tres neg.", color: RED,    fn: s => s < -0.6 },
    { label: "Negatif",   color: [220,120,80], fn: s => s >= -0.6 && s < -0.2 },
    { label: "Neutre",    color: YELLOW, fn: s => s >= -0.2 && s < 0.2 },
    { label: "Positif",   color: [80,200,120], fn: s => s >= 0.2 && s < 0.6 },
    { label: "Tres pos.", color: GREEN,  fn: s => s >= 0.6 },
  ];

  const counts    = buckets.map(b => analyzed.filter(r => b.fn(r.score || 0)).length);
  const maxCount  = Math.max(...counts, 1);
  const histMaxH  = 25;

  counts.forEach((c, i) => {
    const hx = 14 + i * 36;
    const hh = Math.max((c / maxCount) * histMaxH, 1);
    const hy = y + histMaxH - hh;
    fillRect(hx, hy, 30, hh, buckets[i].color);
    txt(String(c), hx + 15, hy - 2, 7, LIGHT, "center");
    txt(buckets[i].label, hx + 15, y + histMaxH + 5, 6, GRAY, "center");
  });

  y += histMaxH + 16;

  // ════════════════════════════════════════
  // PAGE 2 — Top avis
  // ════════════════════════════════════════
  doc.addPage();
  fillRect(0, 0, W, 16, DARK);
  fillRect(0, 0, W, 2, GREEN);
  txt("Detail des avis", 14, 11, 12, WHITE, "left", true);
  txt("Page 2 / 3", W - 14, 11, 8, GRAY, "right");
  y = 26;

  const topPos = [...analyzed].filter(r => r.sentiment === "positif").sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);
  const topNeg = [...analyzed].filter(r => ["negatif","négatif","negative"].includes(r.sentiment)).sort((a, b) => (a.score || 0) - (b.score || 0)).slice(0, 5);

  txt("Top 5 - Meilleurs avis", 14, y, 11, GREEN, "left", true);
  y += 8;
  topPos.forEach(r => {
    if (y > 260) return;
    fillRect(14, y, 182, 18, [15, 25, 20]);
    doc.setDrawColor(...GREEN); doc.setLineWidth(0.4);
    doc.line(14, y, 14, y + 18);
    txt(r.auteur || "Anonyme", 20, y + 6, 8, GREEN, "left", true);
    txt(`+${(r.score || 0).toFixed(2)}`, W - 16, y + 6, 8, GREEN, "right");
    txt(`"${(r.text || "").slice(0, 90)}${r.text?.length > 90 ? "..." : ""}"`, 20, y + 13, 7, GRAY);
    y += 21;
  });

  y += 6;
  txt("Top 5 - Avis a surveiller", 14, y, 11, RED, "left", true);
  y += 8;
  topNeg.forEach(r => {
    if (y > 260) return;
    fillRect(14, y, 182, 18, [25, 12, 18]);
    doc.setDrawColor(...RED); doc.setLineWidth(0.4);
    doc.line(14, y, 14, y + 18);
    txt(r.auteur || "Anonyme", 20, y + 6, 8, RED, "left", true);
    txt(`${(r.score || 0).toFixed(2)}`, W - 16, y + 6, 8, RED, "right");
    txt(`"${(r.text || "").slice(0, 90)}${r.text?.length > 90 ? "..." : ""}"`, 20, y + 13, 7, GRAY);
    y += 21;
  });

  // ════════════════════════════════════════
  // PAGE 3 — Insights IA
  // ════════════════════════════════════════
  doc.addPage();
  fillRect(0, 0, W, 16, DARK);
  fillRect(0, 0, W, 2, PURPLE);
  txt("Insights & Recommandations IA", 14, 11, 12, WHITE, "left", true);
  txt("Page 3 / 3", W - 14, 11, 8, GRAY, "right");
  y = 26;

  if (insights) {
    fillRect(14, y, 182, 28, [20, 15, 35]);
    doc.setDrawColor(...PURPLE); doc.setLineWidth(0.5);
    doc.rect(14, y, 182, 28);
    txt("Conseil strategique global", 20, y + 8, 9, PURPLE, "left", true);
    const advLines = doc.splitTextToSize(insights.globalAdvice || "", 170);
    advLines.slice(0, 2).forEach((line, i) => txt(line, 20, y + 16 + i * 6, 8, LIGHT));
    y += 36;

    txt("Actions prioritaires", 14, y, 11, WHITE, "left", true);
    y += 8;
    (insights.topPriorities || []).forEach(item => {
      if (y > 255) return;
      const pColor = item.priority >= 70 ? RED : item.priority >= 40 ? YELLOW : GREEN;
      fillRect(14, y, 182, 22, [18, 18, 35]);
      doc.setDrawColor(...pColor); doc.setLineWidth(0.5);
      doc.line(14, y, 14, y + 22);
      txt(`${item.theme}`, 20, y + 7, 9, pColor, "left", true);
      txt(`Priorite : ${item.priority}/100`, W - 16, y + 7, 8, pColor, "right");
      txt(`Effort : ${item.effort}`, 20, y + 13, 7, GRAY);
      txt(`Impact : ${item.impact}`, 65, y + 13, 7, BLUE);
      const aLines = doc.splitTextToSize(item.action || "", 160);
      txt(aLines[0] || "", 20, y + 19, 7, GRAY);
      y += 26;
    });

    y += 4;
    if (y < 255) {
      txt("Points forts a maintenir", 14, y, 11, WHITE, "left", true);
      y += 8;
      (insights.strengths || []).forEach(item => {
        if (y > 265) return;
        fillRect(14, y, 182, 14, [12, 25, 20]);
        doc.setDrawColor(...GREEN); doc.setLineWidth(0.3);
        doc.line(14, y, 14, y + 14);
        txt(item.theme, 20, y + 6, 8, GREEN, "left", true);
        txt(doc.splitTextToSize(item.message || "", 155)[0] || "", 20, y + 11, 7, GRAY);
        y += 17;
      });
    }
  } else {
    fillRect(14, y, 182, 20, [18, 18, 35]);
    txt("Insights non disponibles - Generez-les depuis l'onglet Insights", 105, y + 12, 9, GRAY, "center");
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    fillRect(0, 285, W, 12, DARK);
    doc.setDrawColor(...GREEN); doc.setLineWidth(0.2);
    doc.line(14, 285, W - 14, 285);
    txt("SentiMind NLP - Rapport confidentiel", 14, 291, 7, GRAY);
    txt(`${user.nom}${user.boutique ? " - " + user.boutique : ""}`, 105, 291, 7, GRAY, "center");
    txt(date, W - 14, 291, 7, GRAY, "right");
  }

  doc.save(`sentimind_rapport_${new Date().toISOString().slice(0, 10)}.pdf`);
}