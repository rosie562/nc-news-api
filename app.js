const express = require("express");
const app = express();
const { getTopics } = require("./controllers/news.controllers");
const { handleServerErrors } = require("./errors");

app.use(express.json());

app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "path not found" });
});

app.use(handleServerErrors);

module.exports = app;
