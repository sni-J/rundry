const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../config');

const userSchema = mongoose.Schema({
  user_id: String,
  password: String,
  name: String,
  dorm: String,
  room_no: Number,
});


userSchema.statics.create = function (user_id, password, name, dorm, room_no){
  const encrypted = crypto.createHmac('sha1', config.secret)
                          .update(password)
                          .digest('base64');
  const user = new this({
    user_id,
    password: encrypted,
    name,
    dorm,
    room_no,
  });

  return user.save();
}

userSchema.statics.update = function (user, changed){
  for(info in changed) {
    user[info]=changed[info];
  }

  if(changed.password){
    const encrypted = crypto.createHmac('sha1', config.secret)
    .update(changed.password)
    .digest('base64');

    user.password = encrypted;
  }

  return user.save();
}

userSchema.methods.verify = function (password){
    const encrypted = crypto.createHmac('sha1', config.secret)
                      .update(password)
                      .digest('base64');

    return this.password === encrypted;
}

const User = mongoose.model('User', userSchema);
module.exports = User;
