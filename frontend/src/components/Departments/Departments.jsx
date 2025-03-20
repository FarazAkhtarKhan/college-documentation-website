import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFlask, FaChartLine, FaBook, FaCogs, FaBalanceScale, FaGlobe, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Departments = () => {
  const [departments, setDepartments] = useState([]);

  // Map department abbreviations to icons
  const iconMap = {
    SSCS: <FaFlask />,
    SOM: <FaChartLine />,
    SOH: <FaBook />,
    SOL:<FaBalanceScale/>,
    SOLS:<FaCogs/>,
    SOET:<FaCogs/>,
  };

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        setDepartments(data.departments);
      })
      .catch(err => console.error(err));
  }, []);

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
            <img src={dept.image || '/placeholder.jpg'} alt={dept.name} />
          </motion.div>
          
          <div className="department-content">
            <div className="department-header">
              <div className="dept-icon">
                {/* Choose an icon based on department abbreviation */}
                {iconMap[dept.abbr] || <FaFlask />}
              </div>
              <h2>{dept.name} <span className="dept-abbr">({dept.abbr})</span></h2>
            </div>
            
            <p className="dept-description">
              {dept.description || 'Department description goes here.'}
            </p>
            
            <div className="dept-features">
              <h4>Features & Facilities</h4>
              <ul>
                <li>Feature 1</li>
                <li>Feature 2</li>
              </ul>
            </div>
            
            <div className="dept-events-preview">
              <h4>Upcoming Events</h4>
              {/* Update the link to navigate to records with the department name as a filter parameter */}
              <Link 
                to={`/dashboard/records?department=${encodeURIComponent(dept.name)}`} 
                className="view-dept-events"
              >
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
