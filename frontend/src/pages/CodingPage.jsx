
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const CodingPage = ({ question, savedCode, onCodeChange }) => {
  const storageKey = `code-${question?._id || "default"}`;
  const languageKey = `language-${question?._id || "default"}`;

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load stored code and language on question change
  useEffect(() => {
    if (question?._id) {
      const storedCode = localStorage.getItem(storageKey);
      const storedLanguage = localStorage.getItem(languageKey);
      const lang = storedLanguage || "javascript";

      setLanguage(lang);
      if (storedCode !== null) {
        setCode(storedCode);
      } else {
        setCode(savedCode || "");  // Removed defaultComments fallback
      }
    }
  }, [question?._id]);

  // Reset test results on question change
  useEffect(() => {
    setTestResults([]);
  }, [question?._id]);

  // Save code to localStorage and notify parent
  useEffect(() => {
    if (question?._id) {
      localStorage.setItem(storageKey, code);
      onCodeChange?.(code); // Notify parent component
    }
  }, [code, question?._id]);

  // Save selected language
  useEffect(() => {
    if (question?._id) {
      localStorage.setItem(languageKey, language);
    }
  }, [language, question?._id]);

  


  const languageMap = {
    javascript: 63,
    python: 71,
    java: 62,
    c: 50,
    cpp: 54,
  };

  const handleRun = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/code/run",
        {
          language_id: languageMap[language],
          source_code: code,
          testCases: question.testCases,
        },
        { withCredentials: true }
      );

      setTestResults(
        response.data.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: tc.actualOutput,
          status: tc.status,
          executionTime: tc.executionTime,
        }))
      );
    } catch (error) {
      console.error("Error executing code:", error);
      setTestResults([
        {
          input: "Error",
          expected_output: "Error",
          actual_output: "Failed to execute code",
        },
      ]);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (testResults.length === 0) {
      alert("Please run the code before submitting.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/code/submit-code",
        {
          questionId: question._id,
          code,
          language,
          testCases: testResults,
        },
        { withCredentials: true }
      );

      alert("🥳 Code submitted successfully!");
    } catch (error) {
      console.error("Error submitting code:", error);
      alert("Submission failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto mt-10 p-5 border rounded-lg shadow-lg">
      <div>
        <h2 className="text-xl font-bold">{question.title}</h2>
        <p className="mt-2">{question.description}</p>

        {question.testCases && question.testCases.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Test Cases:</h3>
            <ul className="mt-2 space-y-2">
              {question.testCases.map((tc, index) => (
                <li key={index} className="p-2 border rounded bg-gray-100">
                  <p>
                    <strong>Input:</strong> {tc.input}
                  </p>
                  <p>
                    <strong>Expected Output:</strong> {tc.output}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <div className="mb-2">
          <label className="font-semibold mr-2">Select Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <Editor
          height="300px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
        />

        <div className="mt-4 flex justify-between">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleRun}
            disabled={loading}
          >
            {loading ? "Running..." : "Run"}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold">Test Case Results</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-2 mt-2 border ${
                result.status === "Accepted" ? "bg-green-200" : "bg-red-200"
              }`}
            >
              <p>
                <strong>Input:</strong> {result.input}
              </p>
              <p>
                <strong>Expected:</strong> {result.expectedOutput}
              </p>
              <p>
                <strong>Actual:</strong> {result.actualOutput}
              </p>
              <p>
                <strong>Status:</strong> {result.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodingPage;

