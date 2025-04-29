import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUniversity, FaHistory, FaExclamationTriangle, FaSync } from 'react-icons/fa';

const Home = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchDepartmentsAndEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get both departments and events data in parallel
        const [departmentsResponse, eventsResponse] = await Promise.all([
          axios.get('/api/departments'),
          axios.get('/api/events')
        ]);
        
        // Check if the department data has the expected structure
        if (!departmentsResponse.data || !departmentsResponse.data.departments) {
          throw new Error('Invalid department data format received from API');
        }
        
        // Check if events data has the expected structure
        if (!eventsResponse.data || !eventsResponse.data.events) {
          throw new Error('Invalid events data format received from API');
        }
        
        const today = new Date();
        
        // Filter for COMPLETED events (either manually marked as completed or end date has passed)
        const completedEvents = eventsResponse.data.events.filter(event => 
          event.completed || new Date(event.endDate) < today
        );
        
        // Count completed events by department
        const eventCountsByDepartment = {};
        completedEvents.forEach(event => {
          const deptName = event.department;
          eventCountsByDepartment[deptName] = (eventCountsByDepartment[deptName] || 0) + 1;
        });
        
        // Enhance department data with completed event counts
        const departmentsWithEvents = departmentsResponse.data.departments.map(dept => {
          // Find event count for this department's full name
          let eventCount = 0;
          
          // Check both by full name and by abbreviation
          Object.keys(eventCountsByDepartment).forEach(deptKey => {
            if (deptKey.includes(dept.name) || 
                deptKey.includes(dept.abbr) ||
                dept.name.includes(deptKey) ||
                `${dept.abbr} - ${dept.name}` === deptKey) {
              eventCount += eventCountsByDepartment[deptKey];
            }
          });
          
          return {
            ...dept,
            eventsConducted: eventCount
          };
        });
        
        setDepartments(departmentsWithEvents);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentsAndEvents();
  }, [retryCount]); // Depend on retryCount to allow manual refresh

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="home-container">
      <section className="hero">
        <img src="/campus.png" alt="Event Venue" className="hero-image" />
        <div className="hero-text">
          <h1>Welcome to the Event Dashboard</h1>
          <p>Explore departments, events, and activities effortlessly.</p>
          <Link to="/dashboard/departments" className="btn">Explore Departments</Link>
        </div>
      </section>

      <section className="cards-section">
        <div className="section-header">
          <h2>
            <FaUniversity className="section-icon" /> 
            Our Departments
          </h2>
          {!loading && (
            <motion.button 
              className="view-all-link"
              onClick={handleRetry} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh departments"
            >
              <FaSync /> Refresh
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading departments and event history...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p><FaExclamationTriangle /> {error}</p>
            <motion.button 
              className="retry-btn"
              onClick={handleRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          </div>
        ) : departments.length === 0 ? (
          <div className="no-events">
            <p>No departments found. Please try again later.</p>
            <motion.button 
              className="retry-btn"
              onClick={handleRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          </div>
        ) : (
          <div className="card-grid">
            {departments.map((dept) => (
              <motion.div 
                key={dept._id} 
                className="card"
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
              >
                <div style={{ width: '300px', height: '200px', overflow: 'hidden', borderRadius: '10px' }}>
                  <img 
                    src={dept.image || '/placeholder.jpg'} 
                    alt={dept.name} 
                    className="card-image" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div className="card-content" style={{ flex: 1 }}>
                  <h3>{dept.name} <span>({dept.abbr})</span></h3>
                  <p><FaHistory /> {dept.eventsConducted} Events Conducted</p>
                  <p>{dept.description?.substring(0, 100)}...</p>
                  <Link 
                    to={`/dashboard/departments`} 
                    className="btn" 
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      backgroundColor: '#6c63ff', // Ensure a contrasting background color
                      color: '#fff', // High contrast text color
                      textDecoration: 'none',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Add subtle shadow for better visibility
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5a54d6'} // Hover effect
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#6c63ff'}
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;