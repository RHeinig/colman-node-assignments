const Post = require('../models/post');
const { post } = require('../routes');

const addPost = async (req, res, next) => {
    try {
        const post = await Post.create(req.body);
        post.save();
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllPosts = async (req, res, next) => {
    try {
        if (req.query.sender) {
            return next('route');
        }

        posts = await Post.find();
        res.status(200).send(posts);
    } catch (error) {
        res.status(400).send({
            'Status': 'Error',
            'Message': error.message
        })
    }
}

const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.post_id);
        res.status(200).send(post);
    } catch (error) {
        res.status(400).send({
            'Status': 'Error',
            'Message': error.message
        })
    }
}

const getPostsBySender = async (req, res, next) => {
    const senderId = req.query.sender;
    console.log(senderId);
    
    try {
        const posts = await Post.find({ 'sender': senderId });
        res.status(200).send(posts);
    } catch (error) {
        res.status(400).send({
            'Status': 'Error',
            'Message': error.message
        })
    }
}

const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.post_id, req.body,
            { new: true });
        res.status(200).send(post);
    } catch (error) {
        res.status(400).send({
            'Status': 'Error',
            'Message': error.message
        })
    }
}

module.exports = { getAllPosts, getPostById, getPostsBySender, addPost, updatePost };   