const db = require("../db/connection");
const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.readEndpoint = () => {
  return fs.readFile("endpoints.json").then((endpoints) => {
    return JSON.parse(endpoints);
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE articles.article_id = $1;`, [
      article_id,
    ])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "path not found" });
      }
      return rows[0];
    });
};
