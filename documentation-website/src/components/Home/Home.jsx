import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaFlask, FaChartLine, FaBook, FaCogs, 
  FaBalanceScale, FaGlobe, FaArrowRight, 
  FaCalendarAlt, FaChartBar, FaUniversity
} from 'react-icons/fa';
import ImageSlider from './ImageSlider';

const Home = () => {
  // Featured departments (condensed version of departments)
  const featuredDepartments = [
    {
      name: 'School of Science and Computer Studies',
      abbr: 'SSCS',
      icon: <FaFlask />,
      image: '/sscs.jpg',
      eventCount: 12
    },
    {
      name: 'School of Management',
      abbr: 'SOM',
      icon: <FaChartLine />,
      image: '/som.jpg',
      eventCount: 8
    },
    {
      name: 'School of Humanities',
      abbr: 'SOH',
      icon: <FaBook />,
      image: '/soh.jpg',
      eventCount: 5
    },
    {
      name: 'School of Engineering and Technology',
      abbr: 'SOET',
      icon: <FaCogs />,
      image: '/soet.jpg',
      eventCount: 9
    },
    {
      name: 'School of Legal Studies',
      abbr: 'SOLS',
      icon: <FaBalanceScale />,
      image: '/sols.jpg',
      eventCount: 3
    },
    {
      name: 'School of Liberal Studies',
      abbr: 'SLS',
      icon: <FaGlobe />,
      image: '/sls.jpg',
      eventCount: 7
    }
  ];
  
  // Sort departments by event count (for statistics)
  const sortedDepartments = [...featuredDepartments].sort((a, b) => b.eventCount - a.eventCount);
  
  // Calculate total events
  const totalEvents = featuredDepartments.reduce((total, dept) => total + dept.eventCount, 0);
  
  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section className="hero-section">
        <h1>Welcome to the College Documentation Portal</h1>
        <p>Manage departments, events, and activities all in one place</p>
        <ImageSlider />
      </section>
      
      {/* Quick Stats Section */}
      <section className="stats-section">
        <div className="section-header">
          <h2>
            <FaChartBar className="section-icon" /> 
            Quick Statistics
          </h2>
        </div>
        
        <div className="stats-overview">
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
          >
            <FaCalendarAlt className="stat-icon" />
            <h3>{totalEvents}</h3>
            <p>Total Upcoming Events</p>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
          >
            <FaUniversity className="stat-icon" />
            <h3>{featuredDepartments.length}</h3>
            <p>Academic Departments</p>
          </motion.div>
          
          <motion.div 
            className="stat-card most-active"
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
          >
            {sortedDepartments[0].icon}
            <h3>{sortedDepartments[0].abbr}</h3>
            <p>Most Active Department</p>
            <div className="event-badge">{sortedDepartments[0].eventCount} Events</div>
          </motion.div>
        </div>
        
        <div className="department-ranking">
          <h3>Departments by Event Activity</h3>
          <div className="ranking-bars">
            {sortedDepartments.map((dept, index) => (
              <div className="ranking-item" key={dept.abbr}>
                <div className="ranking-header">
                  <span className="rank-abbr">{dept.abbr}</span>
                  <span className="rank-name">{dept.name}</span>
                </div>
                <div className="rank-bar-container">
                  <motion.div 
                    className="rank-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${(dept.eventCount / sortedDepartments[0].eventCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    style={{ 
                      backgroundColor: index === 0 ? 'var(--primary)' : 
                                       index === 1 ? 'var(--primary-light)' : 
                                       'var(--secondary)' 
                    }}
                  />
                  <span className="rank-count">{dept.eventCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Departments Section */}
      <section className="featured-departments">
        <div className="section-header">
          <h2>
            <FaUniversity className="section-icon" /> 
            Academic Departments
          </h2>
          <Link to="/dashboard/departments" className="view-all-link">
            View All <FaArrowRight />
          </Link>
        </div>
        
        <div className="departments-grid">
          {featuredDepartments.map(dept => (
            <motion.div 
              key={dept.abbr}
              className="department-card"
              whileHover={{ y: -8, boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="dept-card-header">
                <div className="dept-icon-wrapper">
                  {dept.icon}
                </div>
                <span className="dept-abbr-badge">{dept.abbr}</span>
              </div>
              <div className="dept-card-content">
                <h3>{dept.name}</h3>
                <div className="event-count">
                  <FaCalendarAlt />
                  <span>{dept.eventCount} Events</span>
                </div>
                <Link to="/dashboard/departments" className="dept-link">
                  Learn More <FaArrowRight />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Home;