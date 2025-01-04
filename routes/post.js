const express = require('express');
const router = express.Router();

const Post = require('../controllers/post');

router.post('/', Post.addPost)

router.get('/', Post.getAllPosts)

router.get('/:post_id', Post.getPostById)

router.get('/', Post.getPostsBySender)

router.put('/:post_id', Post.updatePost)

module.exports = router;
