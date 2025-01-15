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
 *     - sender
 *    properties:
 *     message:
 *      type: string
 *      description: The content of the post
 *     sender:
 *      type: string
 *      description: The ID of the post creator
 *    example:
 *     message: 'This is a post'
 *     sender: '60f7b3b4b6f1f3f8b4f3b1b1'
 */

/**
 * @swagger
 * /post:
 *  post:
 *   summary: Create a new post
 *   tags: [Post]
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
 *        $ref: '#/components/schemas/Post'
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
 *        $ref: '#/components/schemas/Post'
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
 *         $ref: '#/components/schemas/Post'
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
 *   parameters:
 *    - in: path
 *      name: post_id
 *      required: true
 *      description: The ID of the post
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: The post is updated
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Post'
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
 *        $ref: '#/components/schemas/Post'
 *    400:
 *     description: Failed to delete the post
 * */
router.delete("/:post_id", authorize, Post.deletePost);

export = router;
