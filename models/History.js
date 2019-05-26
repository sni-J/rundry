const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
  id: String,
  user_id: String,
  start_time: Number,
  sch_end_time: Number,
  memo: String,
  pickup: Boolean,
});

module.exports = mongoose.model('History', historySchema);
