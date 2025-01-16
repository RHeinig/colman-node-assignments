import express from "express";
const router = express.Router();

import Comment from "../controllers/comment";
import { authorize } from "../middlewares/authorization";

/**
 * @swagger
 * components:
 *  schemas:
 *   Comment:
 *    type: object
 *    required:
 *     - postId
 *     - content
 *    properties:
 *     postId:
 *      type: string
 *      description: The post ID the comment belongs to
 *     content:
 *      type: string
 *      description: The content of the comment
 *    example:
 *     postId: '60f7b3b4b6f1f3f8b4f3b1b1'
 *     content: 'This is a comment'
 *  responses:
 *   CommentResponse:
 *    type: object
 *    properties:
 *     postId:
 *      type: string
 *     content:
 *      type: string
 *     userId:
 *      type: string
 *     createdAt:
 *      type: string
 *      format: date-time
 *     updatedAt:
 *      type: string
 *      format: date-time
 *    example:
 *     postId: '60f7b3b4b6f1f3f8b4f3b1b1'
 *     content: 'This is a comment'
 *     userId: '60f7b3b4b6f1f3f8b4f3b1b2'
 */

/**
 * @swagger
 * /comment:
 *  post:
 *   summary: Create a new comment
 *   tags: [Comment]
 *   security:
 *      - Authorization: []
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
 *        $ref: '#/components/responses/CommentResponse'
 *    400:
 *     description: Comment creation failed
 * */
router.post("/", authorize, Comment.addComment);

/**
 * @swagger
 * /comment:
 *  get:
 *   summary: Get comments by post ID
 *   tags: [Comment]
 *   parameters:
 *    - in: query
 *      name: postId
 *      required: true
 *      description: The ID of the post to get comments for
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: The comments are returned
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/responses/CommentResponse'
 *    400:
 *     description: Failed to get comments
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
 *        $ref: '#/components/responses/CommentResponse'
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
 *   security:
 *      - Authorization: []
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
 *        $ref: '#/components/responses/CommentResponse'
 *    400:
 *     description: Failed to delete the comment
 * */
router.delete("/:comment_id", authorize, Comment.deleteComment);
/**
 * @swagger
 * /comment/{comment_id}:
 *  put:
 *   summary: Update a comment by ID
 *   tags: [Comment]
 *   security:
 *      - Authorization: []
 *   parameters:
 *    - in: path
 *      name: comment_id
 *      required: true
 *      description: The ID of the comment
 *      schema:
 *       type: string
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - content
 *       properties:
 *        content:
 *         type: string
 *         description: The content of the comment
 *       example:
 *        content: 'This is an updated comment'
 *   responses:
 *    200:
 *     description: The comment is updated
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/responses/CommentResponse'
 *    404:
 *     description: The comment was not found
 *    400:
 *     description: Failed to update the comment
 * */
router.put("/:comment_id", authorize, Comment.updateComment);

export = router;
