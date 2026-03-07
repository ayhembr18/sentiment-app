const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nom:      { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  boutique: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);