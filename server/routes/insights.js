// ══════════════════════════════════════════════════════════════
//  SentiMind Insights Engine
//  Extrait les thèmes clés des avis + calcule les scores de priorité
//  Puis envoie à Claude AI pour des conseils concrets
// ══════════════════════════════════════════════════════════════

const express        = require('express');
const authMiddleware = require('../middleware/auth');
const Review         = require('../models/review');

const router = express.Router();
router.use(authMiddleware);

// ── Thèmes et leurs mots-clés associés (FR + EN) ──────────────
const THEMES = {
  livraison: {
    label: "Livraison",
    keywords_pos: ["rapide","vite","expédié","reçu","délai","livré","ponctuel","fast","quick","delivery","shipped","arrived","on time"],
    keywords_neg: ["retard","lent","tardif","perdu","manquant","endommagé","cassé","late","slow","delayed","lost","damaged","broken","never arrived"],
  },
  qualite: {
    label: "Qualité produit",
    keywords_pos: ["qualité","solide","robuste","durable","bien fait","impeccable","premium","quality","solid","durable","well made","excellent build","sturdy"],
    keywords_neg: ["fragile","cassé","défaut","mauvaise qualité","décevant","mauvais","cheap","broke","defective","poor quality","disappointing","flimsy"],
  },
  prix: {
    label: "Prix / Rapport qualité-prix",
    keywords_pos: ["prix","abordable","économique","rapport qualité","valeur","worth","affordable","value","price","cheap","reasonable","good deal"],
    keywords_neg: ["cher","exorbitant","trop cher","overpriced","expensive","costly","not worth","prix élevé","arnaque","scam"],
  },
  service: {
    label: "Service client",
    keywords_pos: ["service","réactif","aimable","professionnel","support","helpful","responsive","customer service","friendly","great support"],
    keywords_neg: ["service","ignoré","injoignable","rude","incompétent","unhelpful","unresponsive","bad support","no response","ignored","terrible service"],
  },
  emballage: {
    label: "Emballage",
    keywords_pos: ["emballage","soigné","protégé","bien emballé","packaging","well packed","protected","carefully packed"],
    keywords_neg: ["emballage","abîmé","ouvert","mauvais emballage","damaged packaging","poorly packed","open","crushed"],
  },
  conformite: {
    label: "Conformité à la description",
    keywords_pos: ["conforme","correspond","comme décrit","as described","accurate","exactly as","matches description","comme prévu"],
    keywords_neg: ["ne correspond pas","différent","faux","trompeur","misleading","not as described","fake","wrong item","different from"],
  },
  experience: {
    label: "Expérience globale",
    keywords_pos: ["satisfait","recommande","content","heureux","impressionné","satisfied","recommend","happy","impressed","love it","amazing experience"],
    keywords_neg: ["déçu","regret","insatisfait","jamais","disappointed","regret","never again","worst","terrible experience","avoid"],
  },
};

// ── Extraction des thèmes depuis un texte ─────────────────────
function extractThemesFromText(text) {
  const lower = text.toLowerCase();
  const found = [];

  for (const [key, theme] of Object.entries(THEMES)) {
    const posMatches = theme.keywords_pos.filter(k => lower.includes(k));
    const negMatches = theme.keywords_neg.filter(k => lower.includes(k));
    if (posMatches.length > 0 || negMatches.length > 0) {
      found.push({ theme: key, posMatches, negMatches });
    }
  }
  return found;
}

