const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const api = require('./api/api');
const auth = require('./api/auth');
const config = require('./config');

const History = require('./models/History');
const User = require('./models/User');
const Dormitory = require('./models/Dormitory');
const mongoose = require('mongoose');
const db = mongoose.connection;

db.on('error', console.error);
db.once('open', () => {
	console.log('DB connection good.');
});
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/newbie_project", {useNewUrlParser: true, useFindAndModify: false});

app.use(express.static('static/views'))
app.use('/api', api);
app.use('/api/auth', auth);

app.set('jwt-secret', config.secret);

app.get('/', (req, res) => {
	res.redirect('/main');
});

app.get('/main', (req, res) => {
	res.sendFile(__dirname+'/static/views/main.html');
});

app.get('/signin', (req, res) => {
	res.sendFile(__dirname+'/static/views/signin.html');
});

app.get('/signup', (req, res) => {
	res.sendFile(__dirname+'/static/views/signup.html');
})

app.get('/editInfo', (req, res) => {
	res.sendFile(__dirname+'/static/views/editInfo.html');
})

const server = app.listen(80, () => {
	console.log('server running at port 80');
});
