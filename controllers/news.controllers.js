const {
  selectTopics,
  selectArticleById,
  readEndpoint,
  selectCommentByArticleId,
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

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
 
exports.getCommentByArticleId = (req, res, next) => {
    const { article_id } = req.params;
    selectCommentByArticleId(article_id)
      .then((comment) => {
        console.log(comment)
        res.status(200).send({ comment });
      })
      .catch(next);
}