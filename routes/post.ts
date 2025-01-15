import express from "express";
const router = express.Router();

import Post from "../controllers/post";
import { authorize } from "../middlewares/authorization";

/**
 * @swagger
 * components:
 *  schemas:
 *   Post:
 *    type: object
 *    required:
 *     - message
 *    properties:
 *     message:
 *      type: string
 *      description: The content of the post
 *    example:
 *     message: 'This is a post'
 *  responses:
 *   PostResponse:
 *    type: object
 *    properties:
 *     userId:
 *      type: string
 *     message:
 *      type: string
 *     postId:
 *      type: string
 *     createdAt:
 *      type: string
 *      format: date-time
 *     updatedAt:
 *      type: string
 *      format: date-time
 *    example:
 *     userId: '60f7b3b4b6f1f3f8b4f3b1b2'
 *     message: 'This is a post'
 *     postId: '60f7b3b4b6f1f3f8b4f3b1b1'
 */

/**
 * @swagger
 * /post:
 *  post:
 *   summary: Create a new post
 *   tags: [Post]
 *   security:
 *      - Authorization: []
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Post'
 *   responses:
 *    201:
 *     description: The post was successfully created
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/responses/PostResponse'
 *    400:
 *     description: Post creation failed
 * */
router.post("/", authorize, Post.addPost);

/**
 * @swagger
 * /post/{post_id}:
 *  get:
 *   summary: Get a post by ID
 *   tags: [Post]
 *   parameters:
 *    - in: path
 *      name: post_id
 *      required: true
 *      description: The ID of the post
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: The post is returned
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/responses/PostResponse'
 *    404:
 *     description: The post was not found
 *    400:
 *     description: Failed to get the post
 * */
router.get("/:post_id", Post.getPostById);

/**
 * @swagger
 * /post:
 *  get:
 *   summary: Get all posts
 *   tags: [Post]
 *   parameters:
 *    - in: query
 *      name: sender
 *      required: false
 *      description: Get all posts by a specific sender
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: The list of posts is returned
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/responses/PostResponse'
 *    400:
 *     description: Failed to get posts
 * */
router.get("/", Post.getAllPosts);
router.get("/", Post.getPostsBySender);

/**
 * @swagger
 * /post/{post_id}:
 *  put:
 *   summary: Update a post by ID
 *   tags: [Post]
 *   security:
 *      - Authorization: []
 *   parameters:
 *    - in: path
 *      name: post_id
 *      required: true
 *      description: The ID of the post
 *      schema:
 *       type: string
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Post'
 *   responses:
 *    200:
 *     description: The post is updated
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/responses/PostResponse'
 *    404:
 *     description: The post was not found
 *    400:
 *     description: Failed to update the post
 * */
router.put("/:post_id", authorize, Post.updatePost);

/**
 * @swagger
 * /post/{post_id}:
 *  delete:
 *   summary: Delete a post by ID
 *   tags: [Post]
 *   security:
 *      - Authorization: []
 *   parameters:
 *    - in: path
 *      name: post_id
 *      required: true
 *      description: The ID of the post
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: The post is deleted
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/responses/PostResponse'
 *    400:
 *     description: Failed to delete the post
 * */
router.delete("/:post_id", authorize, Post.deletePost);

export = router;
