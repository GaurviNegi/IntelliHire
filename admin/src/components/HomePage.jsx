// src/components/HomePage.js
import React from 'react';
import { getAdminFromToken } from '../utils/getAdminFromToken';
const HomePage = () => {

  const admin = getAdminFromToken();
    return (
      <div className="text-center h-screen">
      <h1 className="text-4xl font-bold mb-4">
        Welcome, {admin?.name || 'Admin'}!
      </h1>
      <p className="text-lg mb-2">
        Email: {admin?.email || 'Not available'}
      </p>
      <p className="text-lg mb-4">
        This is your dashboard to access all actions.
      </p>
      <div className='flex justify-center'>
        <img src="/admin-image.png" alt="Admin" className='w-96 h-96' />
      </div>
    </div>
    );
  };
  
  export default HomePage;
  