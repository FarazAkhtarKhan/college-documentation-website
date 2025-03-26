import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserGraduate } from 'react-icons/fa';
import UserProfileMenu from '../common/UserProfileMenu';

const StudentDashboardLayout = () => {
  const navItems = [
    { path: '/student-dashboard', name: 'Home' },
    { path: '/student-dashboard/events', name: 'Events' },
    { path: '/student-dashboard/calendar', name: 'Calendar' },
    { path: '/student-dashboard/my-activities', name: 'My Activities' },
  ];

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
          <UserProfileMenu />
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
