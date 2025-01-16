import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../../app";
import { generateRandomString } from "../../common";
import Post from "../../models/post";

const USERNAME = "user123";
const PASSWORD = "password";

describe("Post API", () => {
  let app: Express;
  let postId: string;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createApp({});
    await Post.deleteMany({});

    await request(app)
      .post("/user/register")
      .send({
        username: USERNAME,
        password: PASSWORD,
        email: `${generateRandomString(5)}@test.test`,
        name: "test name",
      });
    const response = await request(app).post("/user/login").send({
      username: USERNAME,
      password: PASSWORD,
    });
    accessToken = response.body.accessToken;
    userId = response.body.id;
  });

  afterAll(async () => {
    await Post.deleteMany({});
    mongoose.connection.close();
  });

  describe("POST /post", () => {
    it("should create a new post", async () => {
      const newPost = {
        message: "This is a test post",
      };

      const response = await request(app)
        .post("/post")
        .set("authorization", `Bearer ${accessToken}`)
        .send(newPost);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.message).toBe(newPost.message);
      postId = response.body._id;
    });

    it("should return 401 if user is unauthorized", async () => {
      const newPost = {
        message: "This is a test post",
      };

      const response = await request(app).post("/post").send(newPost);

      expect(response.statusCode).toBe(401);
      expect(response.text).toBe("Unauthorized");
    });
  });

  describe("GET /post", () => {
    it("should get all posts", async () => {
      const response = await request(app).get("/post");

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /post/:post_id", () => {
    it("should get a post by ID", async () => {
      const response = await request(app).get(`/post/${postId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("_id", postId);
    });

    it("should return 404 if post is not found", async () => {
      const response = await request(app).get(
        `/post/${new mongoose.Types.ObjectId().toHexString()}`
      );

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("Status", "Not Found");
    });
  });

  describe("GET /post?sender=:senderId", () => {
    it("should get posts by sender", async () => {
      const senderId = userId;
      const response = await request(app).get(`/post?sender=${senderId}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("PUT /post/:post_id", () => {
    it("should update a post", async () => {
      const updatedPost = {
        message: "This is an updated test post",
      };

      const response = await request(app)
        .put(`/post/${postId}`)
        .set("authorization", `Bearer ${accessToken}`)
        .send(updatedPost);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("_id", postId);
      expect(response.body.message).toBe(updatedPost.message);
    });

    it("should return 404 if post to update is not found", async () => {
      const updatedPost = {
        title: "Non-existent Post",
        content: "This post does not exist",
      };

      const response = await request(app)
        .put(`/post/${new mongoose.Types.ObjectId().toHexString()}`)
        .set("authorization", `Bearer ${accessToken}`)
        .send(updatedPost);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("Status", "Not Found");
    });
  });

  describe("DELETE /post/:post_id", () => {
    it("should delete a post", async () => {
      const newPost = {
        message: "This is a test post to delete",
      };
      const postResponse = await request(app)
        .post("/post")
        .set("authorization", `Bearer ${accessToken}`)
        .send(newPost);
      const response = await request(app)
        .delete(`/post/${postResponse.body._id}`)
        .set("authorization", `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(200);
    });

    it("should return 404 if post to delete is not found", async () => {
      const response = await request(app)
        .delete(`/post/${new mongoose.Types.ObjectId().toHexString()}`)
        .set("authorization", `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("Status", "Not Found");
    });
  });
});
