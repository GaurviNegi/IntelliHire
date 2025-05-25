import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import MCQPage from "./MCQPage";
import CodingPage from "./CodingPage";
import { TimerContext } from "../context/TimerContext";
import { useNavigate } from "react-router-dom";
import * as faceapi from 'face-api.js';

const TestScreen = () => {
  // Existing states
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { timeLeft, resetTimer } = useContext(TimerContext);
  const [answers, setAnswers] = useState([]);
  const [codingAnswers, setCodingAnswers] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const navigate = useNavigate();

  // Face detection states with draggable functionality
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [proctoringStatus, setProctoringStatus] = useState({
    status: 'initializing',
    message: 'Initializing proctoring...'
  });
  const [violations, setViolations] = useState({
    face: 0,
    tab: 0,
    fullscreen: 0
  });
  const detectionTimeout = useRef(null);
  const noFaceTime = useRef(0);
  const [lastWarning, setLastWarning] = useState(null);

  //! ======================== DRAGGABLE VIDEO FUNCTIONS ========================

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left mouse button
    
    const rect = videoContainerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  //! ======================== CORE FUNCTIONS ========================

  const handleSubmitTest = async (violationData = {}) => {
    try {
      stopProctoring();
      
      await axios.post(
        "http://localhost:5000/api/test/submit-test",
        { 
          answers, 
          codingAnswers,
          violations,
          ...violationData
        },
        { withCredentials: true }
      );

      alert("Test submitted successfully!");
      resetTimer();
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Failed to submit test. Try again.");
    }
  };

  //! ======================== PROCTORING FUNCTIONS ========================

  const initializeProctoring = async () => {
    try {
      updateProctoringStatus('initializing', 'Loading face detection models...');
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      
      updateProctoringStatus('initializing', 'Requesting camera access...');
      await startVideoStream();
      
    } catch (error) {
      console.error("Proctoring initialization error:", error);
      updateProctoringStatus('error', 
        error.message.includes('camera') ? 
        'Camera access denied. Test will continue with limited proctoring.' :
        'Face detection unavailable. Test will continue with limited monitoring.'
      );
    }
  };

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 320, 
          height: 240,
          facingMode: "user" 
        } 
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        setupFaceDetection();
        updateProctoringStatus('active', 'Proctoring active');
      };
      
    } catch (error) {
      throw new Error('Camera access error: ' + error.message);
    }
  };

  const setupFaceDetection = () => {
    stopFaceDetection();
    
    const canvas = canvasRef.current;
    const displaySize = { 
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight 
    };
    faceapi.matchDimensions(canvas, displaySize);

    let detectionDelay = 2000;
    const maxDetectionDelay = 10000;
    
    const detect = async () => {
      try {
        const startTime = Date.now();
        
        const detections = await faceapi.detectAllFaces(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();

        const processingTime = Date.now() - startTime;
        detectionDelay = Math.min(
          Math.max(2000, processingTime * 2),
          maxDetectionDelay
        );

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }

        evaluateDetectionResults(detections.length);
        
      } catch (error) {
        console.error("Detection error:", error);
        detectionDelay = Math.min(detectionDelay * 2, maxDetectionDelay);
      } finally {
        detectionTimeout.current = setTimeout(detect, detectionDelay);
      }
    };

    detectionTimeout.current = setTimeout(detect, detectionDelay);
  };

  const evaluateDetectionResults = (faceCount) => {
    const now = Date.now();
    
    if (faceCount === 0) {
      if (noFaceTime.current === 0) {
        noFaceTime.current = now;
      }
      
      const elapsed = (now - noFaceTime.current) / 1000;
      
      if (elapsed >= 10) {
        recordViolation('face', 'No face detected for 10 seconds');
      } else if (elapsed >= 5) {
        showWarning('Please position your face in the camera');
      }
    } 
    else if (faceCount > 1) {
      recordViolation('face', 'Multiple faces detected');
    } 
    else {
      noFaceTime.current = 0;
    }
  };

  const recordViolation = (type, message) => {
    setViolations(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    
    showWarning(message, true);
    
    const totalViolations = Object.values(violations).reduce((a, b) => a + b, 0);
    if (totalViolations >= 3) {
      handleSubmitTest({ violation: true, violationType: 'exceeded_threshold' });
    }
  };

  const showWarning = (message, isViolation = false) => {
    setLastWarning({ message, timestamp: Date.now(), isViolation });
    setTimeout(() => setLastWarning(null), 5000);
    
    if (isViolation) {
      updateProctoringStatus('warning', message);
    }
  };

  const updateProctoringStatus = (status, message) => {
    setProctoringStatus({ status, message });
  };

  const stopProctoring = () => {
    stopFaceDetection();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const stopFaceDetection = () => {
    if (detectionTimeout.current) {
      clearTimeout(detectionTimeout.current);
    }
  };

  //! ======================== TEST FUNCTIONS ========================

  const handleQuestionClick = (index) => {
    setCurrentIndex(index);
  };

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
        (ans) => ans.questionId === questionId
      );
      const updatedAnswers = [...prevAnswers];

      if (existingAnswerIndex !== -1) {
        updatedAnswers[existingAnswerIndex] = {
          questionId,
          selectedOption,
          isCorrect,
        };
      } else {
        updatedAnswers.push({ questionId, selectedOption, isCorrect });
      }

      return updatedAnswers;
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

      localStorage.setItem(`code-${questionId}`, code);
      return updatedAnswers;
    });
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  //! ======================== EFFECT HOOKS ========================

  useEffect(() => {
    const loadData = async () => {
      try {
        const questionsResponse = await axios.get("http://localhost:5000/api/questions/");
        setQuestions(questionsResponse.data);
        await initializeProctoring();
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      stopProctoring();
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('fullscreen', 'Fullscreen exited');
        const elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      }
    };

    const enterFullscreen = () => {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
          console.error("Fullscreen error:", err);
        });
      }
    };

    enterFullscreen();
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('tab', 'Tab switched or minimized');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitTest({ timeExpired: true });
    }
  }, [timeLeft]);

  //! ======================== RENDER ========================

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (questions.length === 0) return <div className="flex justify-center items-center h-screen">No questions found</div>;

  const question = questions[currentIndex];

  return (
    <div className="flex relative">
      {/* Movable Proctoring Panel */}
      <div
        ref={videoContainerRef}
        className={`fixed z-50 bg-white p-2 rounded-lg shadow-lg border-2 ${
          proctoringStatus.status === 'active' ? 'border-green-500' :
          proctoringStatus.status === 'warning' ? 'border-yellow-500' :
          'border-red-500'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "340px"
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">
            {proctoringStatus.status === 'active' ? '✅ Proctoring Active' :
             proctoringStatus.status === 'warning' ? '⚠️ Proctoring Warning' :
             '❌ Proctoring Issue'}
          </span>
          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
            Violations: {violations.face + violations.tab + violations.fullscreen}
          </span>
        </div>
        
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width="320"
            height="240"
            className="rounded"
          />
          <canvas
            ref={canvasRef}
            width="320"
            height="240"
            className="absolute top-0 left-0 pointer-events-none"
          />
        </div>
        <div className="text-xs mt-1 text-gray-600">
          {proctoringStatus.message}
        </div>
      </div>

      {/* Warning notification */}
      {lastWarning && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg ${
          lastWarning.isViolation ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
        }`}>
          {lastWarning.message}
        </div>
      )}

      {/* Sidebar for question navigation */}
      <div className="w-1/5 p-4 bg-gray-100 min-h-screen sticky top-0">
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
        
        <div className="mt-6 p-3 bg-white rounded-lg shadow">
          <h3 className="font-medium mb-2">Proctoring Summary</h3>
          <div className="space-y-1 text-sm">
            <div>Tab Changes: {violations.tab}</div>
            <div>Face Violations: {violations.face}</div>
            <div>Fullscreen Exits: {violations.fullscreen}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-5">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold">Online Proctored Test</h1>
          
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold bg-gray-100 p-2 rounded">
              ⏳ Time Left: {formatTime(timeLeft)}
            </div>
            
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={() => handleSubmitTest()}
            >
              Submit Test
            </button>
          </div>
        </div>

        <div className="w-[100%] p-5 border rounded-lg shadow-lg bg-white">
          <p className="text-right text-sm text-gray-500 mb-4">
            Question {currentIndex + 1} of {questions.length}
          </p>

          {question.type === "MCQ" ? (
            <MCQPage 
              question={question} 
              handleOptionSelect={handleOptionSelect} 
              selectedOption={
                answers.find(ans => ans.questionId === question._id)?.selectedOption
              }
            />
          ) : (
            <CodingPage 
              question={question}
              savedCode={
                codingAnswers.find(ans => ans.questionId === question._id)?.code || ""
              }
              onCodeChange={handleCodeChange}
            />
          )}

          <div className="mt-6 flex justify-between">
            <button 
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition disabled:opacity-50"
              onClick={handlePrev} 
              disabled={currentIndex === 0}
            >
              Previous
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
              onClick={handleNext} 
              disabled={currentIndex === questions.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
