import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/student-dashboard', name: 'Home' },
    { path: '/student-dashboard/events', name: 'Events' },
    { path: '/student-dashboard/my-activities', name: 'My Activities' },
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-wrapper">
      <header className="top-nav student-nav">
        <div className="nav-brand">
          <FaUserGraduate /> Student Portal
        </div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => isActive ? 'active nav-item' : 'nav-item'}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="dashboard-actions">
          <motion.div 
            className="user-profile"
            whileHover={{ scale: 1.05 }}
          >
            <div className="user-icon-container student-icon">
              <FaUserGraduate />
            </div>
            <span className="user-name">{currentUser?.name || 'Student'}</span>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <FaSignOutAlt />
            </button>
          </motion.div>
        </div>
      </header>
      <main className="dashboard-content">
        <Outlet />
      </main>
      <footer className="dashboard-footer">
        <p>2025 | © Faraz Akhtar Khan</p>
      </footer>
    </div>
  );
};

export default StudentDashboardLayout;
