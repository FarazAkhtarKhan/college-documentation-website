// Dashboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaBuilding, FaCalendarAlt, FaRunning } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const navigate = useNavigate();

  const navItems = [
    { id: 1, name: 'Home', icon: <FaHome /> },
    { id: 2, name: 'Departments', icon: <FaBuilding /> },
    { id: 3, name: 'Events', icon: <FaCalendarAlt /> },
    { id: 4, name: 'Activities', icon: <FaRunning /> },
  ];

  return (
    <div className="dashboard-container">
      {/* Navigation Sidebar */}
      <motion.nav 
        className="sidebar"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="logo">Admin Panel</div>
        <div className="nav-items">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="main-content">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Welcome to {activeTab}</h1>
          <p>This is the {activeTab.toLowerCase()} section of the dashboard.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis optio, commodi doloribus architecto qui aliquam amet praesentium et quidem molestias laboriosam delectus vel? Fugit sed odio sapiente sequi deleniti laudantium.
          </p>
          {/* Add your content components here based on activeTab */}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;