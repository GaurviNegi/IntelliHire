const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['MCQ', 'Coding'] },
    title: { type: String, required: true },
    description: { type: String }, // For coding questions
    options: { type: [String] },   // For MCQs
    correctAnswer: { type: String }, // For MCQs
    testCases: { type: [{ input: String, output: String }] }, // For coding questions
});

module.exports = mongoose.model('Question', questionSchema);
