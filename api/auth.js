const express = require('express');
const History = require('../models/History');
const User = require('../models/User');
const Dormitory = require('../models/Dormitory');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

const isSignedIn = (req, res, next) => {
  const token = req.headers['x-access-token'];
  const secret = req.app.get('jwt-secret');
  if(!token){ return res.status(403).json({success: false, message:'Not signed in'})}
  const decode = async () => {
    try{
      jwt.verify(token, secret, (err, decoded) => {
        if(err) return res.status(403).json({success:false, message:'Invalid Token'});
        req.decoded = decoded;
        next();
      })
    }catch(err){
      res.status(403).json({
        message: err.message,
      });
    }
  }

  decode();
}

router.get('/user', isSignedIn, (req, res) => {
  const {user_id} = req.decoded;
  User.findOne({user_id}, (err, result)=>{
    if(err) res.status(403).json({success:false, message:'Unknown Error'})
    return res.status(200).json(result);
  })
})

router.put('/user', isSignedIn, (req, res) => {
	const { user_id, oldPassword, newPassword, newPasswordCheck, name, dorm, room_no } = req.body;
	if(user_id != req.decoded.user_id){ return res.status(401).end('Unauthorized'); }

  const check = async (user) => {
    let changed = {};
    if(!user) throw new Error('User not exists');
    if(!user.verify(oldPassword)) throw new Error('Wrong password');
    if(newPassword!=""){
      if(newPassword!=newPasswordCheck) throw new Error('Password not match');
      changed.password = newPassword;
    }
    if(name!="") changed.name = name;
    if(dorm!="") changed.dorm = dorm;
    if(room_no!="") changed.room_no = room_no;
    return User.update(user, changed);
  }

  const onError = (error) => {
    console.log(error);
    res.status(403).json({
      message: error.message,
    })
  }

  User.findOne({user_id})
  .then(check)
  .then(async () => {res.sendStatus(200);})
  .catch(onError);
})

router.post('/signin', (req, res) => {
  const { user_id, password } = req.body;
  const secret = req.app.get('jwt-secret');

  const check = async (user) => {
    if(!user) throw new Error('User not exists');
    else if(!user.verify(password)) throw new Error(`Wrong password`);
    else return jwt.sign({_id: user._id, user_id: user.user_id}, secret, {expiresIn:'7d'});
  }

  const respond = (token) => {
    res.status(200).json({
      message:"signed in successfully",
      token: token,
    });
  }

  const onError = (error) => {
    res.status(403).json({
      message: error.message,
    })
  }

  User.findOne({user_id})
  .then(check)
  .then(respond)
  .catch(onError);
})

router.post('/signup', (req, res) => {
  const { user_id, password, passwordCheck, name, dorm, room_no } = req.body;
  const secret = req.app.get('jwt-secret');

  const check = async (user) => {
    if(user) throw new Error('User already exists');
    if(password != passwordCheck) throw new Error('Password does not match');
    else return User.create(user_id, password, name, dorm, room_no);
  }

  const onError = (error) => {
    res.status(403).json({
      message: error.message,
    })
  }

  User.findOne({user_id})
  .then(check)
  .then(async () => {res.sendStatus(200);})
  .catch(onError);
})

module.exports = router;
