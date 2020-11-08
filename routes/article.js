const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getArticles, createArticle, deleteArticleById,
} = require('../controllers/article.js');

router.get('/articles', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required().min(100),
  }).unknown(true),
}), getArticles);

router.post('/articles', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required().min(100),
  }).unknown(true),
  body: Joi.object().keys({
    keyword: Joi.string().required().min(2).max(30),
    title: Joi.string().required().min(2).max(30),
    text: Joi.string().required().min(2).max(30),
    date: Joi.date().required(),
    source: Joi.string().required().min(2).max(30),
    link: Joi.string().required().regex(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/),
    image: Joi.string().required().regex(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/),
  }),
}), createArticle);

router.delete('/articles/:articleId', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required().min(100),
  }).unknown(true),
  params: Joi.object().keys({
    articleId: Joi.string().required().hex().length(24),
  }).unknown(true),
}), deleteArticleById);

module.exports = router;
