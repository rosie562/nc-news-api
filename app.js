const express = require("express");
const app = express();
const {
  getTopics,
  getAllArticles,
  getArticleById,
  getEndpoints,
} = require("./controllers/news.controllers");

const {
  handleServerErrors,
  handlePSQErrors,
  handleCustomErrors,
} = require("./errors");

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles)



app.all("*", (req, res) => {
  res.status(404).send({ msg: "path not found" });
});

app.use(handlePSQErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
