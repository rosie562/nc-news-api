const userRouter = require("express").Router();
const { getAllUsers } = require("../controllers/news.controllers");

userRouter.route("/").get(getAllUsers);

module.exports = userRouter;
