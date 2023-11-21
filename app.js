const express = require("express");
const app = express();
const {
  getTopics,
  getArticle,
  getEndpoints,
  getCommentByArticleId,
} = require("./controllers/news.controllers");

const {
  handleServerErrors,
  handlePSQErrors,
  handleCustomErrors,
} = require("./errors");

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticle);

app.get("/api/articles/:article_id/comments", getCommentByArticleId);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "path not found" });
});

app.use(handlePSQErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
