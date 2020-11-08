require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger.js');

// router
const userRouter = require('./routes/user.js');
const articleRouter = require('./routes/article.js');
// auth
const { auth } = require('./middlewares/auth');

// controllers
const { createUser, login } = require('./controllers/user');

const { PORT = 3000 } = process.env;
const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/news-explorer', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(bodyParser.json());

app.use(requestLogger); // подключаем логгер запросов

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.use('/', auth, userRouter);
app.use('/', auth, articleRouter);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate
app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  let { statusCode = 500, message } = err;
  // eslint-disable-next-line eqeqeq
  if (err.name == 'MongoError' && err.code == 11000) {
    statusCode = 409;
    message = 'Пользователь с таким email уже зарегестрирован';
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Ошибка валидации';
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Передан некорректный идентификатор';
  }
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
