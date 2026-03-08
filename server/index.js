const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes   = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const flagRoutes   = require('./routes/flags');
const scrapeRoutes = require('./routes/scrape');

const app = express();
app.use(cors());
app.use(express.json());

// ── Connexion MongoDB ──────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentimentdb')
  .then(() => console.log(' MongoDB connecté'))
  .catch(err => console.error(' MongoDB erreur:', err));

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/flags',   flagRoutes);
app.use('/api/scrape',  scrapeRoutes);

// ── Démarrage ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));