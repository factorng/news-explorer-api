const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

const getArticles = (req, res, next) => {
  const id = req.user._id;
  Article.find({ owner: id }).select('+owner').sort({ date: -1 })
    .then((articles) => res.status(201).send(articles))
    .catch(next);
};

const createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    // вернём записанные в базу данные
    .then((card) => res.send(card))
    // данные не записались, вернём ошибку
    .catch(next);
};

const deleteArticleById = (req, res, next) => {
  Article.findById(req.params.articleId)
    .populate('owner')
    .orFail(() => new NotFoundError('Статья не найдена'))
    .then((article) => {
      if (article.owner._id.toString() !== req.user._id) {
        throw new ForbiddenError('Удалять можно только свои статьи');
      }
      Article.deleteOne(article)
        .then(() => res.send({ message: 'Статья удалена' }))
        .catch(next);
    })
    .catch(next);
};
module.exports = {
  getArticles, createArticle, deleteArticleById,
};
