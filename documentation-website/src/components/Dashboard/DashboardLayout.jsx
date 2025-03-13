import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';

const DashboardLayout = () => {
  const navItems = [
    { path: '/dashboard', name: 'Home' },
    { path: '/dashboard/departments', name: 'Departments' },
    { path: '/dashboard/events', name: 'Events' },
    { path: '/dashboard/activities', name: 'Activities' },
  ];

  return (
    <div className="dashboard-wrapper">
      <header className="top-nav">
        <div className="logo">
          <img src="/Dashboard-image.jpg" alt="Dashboard Logo" />
          <span>College Dashboard</span>
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
            <div className="user-icon-container">
              <FaUser />
            </div>
            <span className="user-name">Admin</span>
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

export default DashboardLayout;
