const mongoose = require('mongoose');

const FlagSchema = new mongoose.Schema({
  reviewId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  userNom:         { type: String },
  reviewText:      { type: String, required: true },
  predictedLabel:  { type: String, required: true },   // ce que le modèle a dit
  suggestedLabel:  { type: String, required: true },   // ce que l'user pense
  reason:          { type: String, default: '' },      // commentaire optionnel
  status:          { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  adminComment:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Flag', FlagSchema);