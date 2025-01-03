const dotenv = require('dotenv').config();
const express = require('express');
const posts = require('./controllers/post');

const indexRouter = require('./routes/');
const PORT = process.env.PORT;

const app = express();

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json());

app.use('/', indexRouter);

const postRouter = require('./routes/post');
app.use('/post', postRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
