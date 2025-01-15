import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../../app";
import { generateRandomString } from "../../common";
import Comment from "../../models/comment";
import Post from "../../models/post";

const USERNAME = "user123";
const PASSWORD = "password";

describe("Comment API", () => {
  let app: Express;
  let postId: string;
  let commentId: string;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createApp({});
    await Comment.deleteMany({});
    await Post.deleteMany({});

    await request(app)
      .post("/user/register")
      .send({
        username: USERNAME,
        password: PASSWORD,
        email: `${generateRandomString(5)}@test.test`,
        name: "test name",
      });
    const loginResponse = await request(app).post("/user/login").send({
      username: USERNAME,
      password: PASSWORD,
    });
    accessToken = loginResponse.body.accessToken;
    userId = loginResponse.body.id;

    const postResponse = await request(app)
      .post("/post")
      .set("authorization", `Bearer ${accessToken}`)
      .send({
        userId,
        message: "This is a test post",
      });
    postId = postResponse.body._id;

    const commentResponse = await request(app)
      .post("/comment")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId,
        postId,
        content: "This is a test comment",
      });
    commentId = commentResponse.body._id;
  });

  afterAll(async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
    mongoose.connection.close();
  });

  test("Create Comment", async () => {
    const response = await request(app)
      .post("/comment")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId,
        postId,
        content: "This is a test comment",
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe("This is a test comment");
  });

  test("Get Comments", async () => {
    const response = await request(app).get(`/comment?post_id=${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("Update Comment", async () => {
    const response = await request(app)
      .put(`/comment/${commentId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "This is an updated test comment",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe("This is an updated test comment");
  });

  test("Delete Comment", async () => {
    const response = await request(app)
      .delete(`/comment/${commentId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(commentId);
  });
});
