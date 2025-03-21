import express from "express";
const router = express.Router();

import User from "../controllers/user";
import { authorize } from "../middlewares/authorization";

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
 * /user/google/login:
 *  post:
 *   summary: Login a user with Google
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - credential
 *       properties:
 *        credential:
 *         type: string
 *   responses:
 *    200:
 *     description: User logged in successfully
 */
router.post("/google/login", User.getGoogleLogin);

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

/**
 * @swagger
 * /user/{id}:
 *  get:
 *   summary: Get user info by ID
 *   tags: [User]
 *   parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      description: The ID of the user
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: User info retrieved successfully
 *    404:
 *     description: User not found
 */
router.get("/:id", User.getUserById);

/**
 * @swagger
 * /user/info:
 *  get:
 *   summary: Get user info
 *   tags: [User]
 *   security:
 *      - Authorization: []
 *   responses:
 *    200:
 *     description: User info retrieved successfully
 *    401:
 *     description: Unauthorized
 */
router.get("/", authorize, User.getUserInfo);


/**
 * @swagger
 * /user/{id}:
 *  put:
 *   summary: Update user info
 *   tags: [User]
 *   security:
 *      - Authorization: []
 *   parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      description: The ID of the user
 *      schema:
 *       type: string
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/User'
 *   responses:
 *    200:
 *     description: User updated successfully
 *    404:
 *     description: User not found
 */
router.put("/:id", User.updateUser);

export = router;
