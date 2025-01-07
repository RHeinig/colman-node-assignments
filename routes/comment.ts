import express from "express";
const router = express.Router();

import Comment from "../controllers/comment";

/**
 * @swagger
 * components:
 *  schemas:
 *   Comment:
 *    type: object
 *    required:
 *     - postId
 *     - content
 *     - senderId
 *    properties:
 *     postId:
 *      type: string
 *      description: The post ID the comment belongs to
 *     content:
 *      type: string
 *      description: The content of the comment
 *     senderId:
 *      type: string
 *      description: The comment sender id
 *    example:
 *     postId: '60f7b3b4b6f1f3f8b4f3b1b1'
 *     content: 'This is a comment'
 *     senderId: '60f7b3b4b6f1f3f8b4f3b1b1'
 */

/**
 * @swagger
 * /comment:
 *  post:
 *   summary: Create a new comment
 *   tags: [Comment]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Comment'
 *   responses:
 *    201:
 *     description: The comment was successfully created
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
 *    400:
 *     description: Comment creation failed
 * */
router.post("/", Comment.addComment);

/**
 * @swagger
 * /comment:
 *  comment:
 *   summary: Create a new comment
 *   tags: [Comment]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Comment'
 *   responses:
 *    201:
 *     description: The comment was successfully created
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
 *    400:
 *     description: Comment creation failed
 * */
router.get("/", Comment.getCommentsByPost);

/**
 * @swagger
 * /comment/{comment_id}:
 *  get:
 *   summary: Get a comment by ID
 *   tags: [Comment]
 *   parameters:
 *    - in: path
 *      name: comment_id
 *      required: true
 *      description: The ID of the comment
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: The comment is returned
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
 *    404:
 *     description: The comment was not found
 *    400:
 *     description: Failed to get the comment
 * */
router.get("/:comment_id", Comment.getCommentById);



/**
 * @swagger
 * /comment/{comment_id}:
 *  delete:
 *   summary: Delete a comment by ID
 *   tags: [Comment]
 *   parameters:
 *    - in: path
 *      name: comment_id
 *      required: true
 *      description: The ID of the comment
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: The comment is deleted
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
 *    400:
 *     description: Failed to delete the comment
 * */
router.delete("/:comment_id", Comment.deleteComment);

/**
 * @swagger
 * /comment/{comment_id}:
 *  put:
 *   summary: Update a comment by ID
 *   tags: [Comment]
 *   parameters:
 *    - in: path
 *      name: comment_id
 *      required: true
 *      description: The ID of the comment
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: The comment is updated
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
 *    404:
 *     description: The comment was not found
 *    400:
 *     description: Failed to update the comment
 * */
router.put("/:comment_id", Comment.updateComment);

export = router;
