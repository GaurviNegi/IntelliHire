import { useEffect, useState, useContext } from "react";
import axios from "axios";
import MCQPage from "./MCQPage";
import CodingPage from "./CodingPage";
import { TimerContext } from "../context/TimerContext";
import { useNavigate } from "react-router-dom";

const TestScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { timeLeft } = useContext(TimerContext);
  //for mcq
  const [answers, setAnswers] = useState([]);
// ✅ for coding state persistency
const [codingAnswers, setCodingAnswers] = useState([]);

  const [warningCount, setWarningCount] = useState(0);
  const { resetTimer } = useContext(TimerContext);
  const navigate = useNavigate();

  //! HANDLE SUBMIT TEST with TAB VIOLATION **********************************
  const handleSubmitTest = async (violation= false ) => {
    try {
      await axios.post(
        "http://localhost:5000/api/test/submit-test",
        { answers, violation},
        { withCredentials: true }
      );

      alert("🥳 Test submitted successfully! AND You Will Be Logged Out");
      // Clear all localStorage
      localStorage.clear();
      resetTimer(); // Reset timer after test submission
      setTimeout(() => navigate("/"), 500); // navigate to home after submitting the test
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Failed to submit test. Try again.");
    }
  };

  //! use effect for the fetching question
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/questions/")
      .then((res) => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);


//!full screen mode 
  useEffect(() => {
    const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    };
  
    enterFullscreen(); // Enter fullscreen when the page loads
  
    let exitCount = 0;
  
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement) {
        // Ask for confirmation before exiting fullscreen
        const confirmExit = window.confirm(
          "Are you sure you want to exit fullscreen mode?"
        );
  
        if (!confirmExit) {
          enterFullscreen(); // Re-enter fullscreen if user cancels exit
          return;
        }
  
        // If user confirms exit, increment the count
        exitCount += 1;
  
        if (exitCount >= 3) {
          alert("You have exited fullscreen too many times. Submitting the test.");
          handleSubmitTest(true); // Auto-submit test
        }
      }
    };
  
    document.addEventListener("fullscreenchange", handleFullscreenChange);
  
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  
  



  //! Tab Switch Detection( increase warning count if tab switch found )
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((prev) => prev + 1);
        alert(`Warning ${warningCount + 1}: Do not switch tabs!`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [warningCount]);


  //! Auto-submit test if warnings exceed 3
  useEffect(() => {
    if (warningCount >= 100) {
      alert("Multiple instances of suspicious activity have been recorded. You have surpassed the allowed threshold. Your exam session is now terminated due to confirmed malpractice");

      setTimeout(() => {
        handleSubmitTest(true);
      }, 100);
    }
  }, [warningCount]);


  //! Auto-submit if time == 00
  useEffect(() => {
    if (timeLeft === 0) {
      setTimeout(() => {
        handleSubmitTest(true);
      }, 100);
    }
  }, [timeLeft]);


  //! Disable Back and Forward Navigation
  useEffect(() => {
    const preventNavigation = () => {
      window.history.pushState(null, null, window.location.href);
    };

    preventNavigation(); // Push initial state

    window.addEventListener("popstate", preventNavigation);

    return () => {
      window.removeEventListener("popstate", preventNavigation);
    };
  }, []);

  
  //! Formatting Timer
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (loading) return <p>Loading...</p>;
  if (questions.length === 0) return <p>No questions found</p>;

  const question = questions[currentIndex];

  //! HANDLING QUESTION NAVIGATION
  const handleQuestionClick = (index) => {
    setCurrentIndex(index);
  };

  //! HANDLING PREV & NEXT BUTTON
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleOptionSelect = (questionId, selectedOption, isCorrect) => {
    setAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (ans) => ans.questionId === questionId  // Use _id here
      );
  
      if (existingAnswerIndex !== -1) {
        // Update existing answer
        return prevAnswers.map((ans) =>
          ans.questionId === questionId
            ? { questionId, selectedOption, isCorrect }
            : ans
        );
      } else {
        // Add new answer
        return [...prevAnswers, { questionId, selectedOption, isCorrect }];
      }
    });
  };
  

const handleCodeChange = (code, questionId) => {
  setCodingAnswers((prevAnswers) => {
    const updatedAnswers = [...prevAnswers];
    const index = updatedAnswers.findIndex((ans) => ans.questionId === questionId);

    if (index !== -1) {
      updatedAnswers[index].code = code;
    } else {
      updatedAnswers.push({ questionId, code });
    }

    // Update localStorage as well here (optional if you want to)
    localStorage.setItem(`code-${questionId}`, code);

    return updatedAnswers;
  });
};


 

  return (
    <div className="flex">
      {/* ✅ Sidebar for question navigation */}
      <div className="w-1/5 p-4 bg-gray-100 min-h-screen">
        <h2 className="text-lg font-semibold mb-3">Questions</h2>
        <div className="space-y-2">
          {questions.map((q, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(index)}
              className={`w-full py-2 px-3 rounded text-left ${
                index === currentIndex ? "bg-blue-500 text-white" : "bg-white"
              } hover:bg-blue-400 hover:text-white transition`}
            >
              Question {index + 1}
            </button>
          ))}
        </div>
      </div>  

      {/*  Main Content */}
      <div className="w-4/5 p-5">
        {/*  Header Row with Test Title, Timer & Submit Button */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold">Test</h1>
          <div className="text-lg font-semibold bg-gray-100 p-2 rounded">
            ⏳ Time Left: {formatTime(timeLeft)}
          </div>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => handleSubmitTest()}
          >
            Submit Test
          </button>
        </div>

        <div className="w-[100%] p-5 border rounded-lg shadow-lg">
          <p className="text-right text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </p>

          {/* ✅ Show MCQPage for MCQ Questions */}
          {question.type === "MCQ" ? (
            <MCQPage
            question={question}
            handleOptionSelect={handleOptionSelect}
            selectedOption={  // This is where the selectedOption is passed
              answers.find((ans) => ans.questionId === question._id)?.selectedOption || ""
            }
          />
          ) : (
            <CodingPage
    question={question}
    savedCode={
      codingAnswers.find((ans) => ans.questionId === question._id)?.code || ""
    }
    onCodeChange={handleCodeChange}
  />
          )}

          <div className="mt-4 flex justify-between">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={handlePrev} disabled={currentIndex === 0}>
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleNext} disabled={currentIndex === questions.length - 1}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
