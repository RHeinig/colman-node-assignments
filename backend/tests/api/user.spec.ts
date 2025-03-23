import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../../app";
import { generateRandomString } from "../../common";
import User from "../../models/user";
import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";

describe("User API", () => {
  let app: Express;
  let refreshToken: string;
  let accessToken: string;

  const username = `test_username_${generateRandomString(5)}`;
  const password = "test_password";

  beforeAll(async () => {
    app = await createApp({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    mongoose.connection.close();
  });

  it("Register", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({
        username,
        password,
        email: `${generateRandomString(5)}@test.test`,
        name: "test name",
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty("Message", "New user created");
  });

  it("Register with missing required fields", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({
        username,
        email: `${generateRandomString(5)}@test.test`,
        name: "test name",
      });
    expect(response.statusCode).toEqual(400);
  });

  it("Duplicate Registration", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({
        username,
        password,
        email: `${generateRandomString(5)}@test.test`,
        name: "test name",
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty("Message", "User already exists");
  });

  it("Login", async () => {
    const response = await request(app).post("/user/login").send({
      username,
      password,
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    refreshToken = response.body.refreshToken;
    accessToken = response.body.accessToken;
  });

  it("Login with missing fields", async () => {
    const response = await request(app)
      .post("/user/login")
      .send({
        username,
      });
    expect(response.statusCode).toEqual(500);
  });

  it("Get User Info", async () => {
    const response = await request(app)
      .get("/user")
      .set("authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toEqual(200);
  });

  it("Get User Info without token", async () => {
    const response = await request(app).get("/user");
    expect(response.statusCode).toEqual(401);
  });

  it("Get User Info with invalid token", async () => {
    const response = await request(app)
      .get("/user")
      .set("authorization", "Bearer invalid-token");
    expect(response.statusCode).toEqual(403);
  });

  it("Update User Info", async () => {
    const user = await User.findOne({ username });
    const response = await request(app)
      .put(`/user/${user?._id}`)
      .set("authorization", `Bearer ${accessToken}`)
      .send({
        updatedUser: JSON.stringify({
          name: "test name 2",
        }),
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("Message", "User updated successfully");
  });

  it("Update User Info with invalid body", async () => {
    const user = await User.findOne({ username });
    const response = await request(app)
      .put(`/user/${user?._id}`)
      .set("authorization", `Bearer ${accessToken}`)
      .send({
        updatedUser: "invalid-json",
      });
    expect(response.statusCode).toEqual(500);
  });

  it("Update User Info with missing body", async () => {
    const user = await User.findOne({ username });
    const response = await request(app)
      .put(`/user/${user?._id}`)
      .set("authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toEqual(500);
  });

  it("Update non-existent user", async () => {
    const response = await request(app)
      .put(`/user/${new mongoose.Types.ObjectId().toHexString()}`)
      .set("authorization", `Bearer ${accessToken}`)
      .send({
        updatedUser: JSON.stringify({
          name: "test name 2",
        }),
      });
    expect(response.statusCode).toEqual(404);
  });

  it("Get user by id", async () => {
    const user = await User.findOne({ username });
    const response = await request(app)
      .get(`/user/${user?._id}`)
      .set("authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toEqual(200);
  });

  it("Get non-existent user by id", async () => {
    const response = await request(app)
      .get(`/user/${new mongoose.Types.ObjectId().toHexString()}`)
      .set("authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toEqual(404);
  });

  it("Get user by id without token", async () => {
    const user = await User.findOne({ username });
    const response = await request(app).get(`/user/${user?._id}`);
    expect(response.statusCode).toEqual(200);
  });

  it("User Not Found", async () => {
    const response = await request(app).post("/user/login").send({
      username: "wrong username",
      password,
    });
    expect(response.statusCode).toEqual(404);
  });

  it("Unauthorized Login", async () => {
    const response = await request(app).post("/user/login").send({
      username,
      password: "wrong password",
    });
    expect(response.statusCode).toEqual(401);
  });

  it("Refresh Token", async () => {
    const response = await request(app)
      .post("/user/refreshToken")
      .set("authorization", `Bearer ${refreshToken}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });

  it("Refresh Token without token", async () => {
    const response = await request(app).post("/user/refreshToken");
    expect(response.statusCode).toEqual(401);
  });

  it("Invalid Refresh Token", async () => {
    const response = await request(app)
      .post("/user/refreshToken")
      .set("authorization", `Bearer invalid_token`);

    expect(response.statusCode).toEqual(403);
  });

  it("Logout", async () => {
    const response = await request(app)
      .post("/user/logout")
      .set("authorization", `Bearer ${refreshToken}`);
    expect(response.statusCode).toEqual(200);
  });

  it("Logout without token", async () => {
    const response = await request(app).post("/user/logout");
    expect(response.statusCode).toEqual(401);
  });

  it("Invalid Logout", async () => {
    const response = await request(app)
      .post("/user/logout")
      .set("authorization", `Bearer invalid_token`);
    expect(response.statusCode).toEqual(403);
  });

  it("Get User Info Unauthorized", async () => {
    const response = await request(app).get("/user");
    expect(response.statusCode).toEqual(401);
  });
});
