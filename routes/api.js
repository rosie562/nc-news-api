const apiRouter = require("express").Router();
const usersRouter = require("./users");
const articlesRouter = require("./articles");
const commentsRouter = require("./comments");
const topicsRouter = require("./topics");
const { getEndpoints } = require("../controllers/news.controllers");

apiRouter.use("/users", usersRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/topics", topicsRouter);

apiRouter.route("/").get(getEndpoints);

module.exports = apiRouter;
