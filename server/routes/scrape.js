const express        = require('express');
const authMiddleware = require('../middleware/auth');
const nlpModel       = require('../nlp');

const router = express.Router();
router.use(authMiddleware);

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// ── Détection du type d'URL ────────────────────────────────────
function detectSource(url) {
  if (url.includes('amazon.'))    return 'amazon';
  if (url.includes('trustpilot')) return 'trustpilot';
  if (url.includes('google.com/maps') || url.includes('goo.gl/maps')) return 'google';
  return null;
}

// ── Extraction du Product ID Amazon ───────────────────────────
function extractAmazonASIN(url) {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/product\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}

// ── Extraction Trustpilot domain ───────────────────────────────
function extractTrustpilotDomain(url) {
  const match = url.match(/trustpilot\.com\/review\/([^/?#]+)/i);
  return match ? match[1] : null;
}

// ── Extraction Google Maps Place ID ou query ───────────────────
function extractGooglePlace(url) {
  // Format: /maps/place/NAME/@lat,lng,...
  const match = url.match(/\/maps\/place\/([^/@]+)/i);
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

// ── Scrape Amazon reviews via SerpApi ─────────────────────────
async function scrapeAmazon(asin) {
  const params = new URLSearchParams({
    engine:      'amazon',
    type:        'reviews',
    asin,
    api_key:     SERPAPI_KEY,
  });
  const res  = await fetch(`https://serpapi.com/search?${params}`);
  const data = await res.json();

  if (data.error) throw new Error(`SerpApi: ${data.error}`);

  return (data.customer_reviews || data.reviews || []).map(r => ({
    text:    r.content || r.body || r.review || '',
    auteur:  r.profile?.name || r.name || 'Anonyme',
    etoiles: r.rating || 3,
    source:  'Amazon',
  })).filter(r => r.text.length > 10);
}

// ── Scrape Trustpilot reviews via SerpApi ─────────────────────
async function scrapeTrustpilot(domain) {
  const params = new URLSearchParams({
    engine:   'trustpilot_reviews',
    domain,
    api_key:  SERPAPI_KEY,
  });
  const res  = await fetch(`https://serpapi.com/search?${params}`);
  const data = await res.json();

  if (data.error) throw new Error(`SerpApi: ${data.error}`);

  return (data.reviews || []).map(r => ({
    text:    r.content || r.description || '',
    auteur:  r.consumer?.displayName || r.author || 'Anonyme',
    etoiles: r.rating || r.stars || 3,
    source:  'Trustpilot',
  })).filter(r => r.text.length > 10);
}

// ── Scrape Google Maps reviews via SerpApi ────────────────────
async function scrapeGoogle(query) {
  // D'abord on cherche le place_id
  const searchParams = new URLSearchParams({
    engine:  'google_maps',
    q:       query,
    api_key: SERPAPI_KEY,
    type:    'search',
  });
  const searchRes  = await fetch(`https://serpapi.com/search?${searchParams}`);
  const searchData = await searchRes.json();

  if (searchData.error) throw new Error(`SerpApi: ${searchData.error}`);

  const place = searchData.local_results?.[0];
  if (!place) throw new Error('Lieu introuvable sur Google Maps');

  const placeId = place.place_id;
  if (!placeId) throw new Error('Place ID introuvable');

  // Ensuite on récupère les reviews
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
//  POST /api/scrape — URL → reviews → NLP
// ══════════════════════════════════════════════════════════════
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL manquante' });

    const source = detectSource(url);
    if (!source) return res.status(400).json({
      error: 'URL non supportée. Utilisez Amazon, Trustpilot ou Google Maps.'
    });

    if (!SERPAPI_KEY) return res.status(500).json({ error: 'SERPAPI_KEY manquante dans .env' });

    console.log(`🔍 Scrape [${req.userNom}]: ${source} → ${url.slice(0, 60)}...`);

    let rawReviews = [];

    if (source === 'amazon') {
      const asin = extractAmazonASIN(url);
      if (!asin) return res.status(400).json({ error: 'ASIN Amazon introuvable dans l\'URL' });
      rawReviews = await scrapeAmazon(asin);
    }
    else if (source === 'trustpilot') {
      const domain = extractTrustpilotDomain(url);
      if (!domain) return res.status(400).json({ error: 'Domaine Trustpilot introuvable dans l\'URL' });
      rawReviews = await scrapeTrustpilot(domain);
    }
    else if (source === 'google') {
      const place = extractGooglePlace(url);
      if (!place) return res.status(400).json({ error: 'Lieu Google Maps introuvable dans l\'URL' });
      rawReviews = await scrapeGoogle(place);
    }

    if (!rawReviews.length)
      return res.status(404).json({ error: 'Aucun avis trouvé pour cette URL' });

    // Analyse NLP de chaque review
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

    // Stats rapides
    const pos = analyzed.filter(r => r.sentiment === 'positif').length;
    const neg = analyzed.filter(r => r.sentiment === 'négatif').length;
    const neu = analyzed.filter(r => r.sentiment === 'neutre').length;

    console.log(`Scrape terminé: ${analyzed.length} avis — ${pos}+ ${neu}~ ${neg}-`);

    res.json({
      source,
      url,
      total:    analyzed.length,
      stats:    { pos, neg, neu },
      reviews:  analyzed,
    });

  } catch (err) {
    console.error('❌ Scrape error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;