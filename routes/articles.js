const articlesRouter = require("express").Router();
const {
  getAllArticles,
  getArticleById,
  getCommentByArticleId,
  updateVotes,
  addCommentByArticleId,
} = require("../controllers/news.controllers");

articlesRouter.route("/").get(getAllArticles);

articlesRouter.route("/:article_id").get(getArticleById).patch(updateVotes);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentByArticleId)
  .post(addCommentByArticleId);

module.exports = articlesRouter;
