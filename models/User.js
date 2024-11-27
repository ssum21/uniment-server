const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  socialType: { 
    type: String, 
    enum: ['local', 'google', 'kakao', 'apple'],
    default: 'local'
  },
  socialId: String,
  schoolInfo: {
    name: String,
    major: String,
    admissionYear: Number
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (this.socialType !== 'local') return next();
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.socialType !== 'local') return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);