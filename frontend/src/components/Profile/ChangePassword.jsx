import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaKey, FaLock, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing in field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/user/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Password changed successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to change password';
      
      if (errorMsg.includes('Current password')) {
        setErrors({ currentPassword: errorMsg });
      } else {
        setErrors({ general: errorMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div 
      className="change-password-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">
        <FaKey /> Change Password
      </h1>
      
      {success && (
        <motion.div 
          className="action-status success"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FaCheck /> {success}
        </motion.div>
      )}
      
      {errors.general && (
        <motion.div 
          className="action-status error"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FaTimes /> {errors.general}
        </motion.div>
      )}
      
      <div className="password-card">
        <div className="password-header">
          <h2>Update Your Password</h2>
          <p>Please fill out the form below to change your password</p>
        </div>
        
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label><FaLock /> Current Password</label>
            <div className="password-input-container">
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={errors.currentPassword ? 'error' : ''}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.currentPassword && <div className="error-text">{errors.currentPassword}</div>}
          </div>
          
          <div className="form-group">
            <label><FaLock /> New Password</label>
            <div className="password-input-container">
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? 'error' : ''}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.newPassword && <div className="error-text">{errors.newPassword}</div>}
          </div>
          
          <div className="form-group">
            <label><FaLock /> Confirm New Password</label>
            <div className="password-input-container">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>
          
          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li className={formData.newPassword.length >= 6 ? 'met' : ''}>
                Minimum 6 characters
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'met' : ''}>
                At least one uppercase letter
              </li>
              <li className={/[0-9]/.test(formData.newPassword) ? 'met' : ''}>
                At least one number
              </li>
            </ul>
          </div>
          
          <motion.button
            type="submit"
            className="update-password-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            <FaKey /> {isSubmitting ? 'Updating...' : 'Update Password'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChangePassword;
