const {
  selectTopics,
  selectArticleById,
  readEndpoint,
  selectCommentByArticleId,
  selectArticles,
  checkIfArticleExists,
  createCommentByArticleId,
  updateVotesByArticleId,
} = require("../models/news.models");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getEndpoints = (req, res, next) => {
  readEndpoint()
    .then((endpoint) => {
      res.status(200).send({ endpoint });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  checkIfArticleExists(article_id)
    .then(() => {
      return selectCommentByArticleId(article_id);
    })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.getAllArticles = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.addCommentByArticleId = (req, res, next) => {
  const { username, body } = req.body;
  const { article_id } = req.params;
  checkIfArticleExists(article_id)
    .then(() => {
      return createCommentByArticleId(username, body, article_id);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.updateVotes = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;
  checkIfArticleExists(article_id)
    .then(() => {
      return updateVotesByArticleId(inc_votes, article_id);
    })
    .then((article) => {
      res.status(200).send({ article });
    }).catch(next);
};
