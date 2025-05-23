import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Homepage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [error, setError] = useState("");

  // Check login status on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("useremail");

    if (storedUsername && storedEmail) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  //! HANDLE LOGIN FUNCTION 
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/login",
        { email: loginEmail, password: loginPassword },
        { withCredentials: true }
      );

      const data = response.data;

      // Store name and email in localStorage
      localStorage.setItem("username", data.name);
      localStorage.setItem("useremail", data.email);

      // Update state
      setUsername(data.name);
      setIsLoggedIn(true);
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  //! HANDLE REGISTER FUNCTION 
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:5000/api/user/register", {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      alert("🥳 Registration successful! Please log in.");
      
      // Clear input fields
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  //! HANDLE LOGOUT FUNCTION 
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/user/logout", {}, { withCredentials: true });

      // Clear user details from localStorage
      localStorage.removeItem("username");
      localStorage.removeItem("useremail");

      // Update UI state
      setIsLoggedIn(false);
      setUsername("");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-8 bg-black/70 bg-cover bg-center"
      style={{ backgroundImage: `url('/gg.avif')` }}
    >
      <div className="flex flex-col items-center justify-center w-3/4 md:w-2/3 bg-gray-700/50 text-white p-8 rounded-lg shadow-lg">
      <h1 className="text-4xl md:text-5xl font-bold text-neonBlue tracking-wide uppercase">
  Intellihire AI-Driven Interview Platform
</h1>

      
  
        <div className="bg-gray-400/30 text-green-300 font-mono p-4 rounded-lg shadow-lg mb-6 ">
          <pre className="flex justify-center">
            {`// AI-driven interview intelligence
  const Intellihire = () => {
    return "Automate hiring, assess skills, and fair online tech tests.";
  };
  
  console.log(Intellihire());`}
          </pre>
        </div>
  
        {error && <p className="text-red-500 font-semibold">{error}</p>}
  
        {isLoggedIn ? (
          <div className="flex flex-col items-center">
            <p className="text-lg text-yellow-200 font-semibold mb-4 tracking-wide uppercase">Namaste, {username}!</p>
            <img className="mb-4" src="/namaste.png" alt="Namaste" />
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md tracking-wide uppercase"
            >
              Logout
            </button>
            <div className="flex justify-start items-center space-x-6 text-lg mt-4">
              <Link to="/proctored-test" className="text-yellow-200 hover:underline tracking-wide uppercase">
                Attempt Test
              </Link>
              <span>|</span>
              <Link to="/round2 " className="text-yellow-200 hover:underline tracking-wide uppercase">
                Go for Interview
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
            {/* Login Form */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg w-full md:w-1/2">
              <h2 className="text-xl font-bold mb-4 text-left">Login</h2>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="p-2 bg-gray-800 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="p-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                >
                  Login
                </button>
              </form>
            </div>
  
            {/* Register Form */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg w-full md:w-1/2">
              <h2 className="text-xl font-bold mb-4 text-left">Register</h2>
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  className="p-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="p-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="p-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
                >
                  Register
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  
};

export default Homepage;
