import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaUser, FaKey, FaCog, FaSignOutAlt, FaUserShield, FaUserGraduate } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserProfileMenu = () => {
  const { currentUser, logout, isAdmin, isStudent } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dashboard base path based on user role
  const dashboardPath = isAdmin ? '/dashboard' : '/student-dashboard';

  return (
    <div className="user-profile-container" ref={menuRef}>
      <motion.div 
        className="user-profile"
        onClick={toggleMenu}
        whileHover={{ scale: 1.05 }}
      >
        <div className={`user-icon-container ${isAdmin ? 'admin-icon' : 'student-icon'}`}>
          {isAdmin ? <FaUserShield /> : <FaUserGraduate />}
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="profile-card-menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-menu-header">
              <div className="user-avatar">
                <FaUserCircle />
              </div>
              <div className="user-info-card">
                <h4>{currentUser?.name}</h4>
                <p>{currentUser?.email}</p>
                <span className="user-role-badge">{isAdmin ? 'Administrator' : 'Student'}</span>
              </div>
            </div>
            
            <div className="card-menu-items">
              <Link to={`${dashboardPath}/profile`} className="card-menu-item" onClick={() => setIsOpen(false)}>
                <FaUser /> Profile
              </Link>
              
              <Link to={`${dashboardPath}/change-password`} className="card-menu-item" onClick={() => setIsOpen(false)}>
                <FaKey /> Change Password
              </Link>
              
              {isAdmin && (
                <Link to={`${dashboardPath}/settings`} className="card-menu-item" onClick={() => setIsOpen(false)}>
                  <FaCog /> Settings
                </Link>
              )}
              
              <button className="card-menu-item logout-item" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileMenu;
