import React, { useState, useRef, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"; 


const ProctoredTest = () => {

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const mediaStreamRef = useRef(null);



  //! FOR MEDIA CHECK 
  useEffect(() => {
    // Function to initialize camera and mic
    const initializeMediaDevices = async () => {
      try {
        // Request camera and mic access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        mediaStreamRef.current = stream;

        // Set video feed to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Check for video and mic tracks
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        // Update the state for camera and mic status
        setIsCameraOn(!!videoTrack);
        setIsMicOn(!!audioTrack);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setIsCameraOn(false);
        setIsMicOn(false);
      }
    };

    initializeMediaDevices();

    // Cleanup on unmount (stopping media tracks only when component is unmounted)
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  //!HANDLE THE START TEST BUTTON - ENSURES THAT TEST STATUS IS CHECKED 
const startTest = async () => {
  try {
    // Fetch test attempt status from the backend
    const response = await axios.get("http://localhost:5000/api/test/test-status", {
      withCredentials: true, 
    });

    const data = response.data;

    if (data.testAttempted) {
      alert("❌ You are allowed only one attempt & You have already attempted the test!");
      return ; 
    }

    // Check if camera & mic are enabled
    if (!isCameraOn || !isMicOn) {
      alert("Please enable both your camera and microphone to start the test.");
      return;
    }

    // Navigate to test screen if all conditions are met
    navigate("/test-start");
  } catch (error) {
    console.error("Error checking test status:", error);
    alert("An error occurred. Please try again.");
  }
};

  

  return (
    <div className="flex justify-center items-center p-8 space-x-8 bg-white font-black proctored-test">
      {/* Left Section: Instructions */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4 font-black">Instructions for the Proctored Test</h1>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-black">Test Instructions:</h2>
          <ul className="list-disc pl-8 font-black">
          <li>Ensure your camera and microphone are on, as they will be monitored during the test.</li>
            <li>The test will have a total time of 1 hour.</li>
            <li>You will be given a set of multiple-choice questions and some Coding Questions to solve.</li>
            <li>Make sure your internet connection is stable to avoid disconnection during the test.</li>
            <li>Do not switch tabs or leave the test window; tab switching will automatically disqualify you.</li>
            <li>The test will automatically close when the time runs out, so be aware of the timer.</li>
            <li>If you experience technical difficulties, inform the proctor immediately through the available support options.</li>
          </ul>
        </div>

        <div className="mb-8 font-black">
          <h2 className="text-2xl font-semibold mb-2">Test Information</h2>
          <p><strong>Number of Questions:</strong> 20</p>
          <p><strong>Test Duration:</strong> 1 Hour</p>
          <p><strong>Proctored Test:</strong> Yes</p>
        </div>

        {/* Start Test Button */}
        <div className="mt-8 font-black">
          <button
            onClick={startTest}
            className="bg-blue-500 text-white p-3 rounded "
          >
            Start Test
          </button>
        </div>
      </div>

      {/* Right Section: Camera */}
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover border-4 rounded-lg"
            style={{ border: isCameraOn ? '4px solid green' : '4px solid red' }}
          ></video>
        </div>
        <div className="mt-2 text-center">
          <p className="font-medium font-black">{isCameraOn ? 'Camera: On' : 'Camera: Off'}</p>
          <p className="font-medium font-black">{isMicOn ? 'Mic: On' : 'Mic: Off'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProctoredTest;
