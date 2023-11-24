# Northcoders News API

## Background

This project creates and tests a REST API designed to interact with a PostgreSQL database for a reddit-style news website.

The hosted version can be found [here](https://nc-news-fsgh.onrender.com/api)

## Requirements
Node.js minimum v16.0

PostgreSQL minimum v14.0

# Installation

To install the API locally, follow the following instructions:

1. ``cd `` into the folder you would like the repo to be in, and clone the repo by pasting the following into your terminal:
```
git clone https://github.com/rosie562/nc-news-api.git
```
2. run ```npm install``` to install the package managers and dependencies already in the package.json file

3. Create two .env files in the highest level of the directory tree:

.env.test containing:
```
  PGDATABASE=nc_news_test
````
.env.development containing:
```
  PGDATABASE=nc_news
```
5. Run the following commands to create and seed our databases
```
npm run setup-dbs
npm run seed
```
6. To run tests of the code, run ```npm test```