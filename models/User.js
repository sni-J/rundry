const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  user_id: String,
  password: String,
  name: String,
  dorm: String,
  room_no: Number,
});

module.exports = mongoose.model('User', userSchema);
