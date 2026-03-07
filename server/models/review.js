const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:       { type: String, required: true },
  auteur:     { type: String, default: 'Anonyme' },
  etoiles:    { type: Number, min: 1, max: 5, default: 3 },
  sentiment:  { type: String, enum: ['positif', 'négatif', 'neutre'] },
  score:      { type: Number },
  confidence: { type: Number },
  emotions:   [String],
  lang:       { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);