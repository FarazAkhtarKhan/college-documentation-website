import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaBuilding, 
  FaCalendarAlt, 
  FaRunning 
} from 'react-icons/fa';

const Sidebar = () => {
    const navItems = [
        { path: '/dashboard', name: 'Home', icon: <FaHome /> },
        { path: '/dashboard/departments', name: 'Departments', icon: <FaBuilding /> },
        { path: '/dashboard/events', name: 'Events', icon: <FaCalendarAlt /> },
        { path: '/dashboard/activities', name: 'Activities', icon: <FaRunning /> },
      ];

  return (
    <motion.nav 
      className="sidebar"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="logo">Admin Panel</div>
      <div className="nav-items">
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </motion.div>
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};

export default Sidebar;