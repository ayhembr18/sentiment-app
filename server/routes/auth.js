const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/user');
const authMiddleware = require('../middleware/auth');

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sentimind_secret_key_2024';

// ── REGISTER ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { nom, email, password, boutique } = req.body;

    if (!nom || !email || !password)
      return res.status(400).json({ error: 'Nom, email et mot de passe obligatoires' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Mot de passe minimum 6 caractères' });
    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await new User({ nom, email, password: hashed, boutique: boutique || '' }).save();
    const token  = jwt.sign({ userId: user._id, nom: user.nom, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log(` Nouveau compte: ${nom} (${email})`);
    res.status(201).json({ token, user: { id: user._id, nom: user.nom, email: user.email, boutique: user.boutique } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOGIN ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email et mot de passe obligatoires' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });

    const token = jwt.sign({ userId: user._id, nom: user.nom, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log(` Connexion: ${user.nom} (${email})`);
    res.json({ token, user: { id: user._id, nom: user.nom, email: user.email, boutique: user.boutique } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ME ─────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;