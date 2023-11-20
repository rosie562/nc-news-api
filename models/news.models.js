const db = require("../db/connection");
const endpoints = require("../endpoints.json");
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
}