const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nlpModel = require('./nlp');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentimentdb')
  .then(() => console.log(' MongoDB connecté'))
  .catch(err => console.error(' MongoDB erreur:', err));

// ── Schéma MongoDB ─────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema({
  text:       { type: String, required: true },
  auteur:     { type: String, default: 'Anonyme' },
  etoiles:    { type: Number, min: 1, max: 5, default: 3 },
  sentiment:  { type: String, enum: ['positif', 'négatif', 'neutre'] },
  score:      { type: Number },
  confidence: { type: Number },
  emotions:   [String],
  lang:       { type: String },
}, { timestamps: true });

const Review = mongoose.model('Review', ReviewSchema);

// ── GET — Récupérer tous les avis ──────────────────────────────
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST — Ajouter un avis + analyse NLP ──────────────────────
app.post('/api/reviews', async (req, res) => {
  try {
    const { text, auteur, etoiles } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Le texte est obligatoire' });
    }

    // Analyse NLP maison
    const result = nlpModel.predict(text.trim());
    console.log(`📊 NLP: "${text.slice(0, 40)}..." → ${result.label} (score: ${result.score})`);

    const review = new Review({
      text:       text.trim(),
      auteur:     auteur || 'Anonyme',
      etoiles:    etoiles || 3,
      sentiment:  result.label,
      score:      result.score,
      confidence: result.confidence,
      emotions:   result.emotions,
      lang:       result.lang,
    });

    await review.save();
    res.json(review.toObject());

  } catch (err) {
    console.error(' Erreur POST /api/reviews:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE — Supprimer tous les avis (pour reset) ─────────────
app.delete('/api/reviews', async (req, res) => {
  try {
    await Review.deleteMany({});
    res.json({ message: 'Tous les avis supprimés' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('✅ Server running on port 5000'));