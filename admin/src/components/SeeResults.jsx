import React, { useState, useEffect } from "react";
import axios from "axios";

const SeeResults = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/results", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
        console.log(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleViewDetails = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/results/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserDetails(res.data);
      setSelectedUser(userId);
    } catch (error) {
      console.error("Error fetching detailed results:", error);
    }
  };

  const handleToggleDetails = (userId) => {
    if (selectedUser === userId) {
      setSelectedUser(null);
      setUserDetails(null);
    } else {
      handleViewDetails(userId);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">See Results</h1>

      <div className="space-y-6">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.userId} className="border p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{user.name}</h3>
                  <p className="text-gray-600">Email: {user.email}</p>
                  <div className="flex gap-4 text-sm mt-2">
                    <p className="text-gray-700">
                      Total Score:{" "}
                      <span className="font-semibold">{user.totalScore}</span>
                    </p>
                    <p className="text-gray-700">
                      MCQ:{" "}
                      <span className="font-semibold">
                        {user.totalMcqScore}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Coding:{" "}
                      <span className="font-semibold">
                        {user.totalCodingScore}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleDetails(user.userId)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {selectedUser === user.userId
                    ? "Hide Details"
                    : "View Details"}
                </button>
              </div>

              {/* Show details immediately below the user */}
              {userDetails && selectedUser === user.userId && (
                <div className="mt-6 bg-gray-100 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4 text-center">
                    Detailed Results
                  </h2>

                  {/* MCQ Section */}
                  {userDetails.mcqResult && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">
                        MCQ Results
                      </h3>
                      <ul className="space-y-4">
                        {userDetails.mcqResult.answers.map((answer, index) => (
                          <li
                            key={index}
                            className="p-4 bg-white rounded shadow-sm border border-gray-200"
                          >
                            {/* Title */}
                            <h3 className="font-semibold text-lg mb-1">
                              {answer.questionId.title}
                            </h3>

                            {/* Options */}
                            <div className="text-sm text-gray-700 mb-2">
                              {answer.questionId.options.map((option, idx) => (
                                <p key={idx}>
                                  {String.fromCharCode(65 + idx)}. {option}
                                </p>
                              ))}
                            </div>

                            {/* Selected & Correct Answer */}
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-600">
                                Selected:{" "}
                                <span className="font-medium">
                                  {answer.selectedOption}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Correct:{" "}
                                <span className="font-medium">
                                  {answer.questionId.correctAnswer}
                                </span>
                              </p>
                              <div
                                className={`font-semibold ${
                                  answer.isCorrect
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {answer.isCorrect ? "Correct" : "Incorrect"}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Coding Section */}
                  {userDetails.codingResult && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Coding Results
                      </h3>
                      {userDetails.codingResult.submissions.map(
                        (submission, index) => (
                          <div
                            key={index}
                            className="mb-6 bg-white p-4 rounded shadow-sm"
                          >
                            {/* Title and Description */}
                            <h4 className="text-lg font-semibold mb-1">
                              {submission.questionId.title}
                            </h4>
                            <p className="mb-2 text-gray-700">
                              {submission.questionId.description}
                            </p>

                            {/* Submitted Code */}
                            <h6 className="font-bold mb-1">Submitted Code:</h6>
                            <pre className="bg-gray-100 p-3 rounded overflow-x-auto mb-3 text-sm">
                              {submission.code}
                            </pre>

                            {/* Language */}
                            <p className="text-sm text-gray-500 mb-2">
                              Language: {submission.language}
                            </p>

                            {/* Test Cases */}
                            <h6 className="font-bold mb-2">Test Cases:</h6>
                            <ul className="space-y-2">
                              {submission.testCases.map((testCase, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between items-start"
                                >
                                  <div>
                                    <p className="text-sm">
                                      <span className="font-semibold">
                                        Input:
                                      </span>{" "}
                                      {testCase.input}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-semibold">
                                        Expected:
                                      </span>{" "}
                                      {testCase.expectedOutput}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">
                                      <span className="font-semibold">
                                        Output:
                                      </span>{" "}
                                      {testCase.actualOutput}
                                    </p>
                                    <p
                                      className={`text-sm font-semibold ${
                                        testCase.status === "Accepted"
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {testCase.status}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Time: {testCase.executionTime}ms
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>

                            <p className="text-green-500 text-sm font-semibold">
                              coding score : {submission.codingScore}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default SeeResults;
