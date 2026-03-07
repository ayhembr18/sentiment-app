const express       = require('express');
const Review        = require('../models/review');
const authMiddleware = require('../middleware/auth');
const nlpModel      = require('../nlp');

const router = express.Router();

// Toutes les routes sont protégées par authMiddleware
router.use(authMiddleware);

// ── GET — avis du user connecté uniquement ─────────────────────
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST — ajouter un avis + analyse NLP ──────────────────────
router.post('/', async (req, res) => {
  try {
    const { text, auteur, etoiles } = req.body;

    if (!text || text.trim() === '')
      return res.status(400).json({ error: 'Le texte est obligatoire' });

    const result = nlpModel.predict(text.trim());
    console.log(` NLP [${req.userNom}]: "${text.slice(0, 40)}..." → ${result.label} (${result.score})`);

    const review = await new Review({
      userId:     req.userId,
      text:       text.trim(),
      auteur:     auteur || 'Anonyme',
      etoiles:    etoiles || 3,
      sentiment:  result.label,
      score:      result.score,
      confidence: result.confidence,
      emotions:   result.emotions,
      lang:       result.lang,
    }).save();

    res.json(review.toObject());
  } catch (err) {
    console.error(' Erreur POST /api/reviews:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE — supprimer tous les avis du user ──────────────────
router.delete('/', async (req, res) => {
  try {
    await Review.deleteMany({ userId: req.userId });
    res.json({ message: 'Tous vos avis supprimés' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;