require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@learnit-cluster.hxcdb7p.mongodb.net/`)
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

connectDB();

const app = express();

app.use(express.json());

// app.get('/', (req, res) => res.send('API running...'));
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);

const PORT = 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));