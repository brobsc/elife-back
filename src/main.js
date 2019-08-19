require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dbConfig = require('../db/db');
const storyRoute = require('./stories.route');
const webhookRoute = require('./webhook.route');
const authMiddleware = require('./auth.middleware');

const app = express();

const PIN = process.env.PIN || '123456';
const PORT = process.env.PORT || 4000;
const FRONTPATH = '/Users/bruno/elife-news/front/dist/';

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.db, {
  useNewUrlParser: true,
}).then(() => {
  console.log('Connected to db');
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(express.static(FRONTPATH));
app.use('/', express.static(FRONTPATH));
app.use('/api', authMiddleware.checkToken, storyRoute);
app.use('/webhook', webhookRoute);

app.post('/verifyPIN', (req, res) => {
  const submittedPin = req.body.pin;

  if (submittedPin && submittedPin === PIN) {
    const token = jwt.sign({}, PIN, { expiresIn: '24h' });
    res.json({ token, msg: 'Authentication successfull' });
  } else {
    res.status(400)
      .json({ msg: 'Bad PIN' });
  }
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
