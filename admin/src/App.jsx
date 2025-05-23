import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import ResultsPage from './components/ResultsPage';
import LoginPage from './components/LoginPage';
import CreateAdmin from './components/CreateAdmin';
import ManageUsers from './components/ManageUsers';
import ManageQuestions from './components/ManageQuestions';
import SeeResults from './components/SeeResults';
import ProtectedRoute from './components/ProtectedRoute'; 
import AppRoutes from "./round2-call/AppRoutes"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/manage-questions" element={<ManageQuestions />} />
            <Route path="/see-results" element={<SeeResults />} /> 
          </Route>
          <Route path="/round2/*" element={<AppRoutes/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
