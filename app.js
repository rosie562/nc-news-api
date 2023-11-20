const express = require("express");
const app = express();
const { getTopics, getEndpoints } = require("./controllers/news.controllers");
const { handleServerErrors } = require("./errors");


app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "path not found" });
});

app.use(handleServerErrors);

module.exports = app;
