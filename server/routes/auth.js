require('dotenv').config();
const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

router.get('/v1/user', (req, res) => res.send('User route'));

// @route POST api/auth/register
// @decs Register user
// @access Public
router.post('/v1/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
        .status(400)
        .json({ success: false, message: 'Missing username and/or password'})
    }

    try {
        const user = await User.findOne({ username });
        if (user) {
            return res
            .status(400)
            .json({ success: false, message: 'Username already taken' });
        }
        const hashedPassword = await argon2.hash(password);
        const newUser = new User({ 
            username,
            password: hashedPassword
        });
        await newUser.save();

        // Return access token
        const accessToken = jwt.sign(
            {userId: newUser._id}, 
            process.env.SECRET_KEY
        );
        res.json({ success: true, message: 'User created successfully', accessToken })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success:false, message: 'Internal server error' });
    }
})

// @route POST api/auth/login
// @decs User Login
// @access Public
router.post('/v1/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
        .status(400)
        .json({ success: false, message: 'Missing username and/or password' });
    }
    try {
        // check for existing user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Incorrect username or password' });
        }

        // username found
        const passwordValid = await argon2.verify(user.password, password);
        if (!passwordValid) {
            return res.status(400).json({ sucess: false, message: 'Incorrect username or password' });
        } else {
            // all good
            const accessToken = jwt.sign(
                { userId: user._id },
                process.env.SECRET_KEY
            );
            res.json({ success: true, message: 'User logged in successfully', accessToken });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Internal server errror' });
    }
});

module.exports = router;