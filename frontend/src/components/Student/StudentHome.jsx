import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaCalendarCheck, FaExclamationTriangle, FaInfoCircle, FaChevronRight, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const StudentHome = () => {
  const { currentUser } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [participatingEvents, setParticipatingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [eventsRes, participatingRes] = await Promise.all([
          axios.get('/api/events'),
          axios.get('/api/student/events')
        ]);
        const today = new Date();
        const upcoming = eventsRes.data.events
          .filter(event => new Date(event.endDate) >= today && !event.completed)
          .slice(0, 4);
        setUpcomingEvents(upcoming);
        const studentEvents = participatingRes.data.events
          .filter(event => new Date(event.endDate) >= today)
          .slice(0, 3);
        setParticipatingEvents(studentEvents);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="home-container">
      <section className="hero">
        <img src="/Image.jpg" alt="College Campus" className="hero-image" />
        <div className="hero-text">
          <h1>Welcome, {currentUser?.name || 'Student'}!</h1>
          <p>Explore upcoming events and manage your activities.</p>
        </div>
      </section>
      
      {/* My Activities Section */}
      <section>
        <div className="section-header">
          <h2><FaCalendarCheck className="section-icon" /> My Registered Activities</h2>
          <motion.button className="view-all-link" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/student-dashboard/my-activities">View All <FaChevronRight /></Link>
          </motion.button>
        </div>
        {loading ? (
          <div className="loading-container"><div className="loading-spinner"></div><p>Loading your activities...</p></div>
        ) : error ? (
          <div className="error-message"><p><FaExclamationTriangle /> {error}</p></div>
        ) : participatingEvents.length > 0 ? (
          <div className="activities-grid">
            {participatingEvents.map(event => (
              <motion.div key={event._id} className="event-card participating-event" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className="enrolled-badge">Enrolled</span>
                </div>
                <div className="event-dates">
                  <p><FaCalendarAlt /> {formatDate(event.startDate)} - {formatDate(event.endDate)}</p>
                  <p><FaUniversity /> {event.department.split(' - ')[0]}</p>
                </div>
                <div className="event-actions">
                  <Link to="/student-dashboard/my-activities" className="view-details-btn">View Details <FaChevronRight /></Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="info-message">
            <FaInfoCircle /><p>You haven't registered for any upcoming events yet.</p>
            <Link to="/student-dashboard/events" className="action-btn">Browse Events</Link>
          </div>
        )}
      </section>
      
      {/* Upcoming Events Section */}
      <section>
        <div className="section-header">
          <h2><FaCalendarAlt className="section-icon" /> Upcoming Events</h2>
          <motion.button className="view-all-link" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/student-dashboard/events">View All <FaChevronRight /></Link>
          </motion.button>
        </div>
        {loading ? (
          <div className="loading-container"><div className="loading-spinner"></div><p>Loading upcoming events...</p></div>
        ) : error ? (
          <div className="error-message"><p><FaExclamationTriangle /> {error}</p></div>
        ) : upcomingEvents.length > 0 ? (
          <div className="activities-grid">
            {upcomingEvents.map(event => (
              <motion.div key={event._id} className="event-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div className="event-header"><h3>{event.title}</h3></div>
                <div className="event-dates">
                  <p><FaCalendarAlt /> {formatDate(event.startDate)}</p>
                  <p><FaUniversity /> {event.department.split(' - ')[0]}</p>
                </div>
                <div className="event-details"><p>{event.details.substring(0, 100)}...</p></div>
                <div className="event-actions">
                  <Link to="/student-dashboard/events" className="view-details-btn">See Details <FaChevronRight /></Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="info-message"><FaInfoCircle /><p>There are no upcoming events at this time.</p></div>
        )}
      </section>
    </div>
  );
};

export default StudentHome;
