import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../../app";
import { generateRandomString } from "../../common";
import Comment from "../../models/comment";
import Post from "../../models/post";
import { describe, beforeAll, afterAll, expect, test } from "@jest/globals";

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

  test("Create Comment with no Authorization", async () => {
    const response = await request(app).post("/comment").send({
      userId,
      postId,
      content: "This is a test comment",
    });
    expect(response.statusCode).toBe(401);
  });

  test("Create Comment with invalid Post ID", async () => {
    const response = await request(app)
      .post("/comment")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId,
        postId: "invalid_post_id",
        content: "This is a test comment",
      });
    expect(response.statusCode).toBe(500);
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

  test("Get Comment by ID", async () => {
    const response = await request(app)
      .get(`/comment/${commentId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentId);
  });

  test("Delete Comment", async () => {
    const commentResponse = await request(app)
      .post("/comment")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId,
        postId,
        content: "This is a test comment",
      });
    expect(commentResponse.statusCode).toBe(201);
    console.log(commentResponse.body);
    const response = await request(app)
      .delete(`/comment/${commentResponse.body._id}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(commentResponse.body._id);
  });


  test("Delete Comment with no Authorization", async () => {
    const response = await request(app)
      .delete(`/comment/${commentId}`);
    expect(response.statusCode).toBe(401);
  });


  test("Get Comment by Invalid ID", async () => {
    const response = await request(app)
      .get(`/comment/invalid_id`);
    expect(response.statusCode).toBe(500);
  });
});
