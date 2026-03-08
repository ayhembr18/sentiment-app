const express        = require('express');
const authMiddleware = require('../middleware/auth');
const nlpModel       = require('../nlp');

const router = express.Router();
router.use(authMiddleware);

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// ── Extraction du nom du lieu depuis l'URL Google Maps ─────────
function extractGooglePlace(url) {
  const match = url.match(/\/maps\/place\/([^/@]+)/i);
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

// ── Scrape Google Maps reviews via SerpApi ────────────────────
async function scrapeGoogle(query) {
  const cleanQuery = query.replace(/@[\d.,]+.*/, '').trim();

  const searchParams = new URLSearchParams({
    engine:  'google_maps',
    q:       cleanQuery,
    api_key: SERPAPI_KEY,
    type:    'search',
    hl:      'fr',
    gl:      'tn',
    ll:      '@36.8065,10.1815,12z',
  });

  const searchRes  = await fetch(`https://serpapi.com/search?${searchParams}`);
  const searchData = await searchRes.json();

  if (searchData.error) throw new Error(`SerpApi: ${searchData.error}`);

  const place = searchData.place_results || searchData.local_results?.[0];
  if (!place) throw new Error('Lieu introuvable sur Google Maps');

  const placeId = place.place_id;
  if (!placeId) throw new Error('Place ID introuvable');

  const reviewParams = new URLSearchParams({
    engine:   'google_maps_reviews',
    place_id: placeId,
    api_key:  SERPAPI_KEY,
    hl:       'fr',
  });

  const reviewRes  = await fetch(`https://serpapi.com/search?${reviewParams}`);
  const reviewData = await reviewRes.json();

  if (reviewData.error) throw new Error(`SerpApi reviews: ${reviewData.error}`);

  return (reviewData.reviews || []).map(r => ({
    text:    r.snippet || r.text || '',
    auteur:  r.user?.name || r.author_title || 'Anonyme',
    etoiles: r.rating || 3,
    source:  'Google Maps',
  })).filter(r => r.text.length > 10);
}

// ══════════════════════════════════════════════════════════════
//  POST /api/scrape — URL Google Maps → reviews → NLP
// ══════════════════════════════════════════════════════════════
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL manquante' });

    if (!url.includes('google.com/maps') && !url.includes('goo.gl/maps'))
      return res.status(400).json({ error: 'URL non supportée. Utilisez une URL Google Maps.' });

    if (!SERPAPI_KEY) return res.status(500).json({ error: 'SERPAPI_KEY manquante dans .env' });

    const place = extractGooglePlace(url);
    if (!place) return res.status(400).json({ error: 'Lieu introuvable dans l\'URL Google Maps' });

    console.log(`🔍 Scrape [${req.userNom}]: Google Maps → "${place}"`);

    const rawReviews = await scrapeGoogle(place);

    if (!rawReviews.length)
      return res.status(404).json({ error: 'Aucun avis trouvé pour ce lieu' });

    const analyzed = rawReviews.map(r => {
      const nlp = nlpModel.predict(r.text);
      return {
        ...r,
        sentiment:  nlp.label,
        score:      nlp.score,
        confidence: nlp.confidence,
        emotions:   nlp.emotions,
        lang:       nlp.lang,
      };
    });

    const pos = analyzed.filter(r => r.sentiment === 'positif').length;
    const neg = analyzed.filter(r => r.sentiment === 'négatif').length;
    const neu = analyzed.filter(r => r.sentiment === 'neutre').length;

    console.log(` Scrape terminé: ${analyzed.length} avis — ${pos}+ ${neu}~ ${neg}-`);

    res.json({ source: 'google', url, total: analyzed.length, stats: { pos, neg, neu }, reviews: analyzed });

  } catch (err) {
    console.error(' Scrape error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;