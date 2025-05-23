// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100">
        <Outlet/>
      </div>
    </div>
  );
};

export default Layout;