// ── Calcul du score de priorité ────────────────────────────────
// Priorité = fréquence d'apparition × impact négatif
// Un thème très mentionné négativement = priorité haute
function computePriorities(reviews) {
  const themeStats = {};

  // Init
  for (const key of Object.keys(THEMES)) {
    themeStats[key] = {
      key,
      label:      THEMES[key].label,
      icon:       THEMES[key].icon,
      totalMentions: 0,
      posMentions:   0,
      negMentions:   0,
      neutralMentions: 0,
      examples:      { pos: [], neg: [] },
    };
  }

  // Parcourir les reviews
  for (const review of reviews) {
    if (!review.text) continue;
    const themes = extractThemesFromText(review.text);
    const sentiment = review.sentiment || 'neutre';

    for (const { theme, posMatches, negMatches } of themes) {
      themeStats[theme].totalMentions++;

      if (sentiment === 'positif') {
        themeStats[theme].posMentions++;
        if (themeStats[theme].examples.pos.length < 2)
          themeStats[theme].examples.pos.push(review.text.slice(0, 100));
      } else if (sentiment === 'négatif') {
        themeStats[theme].negMentions++;
        if (themeStats[theme].examples.neg.length < 2)
          themeStats[theme].examples.neg.push(review.text.slice(0, 100));
      } else {
        themeStats[theme].neutralMentions++;
      }
    }
  }

  // Calculer score de priorité pour chaque thème
  const total = reviews.length || 1;

  const result = Object.values(themeStats)
    .filter(t => t.totalMentions > 0)
    .map(t => {
      const negRate     = t.negMentions / t.totalMentions;        // % négatif sur ce thème
      const frequency   = t.totalMentions / total;                // fréquence d'apparition
      const priority    = Math.round((negRate * 0.7 + frequency * 0.3) * 100); // score 0-100
      const sentiment   = t.posMentions > t.negMentions ? 'positif'
                        : t.negMentions > t.posMentions ? 'négatif' : 'neutre';
      return { ...t, negRate: Math.round(negRate * 100), frequency: Math.round(frequency * 100), priority, sentiment };
    })
    .sort((a, b) => b.priority - a.priority);

  return result;
}

// ── Appel Claude AI pour les conseils ─────────────────────────
async function getGeminiInsights(themeData, reviewCount) {
  const prompt = `Tu es un expert en analyse de satisfaction client et en stratégie commerciale.

Voici l'analyse de ${reviewCount} avis clients d'une boutique/commerce :

${themeData.map(t => `
THÈME : ${t.icon} ${t.label}
- Mentions totales : ${t.totalMentions} (${t.frequency}% des avis)
- Avis positifs sur ce thème : ${t.posMentions}
- Avis négatifs sur ce thème : ${t.negMentions}
- Taux de problèmes : ${t.negRate}%
- Score de priorité : ${t.priority}/100
- Sentiment global : ${t.sentiment}
${t.examples.pos.length ? `- Exemple positif : "${t.examples.pos[0]}"` : ''}
${t.examples.neg.length ? `- Exemple négatif : "${t.examples.neg[0]}"` : ''}
`).join('\n')}

Génère une analyse structurée avec exactement ce format JSON (et rien d'autre, pas de markdown) :
{
  "topPriorities": [
    {
      "theme": "nom du thème",
      "icon": "emoji",
      "priority": 0-100,
      "action": "action concrète et spécifique à faire (1-2 phrases max)",
      "impact": "court|moyen|long",
      "effort": "faible|moyen|élevé"
    }
  ],
  "strengths": [
    {
      "theme": "nom du thème",
      "icon": "emoji",
      "message": "ce qui fonctionne bien (1 phrase)"
    }
  ],
  "globalAdvice": "conseil stratégique global en 2-3 phrases basé sur l'ensemble des avis"
}

Règles :
- topPriorities : max 3 thèmes à améliorer en urgence (priorité > 20 ou taux négatif > 30%)
- strengths : max 3 points forts à maintenir (sentiment positif dominant)
- Sois très concret, pratique et actionnable
- Réponds UNIQUEMENT en JSON valide, sans texte avant ou après`;


  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens:  1000,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(`Groq API: ${data.error.message}`);

  const text = data.choices?.[0]?.message?.content || '{}';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);

}
// ══════════════════════════════════════════════════════════════
//  POST /api/insights — analyse tous les avis du user
// ══════════════════════════════════════════════════════════════
router.post('/', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.userId }).sort({ createdAt: -1 });

    if (reviews.length < 3)
      return res.status(400).json({ error: 'Il faut au moins 3 avis pour générer des insights' });

    console.log(` Insights [${req.userNom}]: analyse de ${reviews.length} avis...`);

    // 1. Calcul des priorités par notre modèle NLP maison
    const themeData = computePriorities(reviews);

    if (!themeData.length)
      return res.status(400).json({ error: 'Aucun thème détecté dans vos avis' });

    // 2. Appel Claude AI pour les conseils
    const claudeInsights = await getGeminiInsights(themeData, reviews.length);

    console.log(`✅ Insights générés: ${claudeInsights.topPriorities?.length || 0} priorités, ${claudeInsights.strengths?.length || 0} points forts`);

    res.json({
      reviewCount: reviews.length,
      themes:      themeData,
      insights:    claudeInsights,
      generatedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error(' Insights error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;