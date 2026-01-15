const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unidades: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
