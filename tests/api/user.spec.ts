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

  it("Invalid Logout", async () => {
    const response = await request(app)
      .post("/user/logout")
      .set("authorization", `Bearer ${refreshToken}`);
    expect(response.statusCode).toEqual(403);
  });
});
