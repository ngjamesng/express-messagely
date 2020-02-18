const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const router = require("../routes/messages");
const User = require("../models/user");
const Message = require("../models/message")
const auth = require("../routes/auth");

describe("Messages Routes Test", async function() {
  let u1;
  let u2;
  let m1;
  let testToken;

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000"
    });

    u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155550002"
    });

    let username = u1.username;
    let password = "password";
    testToken = await request(app)
          .post("/auth/login")
          .send({ username, password });
          
    let from_username = u1.username;
    let to_username = u2.username;
    let body = "Hello World";
    m1 = await Message.create({ from_username, to_username, body });
  });

  describe("GET /message/id success", function() {
    test("Can get message id, from_username, to_username, body, sent_at", async function () {
        let body = m1.body;
        let response = await request(app)
          .get(`/messages/${m1.id}`)
          .send({ _token: testToken.body.token });
        expect(response.statusCode).toBe(200);
        expect(response.body.message.body).toEqual(body);
    });
  });

  describe("GET /message/id failure", function () {
    test("returns 401 when logged out", async function () {
      let body = m1.body;
      let response = await request(app)
        .get(`/messages/${m1.id}`)
      expect(response.statusCode).toBe(401);
    });

    test("returns 401 with invalid token", async function () {
      let body = m1.body;
      let response = await request(app)
        .get(`/messages/${m1.id}`)
        .send({
          _token: "garbage"
        });
      expect(response.statusCode).toBe(401);
    });
  });
});

afterAll(async function () {
  await db.end();
});
