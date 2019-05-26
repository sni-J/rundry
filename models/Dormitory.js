const mongoose = require('mongoose');

const dormitorySchema = mongoose.Schema({
  name: String,
  floor: Number,
  W: Number,
  D: Number,
});

module.exports = mongoose.model('Dormitory', dormitorySchema);
