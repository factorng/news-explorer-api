const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUser,
} = require('../controllers/user');

router.get('/users/me', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required().min(100),
  }).unknown(true),
}), getUser);

module.exports = router;
