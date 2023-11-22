const express = require("express");
const app = express();
const {
  getTopics,
  getAllArticles,
  getArticleById,
  getEndpoints,
  getCommentByArticleId,
  addCommentByArticleId,
} = require("./controllers/news.controllers");

const {
  handleServerErrors,
  handlePSQErrors,
  handleCustomErrors,
} = require("./errors");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentByArticleId);

app.post("/api/articles/:article_id/comments", addCommentByArticleId)

app.all("*", (req, res) => {
  res.status(404).send({ msg: "path not found" });
});

app.use(handlePSQErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
