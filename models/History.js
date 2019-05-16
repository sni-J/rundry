const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
  id: String,
  user_id: String,
  start_time: String,
  sch_end_time: String,
  memo: String,
});

module.exports = mongoose.model('History', historySchema);
