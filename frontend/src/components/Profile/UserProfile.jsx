import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaIdCard, FaUniversity, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const UserProfile = () => {
  const { currentUser, isAdmin, isStudent } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: ''
  });
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/profile');
        setProfile(response.data.user);
        setFormData({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          studentId: response.data.user.studentId || '',
          department: response.data.user.department || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch('/api/user/profile', formData);
      setProfile(response.data.user);
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  const cancelEdit = () => {
    // Reset form data to original profile values
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      studentId: profile.studentId || '',
      department: profile.department || ''
    });
    setIsEditing(false);
  };
  
  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (error && !profile) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="profile-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">
        <FaUser /> My Profile
      </h1>
      
      {updateSuccess && (
        <motion.div 
          className="action-status success"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FaCheck /> Profile updated successfully!
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          className="action-status error"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FaTimes /> {error}
        </motion.div>
      )}
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {isAdmin ? (
              <div className="avatar-icon admin"><FaUser /></div>
            ) : (
              <div className="avatar-icon student"><FaUser /></div>
            )}
          </div>
          <div className="profile-title">
            <h2>{profile.name}</h2>
            <span className="profile-role">{isAdmin ? 'Administrator' : 'Student'}</span>
          </div>
          
          {!isEditing && (
            <motion.button 
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaEdit /> Edit Profile
            </motion.button>
          )}
        </div>
        
        <div className="profile-content">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label><FaUser /> Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label><FaEnvelope /> Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {isStudent && (
                <>
                  <div className="form-group">
                    <label><FaIdCard /> Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      disabled
                    />
                    <small className="helper-text">Student ID cannot be changed</small>
                  </div>
                  
                  <div className="form-group">
                    <label><FaUniversity /> Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled
                    />
                    <small className="helper-text">Department cannot be changed</small>
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <motion.button
                  type="button"
                  className="cancel-btn"
                  onClick={cancelEdit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTimes /> Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  className="save-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCheck /> Save Changes
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <div className="detail-label"><FaUser /> Full Name</div>
                <div className="detail-value">{profile.name}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label"><FaEnvelope /> Email</div>
                <div className="detail-value">{profile.email}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Username</div>
                <div className="detail-value">{profile.username}</div>
              </div>
              
              {isStudent && (
                <>
                  <div className="detail-item">
                    <div className="detail-label"><FaIdCard /> Student ID</div>
                    <div className="detail-value">{profile.studentId}</div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label"><FaUniversity /> Department</div>
                    <div className="detail-value">{profile.department}</div>
                  </div>
                </>
              )}
              
              <div className="detail-item">
                <div className="detail-label">Account Created</div>
                <div className="detail-value">{new Date(profile.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
