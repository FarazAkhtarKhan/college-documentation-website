import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserGraduate, FaIdCard, FaEnvelope, FaUniversity, FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    studentId: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();
  const { register } = useAuth();
  
  useEffect(() => {
    // Fetch departments for the dropdown
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        // If response.data.departments exists, use it; otherwise assume response.data is the array.
        const deptData = response.data.departments || response.data;
        console.log("Fetched departments:", deptData);
        setDepartments(deptData);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Student ID validation
    if (!formData.studentId) {
      newErrors.studentId = 'Student ID is required';
    }
    
    // Department validation
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
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
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        studentId: formData.studentId,
        department: formData.department,
        password: formData.password
      });
      
      navigate('/student-dashboard');
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      
      // Check if error is related to a specific field
      if (errorMessage.includes('Username')) {
        setErrors(prev => ({ ...prev, username: errorMessage }));
      } else if (errorMessage.includes('Email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.includes('Student ID')) {
        setErrors(prev => ({ ...prev, studentId: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="login-page">
      <motion.div 
        className="login-container register-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1>Student Registration</h1>
        <div className="icon-container">
          <FaUserGraduate size={40} />
        </div>
        
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FaUser /> Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label><FaUser /> Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <div className="error-text">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label><FaEnvelope /> Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label><FaIdCard /> Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={errors.studentId ? 'error' : ''}
            />
            {errors.studentId && <div className="error-text">{errors.studentId}</div>}
          </div>
          
          <div className="form-group">
            <label><FaUniversity /> Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? 'error' : ''}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id || dept.id} value={dept.name}>
                  {dept.name} ({dept.abbr})
                </option>
              ))}
            </select>
            {errors.department && <div className="error-text">{errors.department}</div>}
          </div>
          
          <div className="form-group">
            <label><FaLock /> Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label><FaLock /> Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>
          
          <motion.button
            type="submit"
            className="submit-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </motion.button>
        </form>
        
        <p className="login-help">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
