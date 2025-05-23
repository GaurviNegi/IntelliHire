// src/components/ResultsPage.js
import React from 'react';
const ResultsPage = () => {
    const results = [
      { name: 'gn', email: 'gaurvinegi333@gmail.com', mcqScore: 0, codingScore: 0, totalScore: 0 },
      { name: 'preeti', email: 'preeti@gmail.com', mcqScore: 0, codingScore: 0, totalScore: 0 },
      { name: 'wookie', email: 'wookie@gmail.com', mcqScore: 0, codingScore: 0, totalScore: 0 },
      { name: '1', email: '1@gmail.com', mcqScore: 0, codingScore: 0, totalScore: 0 },
      { name: 'dev', email: 'dev@gmail.com', mcqScore: 0, codingScore: 0, totalScore: 0 },
      { name: 'xx', email: 'x@gmail.com', mcqScore: 0, codingScore: 0, totalScore: 0 },
      { name: '5', email: '5@gmail.com', mcqScore: 0, codingScore: 0, totalScore: 0 },
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Results</h1>
        <ul>
          {results.map((result, index) => (
            <li key={index} className="border-b py-2">
              <p>Name: {result.name}</p>
              <p>Email: {result.email}</p>
              <p>MCQ Score: {result.mcqScore}</p>
              <p>Coding Score: {result.codingScore}</p>
              <p>Total Score: {result.totalScore}</p>
              <Link to={`/user-details/${user.userId}`} className="text-blue-500">View Details</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default ResultsPage;
  