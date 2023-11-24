const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("GET:200 responds with an array of all topic objects with slug and description properties ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
        expect(topics).toEqual([
          { slug: "mitch", description: "The man, the Mitch, the legend" },
          { slug: "cats", description: "Not dogs" },
          { slug: "paper", description: "what books are made of" },
        ]);
      });
  });
});

describe("ANY /notapath", () => {
  test("404: should respond with an error message if the path is not found", () => {
    return request(app)
      .get("/notapath")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("path not found");
      });
  });
});

describe("GET /api", () => {
  test("200: should respond with an object describing all the available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe("object");
        const { endpoint } = body;
        expect(endpoint).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: responds with an individual article ", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
      });
  });
  test("404: should respond with an error message if the path does not exist", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article ID 999 doesn't exist");
      });
  });
  test("400: should respond with an error message if the path is not valid", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("200: response has comment_count property of total count of all the comments with this article_id ", () => {
    return request(app)
    .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty('comment_count')
        expect(article['comment_count']).toBe('11');
      });
  });
});


describe("GET /api/articles/:article_id/comments", () => {
  test("200: returns an array of comments for the given article_id with the correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(11);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
        });
      });
  });
  test("200: returns an empty array for the given article_id with a valid id that has no comments", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(0);
        expect(comments).toEqual([]);
      });
  });
  test("404: should respond with an error message if the path does not exist", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article id 999 does not exist");
      });
  });
  test("400: should respond with an error message if the path is not valid", () => {
    return request(app)
      .get("/api/articles/banana/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of all the articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(typeof article).toBe("object");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("200: when a topic query is requested, returns a filtered array of the articles with the requested topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("404: should return a 404 error message when the topic requested does not exist", () => {
    return request(app)
      .get("/api/articles?topic=dogs")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no articles for this topic");
      });
  });
   test("404: should return a 404 error message when the topic exists but there are no articles with that topic", () => {
     return request(app)
       .get("/api/articles?topic=paper")
       .expect(404)
       .then(({ body }) => {
         expect(body.msg).toBe("no articles for this topic");
       });
   });
   test("200: when a sort_by query is requested, returns a filtered array of the articles with the requested topic in descending order by default", () => {
     return request(app)
       .get("/api/articles?sort_by=title")
       .expect(200)
       .then(({ body }) => {
         const { articles } = body;
         expect(articles).toBeSortedBy('title');
         });
       });
   });
   test("400: returns an error message when a sort_by query is requested that isn't a valid column", () => {
     return request(app)
       .get("/api/articles?sort_by=banana")
       .expect(400)
       .then(({ body }) => {
         expect(body.msg).toBe("banana is not a valid sort_by query");
         });
       })
   test("200: when a order query is requested, returns a filtered array of the articles ordered by created_at date by default", () => {
     return request(app)
       .get("/api/articles?order=ASC")
       .expect(200)
       .then(({ body }) => {
         const { articles } = body;
         expect(articles).toBeSortedBy("created_at");
       });
   });
   test("400: returns an error message when an order query is requested that isn't a valid query", () => {
     return request(app)
       .get("/api/articles?order=banana")
       .expect(400)
       .then(({ body }) => {
         expect(body.msg).toBe("banana is not a valid order query");
       });
   });


describe("POST /api/articles/:article_id/comments", () => {
  test("201: should return an object with the correct properties of a posted comment", () => {
    const newComment = {
      username: "icellusedkars",
      body: "hello world",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty("comment_id");
        expect(comment).toHaveProperty("body");
        expect(comment).toHaveProperty("article_id");
        expect(comment).toHaveProperty("author");
        expect(comment).toHaveProperty("votes");
        expect(comment).toHaveProperty("created_at");
      });
  });
  test("404: should respond with an error message if the user does not exist", () => {
    const newComment = {
      username: "northcoders",
      body: "hello world",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("user northcoders does not exist");
      });
  });
  test("404: should respond with an error message if the article does not exist", () => {
    const newComment = {
      username: "icellusedkars",
      body: "hello world",
    };
    return request(app)
      .post("/api/articles/999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article id 999 does not exist");
      });
  });
  test("400: should respond with an error message if the path is not valid", () => {
    const newComment = {
      username: "icellusedkars",
      body: "hello world",
    };
    return request(app)
      .post("/api/articles/banana/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("400: should respond with an error message if there are missing properties on request body", () => {
    const newComment = {
      username: "icellusedkars",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("username and message required");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: should update the number of votes on a given article by 1 and return an updated article", () => {
    const newVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual([
          {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 101,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          },
        ]);
      });
  });
  test("200: should decrease the number of votes on a given article by the given amount and return an updated article", () => {
    const newVote = { inc_votes: -10 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual([
          {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 90,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          },
        ]);
      });
  });
  test("400: should return an error message if the inc_votes decreases the vote total on the article to less than zero", () => {
    const newVote = { inc_votes: -101 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("votes cannot be less than 0");
      });
  });
  test("404: should respond with an error message if the article does not exist", () => {
    const newVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/65")
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article id 65 does not exist");
      });
  });
  test("400: should respond with an error message if there are missing properties on request body", () => {
    const newVote = { other_property: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("vote incrementer needed");
      });
  });
  test("400: should respond with an error message if inc_votes is not a number", () => {
    const newVote = { inc_votes: "banana" };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("400: should respond with an error message if the path is not valid", () => {
    const newVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/banana")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: should delete the comment at the given comment id and not send a response", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  test("404: should respond with an error message if the comment id does not exist", () => {
    return request(app)
      .delete("/api/comments/80")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no comment found at comment_id 80");
      });
  });
  test("400: should respond with an error message if comment_id is not valid", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("200: returns an array of user objects with the correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toHaveLength(4);
        expect(users).toEqual(expect.any(Array));
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });
});
