const cors = require("cors");
const express = require("express");
const app = express();
const apiRouter = require("./routes/api");
const {
  handleServerErrors,
  handlePSQErrors,
  handleCustomErrors,
  pathNotFound,
} = require("./errors");

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("*", pathNotFound);

app.use(handlePSQErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
