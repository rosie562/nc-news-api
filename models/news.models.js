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
    .query(
      `SELECT articles.*, 
      COUNT(comments.comment_id) AS comment_count 
      FROM articles 
      LEFT JOIN comments 
      ON articles.article_id = comments.article_id 
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: `article ID ${article_id} doesn't exist`,
        });
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

exports.selectArticles = (topic, sort_by, order) => {
  const validSortBy = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];
  const validOrder = ["asc", "desc", "DESC", "ASC"];
  const queryValues = [];
  
  if (sort_by && !validSortBy.includes(sort_by)){
    return Promise.reject({
      status: 400,
      msg: `${sort_by} is not a valid sort_by query`,
    });
  }
  if (order && !validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: `${order} is not a valid order query`,
    });
  }
  
  let queryString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url,
    COUNT(comment_id) AS comment_count 
    FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id `;

  if (topic) {
    queryValues.push(topic);
    queryString += `WHERE topic = $1 `;
  }

  queryString += `GROUP BY articles.article_id `

  if (order) {
    queryString += `ORDER BY created_at ${order} `;
  }

  if (sort_by) {
    queryString += `ORDER BY ${sort_by} ASC `;
  }

  if (!sort_by && !order){
    queryString += `ORDER BY created_at DESC `;
  }

  return db.query(queryString, queryValues).then(({ rows }) => {
    if (!rows.length && topic) {
      return Promise.reject({
        status: 404,
        msg: `no articles for this topic`,
      });
    }
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
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `no comment found at comment_id ${comment_id}`,
        });
      }
      return rows;
    });
};

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users;`).then(({ rows }) => {
    return rows;
  });
};
