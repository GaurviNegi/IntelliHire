// src/pages/CreateAdmin.jsx
import React, { useState } from 'react';
import axios from 'axios';

const CreateAdmin = () => {
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage

      const response = await axios.post('http://localhost:5000/api/admin/create', adminData, {
        headers: {
          Authorization: `Bearer ${token}`, // Attach token in Authorization header
          'Content-Type': 'application/json',
        },
      });

      setMessage('Admin created successfully!');
      console.log('Response:', response.data);

      // Reset the form
      setAdminData({
        name: '',
        email: '',
        password: '',
      });
    } catch (err) {
      console.error('Error creating admin:', err);
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Admin</h2>

        {message && <div className="text-green-600 mb-4 text-center">{message}</div>}
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={adminData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter admin name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={adminData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter admin email"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={adminData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
        >
          Create Admin
        </button>
      </form>
    </div>
  );
};

export default CreateAdmin;
