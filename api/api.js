const express = require('express');
const History = require('../models/History');
const User = require('../models/User');
const router = express.Router();

router.post('/history', (req, res) => {
	const history = new History();
	history.id = req.body.id;
	history.user_id = req.body.user_id;
	history.start_time = req.body.start_time;
	history.sch_end_time = req.body.sch_end_time;
	history.memo = req.body.memo;		
});

router.post('/user', (req, res) => {
	const user = new User();
	user.user_id = req.body.user_id;
	user.password = req.body.password;
	user.name = req.body.name;
	user.room_no = req.body.room_no;
});

module.exports = router;
