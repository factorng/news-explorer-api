const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

const getArticles = (req, res, next) => {
  Article.find({ })
    .then((article) => res.status(201).send(article))
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
    .then((card) => res.status(200).send(card))
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
      Article.findByIdAndDelete(req.params.articleId)
        .then(() => res.status(200).send({ message: 'Статья удалена' }))
        .catch(next);
    })
    .catch(next);
};
module.exports = {
  getArticles, createArticle, deleteArticleById,
};
