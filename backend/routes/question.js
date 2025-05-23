const express = require('express');
const Question = require('../models/Question');

const router = express.Router();

//! Add a new question (MCQ or Coding)
router.post('/add', async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).json({ message: 'Question added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//! Get all questions
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//! Get a question by ID
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
