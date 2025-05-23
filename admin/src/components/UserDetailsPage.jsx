// src/components/UserDetailsPage.js
import React from "react";
import { useParams } from "react-router-dom";

const UserDetailsPage = () => {
  const { userId } = useParams(); // Get userId from URL

  // Example data for the selected user (replace with actual data based on userId)
  const user = {
    "userId": "67dfe05e470925e76852b298",
    "mcqResult": {
      "totalScore": 0,
      "answers": [
        {
          "question": "What is the worst-case time complexity of the QuickSort Algorithm?",
          "answer": "O(n^2)",
          "correct": true,
        },
        {
          "question": "Which of the following statements about AVL trees is FALSE?",
          "answer": "AVL trees provide faster insertions and deletions compared to Red-Black trees.",
          "correct": false,
        },
      ],
    },
    "codingResult": {
      "totalScore": 0,
      "submissions": [
        {
          "question": "Reverse a String (Python)",
          "language": "Python",
          "testCases": [
            { "input": "'hello'", "expectedOutput": "'olleh'", "actualOutput": "Error", "status": "Wrong Answer", "executionTime": "0.02" },
            { "input": "'world'", "expectedOutput": "'dlrow'", "actualOutput": "Error", "status": "Wrong Answer", "executionTime": "0.015" },
            { "input": "'OpenAI'", "expectedOutput": "'IAnepO'", "actualOutput": "Error", "status": "Wrong Answer", "executionTime": "0.015" },
          ],
        },
      ],
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Results: {userId}</h1>

      {/* MCQ Results Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">MCQ Results</h2>
      <p>Total Score: {user.mcqResult.totalScore}</p>
      <ul>
        {user.mcqResult.answers.map((answer, index) => (
          <li key={index} className="border-b py-2">
            <p><strong>Question:</strong> {answer.question}</p>
            <p><strong>Answer:</strong> {answer.answer}</p>
            <p><strong>Correct:</strong> {answer.correct ? 'Yes' : 'No'}</p>
          </li>
        ))}
      </ul>

      {/* Coding Results Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Coding Results</h2>
      <p>Total Score: {user.codingResult.totalScore}</p>
      {user.codingResult.submissions.map((submission, index) => (
        <div key={index} className="mb-8">
          <h3 className="text-lg font-semibold">{submission.question} ({submission.language})</h3>
          <ul>
            {submission.testCases.map((testCase, testIndex) => (
              <li key={testIndex} className="border-b py-2">
                <p><strong>Input:</strong> {testCase.input}</p>
                <p><strong>Expected Output:</strong> {testCase.expectedOutput}</p>
                <p><strong>Actual Output:</strong> {testCase.actualOutput}</p>
                <p><strong>Status:</strong> {testCase.status}</p>
                <p><strong>Execution Time:</strong> {testCase.executionTime}s</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default UserDetailsPage;
