// src/components/Departments/Departments.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaFlask, 
  FaChartLine, 
  FaBook, 
  FaCogs, 
  FaBalanceScale, 
  FaGlobe,
  FaArrowRight 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Departments = () => {
  const departments = [
    {
      name: 'School of Science and Computer Studies',
      abbr: 'SSCS',
      icon: <FaFlask />,
      image: '/sscs.jpg',
      description: `The School of Science and Computer Studies (SSCS) is dedicated to advancing knowledge in computer science, mathematics, and natural sciences. Our programs combine theoretical foundations with practical applications, preparing students for careers in technology, research, and innovation.`,
      features: [
        'State-of-the-art computer labs',
        'Industry partnerships with tech giants',
        'Cutting-edge research facilities',
        'International exchange programs'
      ]
    },
    {
      name: 'School of Management',
      abbr: 'SOM',
      icon: <FaChartLine />,
      image: '/som.jpg',
      description: `The School of Management (SOM) develops future business leaders through comprehensive programs in business administration, finance, and entrepreneurship. Our curriculum emphasizes real-world case studies and leadership development.`,
      features: [
        'Accredited business programs',
        'Entrepreneurship incubator',
        'Global business competitions',
        'Executive mentorship program'
      ]
    },
    {
      name: 'School of Management',
      abbr: 'SOM',
      icon: <FaChartLine />,
      image: '/som.jpg',
      description: `The School of Management (SOM) develops future business leaders through comprehensive programs in business administration, finance, and entrepreneurship. Our curriculum emphasizes real-world case studies and leadership development.`,
      features: [
        'Accredited business programs',
        'Entrepreneurship incubator',
        'Global business competitions',
        'Executive mentorship program'
      ]
    },
    {
      name: 'School of Management',
      abbr: 'SOM',
      icon: <FaChartLine />,
      image: '/som.jpg',
      description: `The School of Management (SOM) develops future business leaders through comprehensive programs in business administration, finance, and entrepreneurship. Our curriculum emphasizes real-world case studies and leadership development.`,
      features: [
        'Accredited business programs',
        'Entrepreneurship incubator',
        'Global business competitions',
        'Executive mentorship program'
      ]
    },
    {
      name: 'School of Management',
      abbr: 'SOM',
      icon: <FaChartLine />,
      image: '/som.jpg',
      description: `The School of Management (SOM) develops future business leaders through comprehensive programs in business administration, finance, and entrepreneurship. Our curriculum emphasizes real-world case studies and leadership development.`,
      features: [
        'Accredited business programs',
        'Entrepreneurship incubator',
        'Global business competitions',
        'Executive mentorship program'
      ]
    },
    {
      name: 'School of Management',
      abbr: 'SOM',
      icon: <FaChartLine />,
      image: '/som.jpg',
      description: `The School of Management (SOM) develops future business leaders through comprehensive programs in business administration, finance, and entrepreneurship. Our curriculum emphasizes real-world case studies and leadership development.`,
      features: [
        'Accredited business programs',
        'Entrepreneurship incubator',
        'Global business competitions',
        'Executive mentorship program'
      ]
    },
    // Add other departments similarly
  ];

  return (
    <motion.div 
      className="departments-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Academic Departments</h1>
      
      {departments.map((dept, index) => (
        <motion.div 
          className={`department-section ${index % 2 === 1 ? 'reverse' : ''}`}
          key={dept.abbr}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <motion.div 
            className="department-image"
            whileHover={{ scale: 1.05 }}
          >
            <img src={dept.image} alt={dept.name} />
          </motion.div>
          
          <div className="department-content">
            <div className="department-header">
              <div className="dept-icon">{dept.icon}</div>
              <h2>{dept.name} <span className="dept-abbr">({dept.abbr})</span></h2>
            </div>
            
            <p className="dept-description">{dept.description}</p>
            
            <div className="dept-features">
              <h4>Features & Facilities</h4>
              <ul>
                {dept.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="dept-events-preview">
              <h4>Upcoming Events</h4>
              <Link to={`/dashboard/events`} className="view-dept-events">
                View Department Events <FaArrowRight />
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Departments;