const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  user_id: String,
  password: String,
  name: String,
  room_no: String,
});

module.exports = mongoose.model('User', userSchema);
