import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageQuestions = () => {
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const [newQuestion, setNewQuestion] = useState({
    type: "MCQ",
    title: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    description: "",
    testCases: [{ input: "", output: "" }, { input: "", output: "" }, { input: "", output: "" }]
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateId, setUpdateId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/questions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mcqs = res.data.filter(q => q.type === "MCQ");
      const codings = res.data.filter(q => q.type === "Coding");
      setMcqQuestions(mcqs);
      setCodingQuestions(codings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewQuestion({
      type: "MCQ",
      title: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      description: "",
      testCases: [{ input: "", output: "" }, { input: "", output: "" }, { input: "", output: "" }]
    });
    setIsUpdating(false);
    setUpdateId(null);
  };

  const handleAddQuestion = async () => {
    try {
      let payload = {};
      if (newQuestion.type === "MCQ") {
        payload = {
          type: "MCQ",
          title: newQuestion.title,
          options: newQuestion.options,
          correctAnswer: newQuestion.correctAnswer
        };
      } else {
        payload = {
          type: "Coding",
          title: newQuestion.title,
          description: newQuestion.description,
          testCases: newQuestion.testCases
        };
      }
      await axios.post("http://localhost:5000/api/admin/questions", payload);
      alert("Question Added!");
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateQuestion = async () => {
    try {
      let payload = {};
      if (newQuestion.type === "MCQ") {
        payload = {
          type: "MCQ",
          title: newQuestion.title,
          options: newQuestion.options,
          correctAnswer: newQuestion.correctAnswer
        };
      } else {
        payload = {
          type: "Coding",
          title: newQuestion.title,
          description: newQuestion.description,
          testCases: newQuestion.testCases
        };
      }
      await axios.put(`http://localhost:5000/api/admin/questions/${updateId}`, payload);
      alert("Question Updated!");
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await axios.delete(`http://localhost:5000/api/admin/questions/${id}`);
      fetchQuestions();
    }
  };

  const handleEdit = (question) => {
    setNewQuestion({
      type: question.type,
      title: question.title,
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer || "",
      description: question.description || "",
      testCases: question.testCases?.length > 0 ? question.testCases : [{ input: "", output: "" }, { input: "", output: "" }, { input: "", output: "" }]
    });
    setIsUpdating(true);
    setUpdateId(question._id);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Questions</h1>

      {/* Add or Update Question */}
      <div className="border p-6 rounded-lg mb-10 bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">{isUpdating ? "Update Question" : "Add New Question"}</h2>

        {/* Type Selector */}
        <select
          value={newQuestion.type}
          onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
          className="border rounded p-2 mb-4"
        >
          <option value="MCQ">MCQ</option>
          <option value="Coding">Coding</option>
        </select>

        {/* Common Fields */}
        <input
          type="text"
          placeholder="Question Title"
          value={newQuestion.title}
          onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
          className="border p-2 rounded w-full mb-4"
        />

        {/* MCQ Fields */}
        {newQuestion.type === "MCQ" && (
          <>
            {newQuestion.options.map((opt, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${index + 1}`}
                value={opt}
                onChange={(e) => {
                  const updatedOptions = [...newQuestion.options];
                  updatedOptions[index] = e.target.value;
                  setNewQuestion({ ...newQuestion, options: updatedOptions });
                }}
                className="border p-2 rounded w-full mb-2"
              />
            ))}
            <input
              type="text"
              placeholder="Correct Answer"
              value={newQuestion.correctAnswer}
              onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
              className="border p-2 rounded w-full mb-4"
            />
          </>
        )}

        {/* Coding Fields */}
        {newQuestion.type === "Coding" && (
          <>
            <textarea
              placeholder="Description"
              value={newQuestion.description}
              onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
              className="border p-2 rounded w-full mb-4"
            />
            {newQuestion.testCases.map((testCase, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Input"
                  value={testCase.input}
                  onChange={(e) => {
                    const updatedTestCases = [...newQuestion.testCases];
                    updatedTestCases[index].input = e.target.value;
                    setNewQuestion({ ...newQuestion, testCases: updatedTestCases });
                  }}
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Output"
                  value={testCase.output}
                  onChange={(e) => {
                    const updatedTestCases = [...newQuestion.testCases];
                    updatedTestCases[index].output = e.target.value;
                    setNewQuestion({ ...newQuestion, testCases: updatedTestCases });
                  }}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
          </>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          {!isUpdating ? (
            <button
              onClick={handleAddQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Question
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdateQuestion}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Update
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* List MCQ Questions */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">MCQ Questions</h2>
        {mcqQuestions.length > 0 ? (
          mcqQuestions.map(q => (
            <div key={q._id} className="border p-4 rounded mb-3">
              <h3 className="font-bold mb-2">{q.title}</h3>
              {q.options.map((opt, index) => (
                <div key={index} className="text-sm">Option {index + 1}: {opt}</div>
              ))}
              <p className="text-green-600 mt-2 text-sm">Correct Answer: {q.correctAnswer}</p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleEdit(q)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No MCQ Questions found.</p>
        )}
      </div>

      {/* List Coding Questions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Coding Questions</h2>
        {codingQuestions.length > 0 ? (
          codingQuestions.map(q => (
            <div key={q._id} className="border p-4 rounded mb-3">
              <h3 className="font-bold mb-2">{q.title}</h3>
              <p className="mb-2">{q.description}</p>
              {q.testCases?.map((tc, index) => (
                <div key={index} className="text-sm">
                  <span className="font-semibold">Input:</span> {tc.input} <br />
                  <span className="font-semibold">Output:</span> {tc.output}
                </div>
              ))}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleEdit(q)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No Coding Questions found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageQuestions;

