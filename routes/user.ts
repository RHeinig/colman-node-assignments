import express from "express";
const router = express.Router();

import User from "../controllers/user";

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *     - username
 *     - password
 *     - email
 *     - name
 *    properties:
 *     username:
 *      type: string
 *      description: The username of the user
 *     password:
 *      type: string
 *      description: The password of the user
 *     email:
 *      type: string
 *      description: The email of the user
 *     name:
 *      type: string
 *      description: The name of the user
 *    example:
 *     username: 'testuser'
 *     password: 'testpassword'
 *     email: 'testuser@test.com'
 *     name: 'Test User'
 */

/**
 * @swagger
 * /user/register:
 *  post:
 *   summary: Register a new user
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/User'
 *   responses:
 *    201:
 *     description: User registered successfully
 *    400:
 *     description: User registration failed
 */
router.post("/register", User.register);

/**
 * @swagger
 * /user/login:
 *  post:
 *   summary: Login a user
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - username
 *        - password
 *       properties:
 *        username:
 *         type: string
 *        password:
 *         type: string
 *   responses:
 *    200:
 *     description: User logged in successfully
 *    401:
 *     description: Invalid credentials
 */
router.post("/login", User.login);

/**
 * @swagger
 * /user/refreshToken:
 *  post:
 *   summary: Refresh user token
 *   tags: [User]
 *   security:
 *      - Authorization: []
 *   responses:
 *    200:
 *     description: Token refreshed successfully
 *    403:
 *     description: Invalid token
 */
router.post("/refreshToken", User.refreshToken);

/**
 * @swagger
 * /user/logout:
 *  post:
 *   summary: Logout a user
 *   tags: [User]
 *   security:
 *      - Authorization: []
 *   responses:
 *    200:
 *     description: User logged out successfully
 */
router.post("/logout", User.logout);

export = router;
