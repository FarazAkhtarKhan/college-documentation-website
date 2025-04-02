import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserProfileMenu from '../common/UserProfileMenu';

const DashboardLayout = () => {
  const navItems = [
    { path: '/dashboard', name: 'Home' },
    { path: '/dashboard/departments', name: 'Departments' },
    { path: '/dashboard/events', name: 'Events' },
    { path: '/dashboard/records', name: 'Records' },
    { path: '/dashboard/analytics', name: 'Analytics' },
    { path: '/dashboard/admin-management', name: 'Admin Management' },
  ];

  return (
    <div className="dashboard-wrapper">
      <header className="top-nav">
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

export default DashboardLayout;
