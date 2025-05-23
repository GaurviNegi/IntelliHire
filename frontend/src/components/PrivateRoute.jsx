import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element}) => {
  const useremail = localStorage.getItem("useremail"); // Check if user email exists
  const username = localStorage.getItem("username"); // Get username if needed

  if ( !(username && useremail)) {
    alert("Please log in to start the test!"); // Show alert before redirecting
    return <Navigate to="/" replace />;
  }

  return element;
};

export default PrivateRoute;



