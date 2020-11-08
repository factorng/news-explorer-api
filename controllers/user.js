const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then(() => res.status(201).send({ message: 'Пользователь зарегистрирован' }))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
    // аутентификация успешна! пользователь в переменной user
      const token = jwt.sign({ _id: user._id },
        process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'something',
        { expiresIn: '7d' });
      // вернём токен
      res.send({ token });
    })
    .catch(next);
};
const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError('Пользователь с таким id не найден'))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

module.exports = {
  createUser, login, getUser,
};
