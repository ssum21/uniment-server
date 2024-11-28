const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalCredits: { type: Number, required: true },
  majorCredits: { type: Number, required: true },
  generalCredits: { type: Number, required: true },
  majors: [{ 
    name: String,
    department: String,
    requiredCredits: Number
  }]
});

module.exports = mongoose.model('University', universitySchema); 