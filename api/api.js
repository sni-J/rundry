const express = require('express');
const History = require('../models/History');
const User = require('../models/User');
const Dormitory = require('../models/Dormitory');
const mongoose = require('mongoose');
const mid = require('./middleware');

const router = express.Router();

router.get('/user/:user_id', async (req, res) => {
   const { user_id } = req.params;
   // need to check is it the right user_id
   const result = await User.findOne({user_id: user_id})
   if (!result) return res.status(404).end('No such user');
   const dormInfo = await Dormitory.findOne({name: result['dorm']});
   if(!dormInfo) return res.status(404).end('No such dormitory')
   const { name, floor, W, D } = dormInfo;
   let promises = [];
   const addHistory = async (machine_id, historyJSON) => {
      try {
        const result = await History.find({id: machine_id});
        historyJSON[machine_id].status = "Available";
        result.forEach((history)=>{
          historyJSON[machine_id].history.push(history);
          if(historyJSON[machine_id].now.start_time<history.start_time && !history.pickup){
						let hist = {_id: history._id, user_id: history.user_id, id: history.id, start_time: history.start_time, sch_end_time: history.sch_end_time, memo: history.memo, pickup: history.pickup};
            historyJSON[machine_id].now = hist;
            if(historyJSON[machine_id].now.sch_end_time < new Date()){
            	historyJSON[machine_id].status = "Pickup Unconfirmed";
            }else{
              historyJSON[machine_id].status = "Using";
          	}
          }
       	})
		 		return;
      } catch (err) {
         throw new Error('db error finding history');
      }
   }
   const addUser = async (user_id, machine_id, historyJSON) => {
      try {
       	const user = await User.find({user_id: user_id});
     		if(user[0]){
	        const { name, room_no } = user[0];
	        historyJSON[machine_id].now["user_name"] = name;
	        historyJSON[machine_id].now["user_room_no"] = room_no;
     		}else{
					historyJSON[machine_id].now["user_name"] = "???";
					historyJSON[machine_id].now["user_room_no"] = "???";
				}
      } catch (err) {
         throw new Error('db error finding user')
      }
   }
	 try {
		 let historyJSON = {};
		 for(var f=1;f<=parseInt(floor);f++){
			 for(var w=1; w<=parseInt(W); w++){
					const machine_id = name + f.toString() + "W" + w.toString();
					historyJSON[machine_id] = {now:{start_time:-1}, history:[]};
					promises.push(addHistory(machine_id, historyJSON));
			 }
			 for(var d=1;d<=parseInt(D);d++){
					const machine_id = name + f.toString() + "D" + d.toString();
					historyJSON[machine_id] = {now:{start_time:-1}, history:[]};
					promises.push(addHistory(machine_id, historyJSON));
			 }
		}
		await Promise.all(promises);
		let promises2=[];
		for(let machine_id in historyJSON){
			let user_id = historyJSON[machine_id].now.user_id||"";
			promises2.push(addUser(user_id, machine_id, historyJSON));
		}
		await Promise.all(promises2);
		return res.status(200).json(historyJSON);
	} catch(err){
		 console.log(`/user/:user_id/dorm raised an error ${e} \n where user_id is ${user_id}`);
		 return res.status(500).end(err.toString());
	}
})

router.get('/dormitory/:dorm_name', (req, res) => {
	const { dorm_name } = req.params;
	Dormitory.findOne({ name: dorm_name })
	.then((dormInfo)=>{
		if(!dormInfo) return res.status(404).end('No such dormitory');
		const { floor, W, D } = dormInfo;
		return res.json({floor, W, D});
	})
	.catch((err)=>{
		return res.status(500).end(err.toString());
	})
})

router.post('/history', mid.isSignedIn, (req, res) => {
	const history = new History();
	const { notme } = req.body;
	if(notme){
		history.user_id = "";
	}else{
		if(req.body.useUserID!=req.decoded.user_id) {
			console.log("User "+req.decoded.user_id+" tried to post history in ID "+req.body.useUserID);
			return res.status(401).end('Unauthorized');
		}
		history.user_id = req.body.useUserID;
	}
	history.id = req.body.useID;
	history.start_time = req.body.useStartTime;
	history.sch_end_time = req.body.useEndTime;
	history.memo = req.body.memo;
	history.pickup = false;
	History.find({end_time: {$gt: history.start_time}, id: history.id})
  .then((hist) => {
    if(hist.length!=0) return res.status(400).end('Invalid Input')
  });
	if(Math.abs(history.start_time-(new Date().getTime()))>1000*60*3) return res.status(400).end('Invalid Input');
	if(Math.abs(history.sch_end_time-(new Date().getTime()))>1000*60*60*3) return res.status(400).end('Invalid Input');
	if(history.sch_end_time<history.start_time) return res.status(400).end('Invalid Input');
	history.save((err, result) => {
		if (err) return res.status(500).end('DB error');
		return res.sendStatus(200);
	})
});

router.put('/history', (req, res) => {
	const { _id, pickup } = req.body;
	History.findOneAndUpdate({ _id }, { pickup }, (err, result) => {
		if (err) return res.status(500).end('DB error');
		return res.sendStatus(200);
	})
})

router.delete('/history/:_id', mid.isSignedIn, (req, res) => {
	const { _id } = req.params;
	History.findOneAndDelete({ _id, user_id: req.decoded.user_id }, (err, result) => {
		if (err) return res.status(500).end('DB error');
		if(result.length==0) return res.status(401).end('Unauthorized');
		return res.sendStatus(200);
	})
})

router.post('/user', (req, res) => {
	User.find({user_id: req.body.user_id})
	.then((user)=>{
		if(user.length!=0) return res.status(200).end('User already exists');
		else{
			const user = new User();
			user.user_id = req.body.user_id;
			user.password = req.body.password;
			user.name = req.body.name;
			user.dorm = req.body.dorm;
			user.room_no = req.body.room_no;
			user.save((err, result) => {
				if (err) return res.status(500).end('DB error');
				return res.sendStatus(200);
			})
		}
	})
});

module.exports = router;
