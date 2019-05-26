const express = require('express');
const History = require('../models/History');
const User = require('../models/User');
const Dormitory = require('../models/Dormitory');
const router = express.Router();

router.get('/user', (req, res) => {
	// return who is me
	const data = {"user_id":"20190480","password":"ilovesparcs","name":"이원준", "dorm":"somang", "room_no":"325"};
	const { user_id, name, dorm } = data;
	return res.json({"user_id": user_id, "name":name, "dorm": dorm});
})

router.get('/user/:user_id', (req, res) => {
	const { user_id } = req.params;
	// need to check is it the right user_id
	User.findOne({user_id: user_id})
	.then((result)=>{
		if (!result) return res.status(404).end('No such user');
		return Dormitory.findOne({name: result['dorm']});
	})
	.then((dormInfo)=>{
		if(!dormInfo) return res.status(404).end('No such dormitory')
		const { name, floor, W, D } = dormInfo;
		var historyJSON = {};

		const addHistory = (machine_id) => new Promise((resolve, reject) => {
			History.find({id: machine_id})
			.then((result)=>{
				historyJSON[machine_id].status = "Available";
				result.forEach((history)=>{
					const hist = {user_id: history.user_id, start_time: history.start_time, sch_end_time: history.sch_end_time, pickup: history.pickup, memo:history.memo};
					historyJSON[machine_id].history.push(hist);
					if(historyJSON[machine_id].now.start_time<history.start_time && !history.pickup){
						historyJSON[machine_id].now = hist;
						if(historyJSON[machine_id].now.sch_end_time < new Date()){
							historyJSON[machine_id].status = "Pickup Unconfirmed";
						}else{
							historyJSON[machine_id].status = "Using";
						}
					}
				})
				resolve();
			})
			.catch((err)=>{ reject(err); })
		})

		const addUser = (user_id, machine_id) => new Promise((resolve, reject) => {
			User.find({user_id: user_id})
			.then((user)=>{
				if(user[0]){
					const { name, room_no } = user[0];
					historyJSON[machine_id].now.user_name = name;
					historyJSON[machine_id].now.user_room_no = room_no;
					// console.log(machine_id, user_id, user, name, room_no, historyJSON[machine_id]);
				}
				resolve();
			})
			.catch((err)=>{ reject(err); })
		})

		const addHistoryJSON = async () => {
			try{
				for(var f=1;f<=parseInt(floor);f++){
					for(var w=1; w<=parseInt(W); w++){
						const machine_id = name + f.toString() + "W" + w.toString();
						historyJSON[machine_id] = {now:{start_time:-1}, history:[]};
						await addHistory(machine_id);
					}
					for(var d=1;d<=parseInt(D);d++){
						const machine_id = name + f.toString() + "D" + d.toString();
						historyJSON[machine_id] = {now:{start_time:-1}, history:[]};
						await addHistory(machine_id);
					}
					for(let machine_id in historyJSON){
						let user_id = historyJSON[machine_id].now.user_id||"";
						await addUser(user_id, machine_id);
					}
				}
			}
			catch(e){
				console.log(`/user/:user_id/dorm raised an error ${e} \n where user_id is ${user_id}`);
			}
		}
		addHistoryJSON()
		.then(()=>{
			return res.json(historyJSON);
		})
	})
	.catch((err)=>{
		return res.status(500).end(err.toString());
	})
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

router.get('/history/:machine_id', (req, res) => {
	const { machine_id } = req.params;
	History.find({ id: machine_id }, (err, result) => {
		if (err) return res.status(500).end('DB error');
		return res.sendStatus(200);
	})
})

router.delete('/history/:machine_id', (req, res) => {
	const { machine_id } = req.params;
	History.find({ id: history_id }, (err, result) => {
		if (err) return res.status(500).end('DB error');
		if(!history) return res.status(404).end('None of history is deletable')

	})
})

router.post('/history', (req, res) => {
	const history = new History();
	history.id = req.body.useID;
	history.user_id = req.body.useUserID;
	history.start_time = req.body.useStartTime;
	history.sch_end_time = req.body.useEndTime;
	history.memo = req.body.memo;
	history.pickup = false;
	history.save((err, result) => {
		if (err) return res.status(500).end('DB error');
		console.log(result);
		return res.sendStatus(200);
	})
});

// sniperJ TODO: delete history(Cancel), put history(pickup), put user(account info update),

router.post('/user', (req, res) => {
	const user = new User();
	user.user_id = req.body.user_id;
	user.password = req.body.password;
	user.name = req.body.name;
	user.dorm = req.body.dorm;
	user.room_no = req.body.room_no;
	user.save((err, result) => {
		if (err) return res.status(500).end('DB error');
		console.log(result);
		return res.sendStatus(200);
	})
});

module.exports = router;
