const express        = require('express');
const fs             = require('fs');
const path           = require('path');
const Flag           = require('../models/flag');
const Review         = require('../models/review');
const User           = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ── Middleware admin ───────────────────────────────────────────
const adminOnly = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || user.role !== 'admin')
    return res.status(403).json({ error: 'Accès réservé aux admins' });
  next();
};

// ══════════════════════════════════════════════════════════════
//  USER ROUTES
// ══════════════════════════════════════════════════════════════

// POST /api/flags — signaler un avis mal classé
router.post('/', async (req, res) => {
  try {
    const { reviewId, suggestedLabel, reason } = req.body;

    if (!reviewId || !suggestedLabel)
      return res.status(400).json({ error: 'reviewId et suggestedLabel obligatoires' });

    const review = await Review.findById(reviewId);
    if (!review)
      return res.status(404).json({ error: 'Avis introuvable' });

    // Empêcher de signaler deux fois le même avis
    const existing = await Flag.findOne({ reviewId, userId: req.userId });
    if (existing)
      return res.status(400).json({ error: 'Vous avez déjà signalé cet avis' });

    const flag = await new Flag({
      reviewId,
      userId:         req.userId,
      userNom:        req.userNom,
      reviewText:     review.text,
      predictedLabel: review.sentiment,
      suggestedLabel,
      reason:         reason || '',
    }).save();

    console.log(`🚩 Flag [${req.userNom}]: "${review.text.slice(0,40)}..." → suggère "${suggestedLabel}"`);
    res.status(201).json(flag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flags/mine — flags posés par le user connecté
router.get('/mine', async (req, res) => {
  try {
    const flags = await Flag.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/flags — tous les flags (admin)
router.get('/', adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const flags = await Flag.find(query).sort({ createdAt: -1 });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/flags/:id — accepter ou rejeter (admin)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { action, adminComment } = req.body; // action: 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action))
      return res.status(400).json({ error: 'action doit être "accept" ou "reject"' });

    const flag = await Flag.findById(req.params.id);
    if (!flag)
      return res.status(404).json({ error: 'Flag introuvable' });
    if (flag.status !== 'pending')
      return res.status(400).json({ error: 'Ce flag a déjà été traité' });

    flag.status       = action === 'accept' ? 'accepted' : 'rejected';
    flag.adminComment = adminComment || '';
    await flag.save();

    // Si accepté → écrire dans extra_data.json pour réentraînement futur
    if (action === 'accept') {
      const labelMap = { 'positif': 1, 'neutre': 0, 'négatif': -1 };
      const newExample = {
        text:  flag.reviewText,
        label: labelMap[flag.suggestedLabel] ?? 0,
        source: 'human_validated',
        flagId: flag._id.toString(),
        date:  new Date().toISOString(),
      };

      const dataPath = path.join(__dirname, '..', 'extra_data.json');
      let existing = [];
      try {
        existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      } catch { /* fichier pas encore créé */ }

      existing.push(newExample);
      fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2));

      console.log(`✅ Admin accepté flag → ajouté à extra_data.json (${existing.length} exemples validés)`);
    } else {
      console.log(`❌ Admin rejeté flag: "${flag.reviewText.slice(0,40)}..."`);
    }

    res.json(flag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flags/stats — statistiques (admin)
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const total    = await Flag.countDocuments();
    const pending  = await Flag.countDocuments({ status: 'pending' });
    const accepted = await Flag.countDocuments({ status: 'accepted' });
    const rejected = await Flag.countDocuments({ status: 'rejected' });

    // Lire le nombre d'exemples validés dans extra_data.json
    const dataPath = path.join(__dirname, '..', 'extra_data.json');
    let validatedCount = 0;
    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      validatedCount = data.length;
    } catch { /* pas encore de fichier */ }

    res.json({ total, pending, accepted, rejected, validatedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flags/extra-data — voir les exemples validés (admin)
router.get('/extra-data', adminOnly, async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '..', 'extra_data.json');
    let data = [];
    try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch { }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/flags/extra-data/:flagId — retirer un exemple validé (admin)
router.delete('/extra-data/:flagId', adminOnly, async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '..', 'extra_data.json');
    let data = [];
    try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch { }
    data = data.filter(d => d.flagId !== req.params.flagId);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ message: 'Exemple retiré', count: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;