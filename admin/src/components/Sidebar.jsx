// src/components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Redirect to login
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 ">
      <div className="text-2xl font-bold text-center mb-8">
        <h2>Actions</h2>
      </div>
      <ul className="space-y-4">
        {/* Home Action */}
        <li>
          <Link to="/" className="hover:text-green-400">
            Home
          </Link>
        </li>

        {/* View Results Action */}
        <li>
          <Link to="/create-admin" className="hover:text-green-400">
            Create Admin
          </Link>
        </li>

        {/* MCQ Test Action */}
        <li>
          <Link to="/manage-users" className="hover:text-green-400">
            Manage Users
          </Link>
        </li>

        {/* Coding Test Action */}
        <li>
          <Link to="/manage-questions" className="hover:text-green-400">
            Manage Questions
          </Link>
        </li>

        {/* Coding Test Action */}
        <li>
          <Link to="/see-results" className="hover:text-green-400">
            See Results
          </Link>
        </li>

        {/* Login Action */}
        <li>
          <Link to="/login" className="hover:text-green-400">
            Login
          </Link>
        </li>

        {/*conduct interview  */}
        <li>
          <Link
            to="/round2"
            className="px-4 py-2 bg-yellow-500 text-white rounded  hover:bg-yellow-600 transition"
          >
            Conduct Interview
          </Link>
        </li>

        {/* Logout */}
        <li>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </li>


       
      </ul>
    </div>
  );
};

export default Sidebar;
