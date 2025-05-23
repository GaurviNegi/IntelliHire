import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    testAttempted: false,
    score: 0,
    tabViolation: false,
  });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Create User
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/users', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData({ name: '', email: '', password: '', testAttempted: false, score: 0, tabViolation: false });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Handle Delete User with confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Handle Update User
  const handleUpdate = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      testAttempted: user.testAttempted,
      score: user.score,
      tabViolation: user.tabViolation,
    });
    setSelectedUserId(user._id);
    setIsUpdateModalOpen(true); // Open modal when user clicks update
  };

  const submitUpdate = async (e) => {
    e.preventDefault();

    try {
      // If password is not changed, send it as an empty string
      await axios.put(
        `http://localhost:5000/api/admin/users/${selectedUserId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsUpdateModalOpen(false);
      fetchUsers(); // Refresh users
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      {/* Create User Form */}
      <form onSubmit={handleCreate} className="mb-8">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Create User
        </button>
      </form>

      {/* Users Table */}
      <table className="w-full table-auto bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Test Attempted</th>
            <th className="p-2">Score</th>
            <th className="p-2">Tab Violation</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center border-t">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.testAttempted ? 'Yes' : 'No'}</td>
              <td className="p-2">{user.score}</td>
              <td className="p-2">{user.tabViolation ? 'Yes' : 'No'}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleUpdate(user)}
                  className="bg-yellow-400 px-2 py-1 rounded text-white"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-500 px-2 py-1 rounded text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update User Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl mb-4">Update User</h3>
            <form onSubmit={submitUpdate}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 mb-4"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border p-2 mb-4"
                required
              />
              <input
                type="password"
                placeholder="New Password (leave blank to keep the same)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border p-2 mb-4"
              />
              <div className="flex items-center mb-4">
                <label className="mr-2">Test Attempted</label>
                <input
                  type="checkbox"
                  checked={formData.testAttempted}
                  onChange={(e) => setFormData({ ...formData, testAttempted: e.target.checked })}
                />
              </div>
              <div className="mb-4">
                <label className="mr-2">Score</label>
                <input
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="border p-2"
                  required
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="mr-2">Tab Violation</label>
                <input
                  type="checkbox"
                  checked={formData.tabViolation}
                  onChange={(e) => setFormData({ ...formData, tabViolation: e.target.checked })}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

