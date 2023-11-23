const { arch } = require("os");
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
        return Promise.reject({ status: 404, msg: `article ID ${article_id} doesn't exist` });
      }
      return rows[0];
    });
};

exports.selectCommentByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 
    ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectArticles = () => {
  let queryString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url,
    COUNT(comment_id) AS comment_count 
    FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id 
    GROUP BY articles.article_id 
    ORDER BY created_at DESC;`;

  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

exports.checkIfArticleExists = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles
    WHERE article_id = $1;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: `article id ${article_id} does not exist`,
        });
      }
      return rows;
    });
};

exports.createCommentByArticleId = (username, body, article_id) => {
  if ((!username && body) || (username && !body)) {
    return Promise.reject({
      status: 400,
      msg: "username and message required",
    });
  }
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `user ${username} does not exist`,
        });
      }
      return db
        .query(
          `INSERT INTO comments (author, body, article_id)
          VALUES ($1, $2, $3) RETURNING *;`,
          [username, body, article_id]
        )
        .then(({ rows: [comment] }) => {
          return comment;
        });
    });
};

exports.updateVotesByArticleId = (inc_votes, article_id) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: "vote incrementer needed",
    });
  }
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows[0].votes < 0) {
        return Promise.reject({
          status: 400,
          msg: "votes cannot be less than 0",
        });
      }
      return rows;
    });
};

exports.deleteCommentById = (comment_id) => {
    if (!comment_id) {
      return Promise.reject({
        status: 400,
        msg: "comment_id needed",
      });
    }
    return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [comment_id]).then(({rows})=> {
        if (rows.length === 0){
          return Promise.reject({
            status: 404,
            msg: `no comment found at comment_id ${comment_id}`,
          });  
        }
        return rows
    })
};
