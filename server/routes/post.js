const express = require('express');
const router = express.Router();
const verifyToken = require('../middleWare/auth');

const Post = require('../models/Post');

// @route POST api/posts/v1/create
// @decs Create post
// @access Private
router.post('/v1/create', verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body;

    if (!title) {
        return res
        .status(400)
        .json({ success: false, message: 'Title is required' });
    }
    try {
        const newPost = new Post({
            title,
            description,
            url: (url.startsWith('https://')) ? url : `https://${url}`,
            status: status || 'TO LEARN',
            user: req.userId
        });

        await newPost.save();
        res.json({ success: true, message: 'Good luck on your journey', post: newPost });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

// @route GET api/posts/v1/getAllPosts
// @decs Get post
// @access Private
router.get('/v1/getAllPosts', verifyToken, async (req, res) => {
    try {
        const posts = await Post
        .find({ user: req.userId })
        /// populate user details including username
        .populate('user', ['username'])
        res.json({ success: true, posts})
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

// @route PUT api/posts/v1/update/:id
// @decs Update post
// @access Private
router.put('/v1/update/:id', verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body;

    if (!title) {
        return res.status(400).json({
            successe: false,
            message: 'Title is required'
        });
    }
    try {
        let updatedPost = {
            title,
            description: description || '',
            url: (url.startsWith('https://')) ? url : `https://${url}`,
            status: status || 'TO LEARN'
        }

        const postUpdateContdition = { _id: req.params.id, user: req.userId };
        updatedPost = await Post.findOneAndUpdate(postUpdateContdition, updatedPost, { new: true });

        if (!updatedPost) {
            return res.status(401).json({
                success: false,
                message: 'Post not found or user not authorized'
            })
        }
        res.json({ success: true, message: 'Excellent progress', post: updatedPost });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

// @route DELETE api/posts/v1/delete/:id
// @decs Delete post
// @access Private
router.delete('/v1/delete/:id', verifyToken, async (req, res) => {
    try {
        const postDeleteCondition = { _id: req.params.id, user: req.userId };
        const deletedPost = await Post.findOneAndDelete(postDeleteCondition);

        if (!deletedPost) {
            return res.status(401).json({
                success: false,
                message: 'Post not found or user not authorized'
            })
        }
        res.json({ success: true, message: 'Post deleted', post: deletedPost });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

module.exports = router;