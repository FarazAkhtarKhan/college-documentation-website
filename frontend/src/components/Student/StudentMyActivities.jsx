import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaClock, FaUniversity, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const StudentMyActivities = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchMyEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/student/events');
        setMyEvents(response.data.events);
        setError(null);
      } catch (err) {
        console.error('Error fetching my events:', err);
        setError('Failed to load your activities. Please try again.');
        setMyEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const handleCancelParticipation = async (eventId) => {
    try {
      await axios.delete(`/api/events/${eventId}/participate`);
      
      // Remove the event from the list
      setMyEvents(prev => prev.filter(event => event._id !== eventId));
      
      setActionStatus({ 
        message: 'Successfully unregistered from the event', 
        type: 'success' 
      });
      
      // Clear the status message after 3 seconds
      setTimeout(() => {
        setActionStatus({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      setActionStatus({ 
        message: error.response?.data?.message || 'Failed to cancel registration', 
        type: 'error' 
      });
      
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setActionStatus({ message: '', type: '' });
      }, 3000);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if event is upcoming or past
  const isUpcomingEvent = (event) => {
    // Consider both endDate and completed status
    return !event.completed && new Date(event.endDate) >= new Date();
  };

  return (
    <motion.div 
      className="events-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="events-header">
        <h1 className="page-title">
          <FaCalendarCheck /> My Activities
        </h1>
      </div>

      {actionStatus.message && (
        <motion.div 
          className={`action-status ${actionStatus.type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FaInfoCircle />
          {actionStatus.message}
        </motion.div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your activities...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {myEvents.length > 0 ? (
            <>
              <h2 className="section-title">Upcoming Activities</h2>
              <div className="activities-grid">
                {myEvents.filter(event => isUpcomingEvent(event)).map((event) => {
                  const deadlinePassed = event.registrationDeadline && 
                                        new Date() > new Date(event.registrationDeadline);
                  
                  return (
                    <motion.div 
                      key={event._id}
                      className="event-card participating-event"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <div className="participation-badge">
                          <span className="enrolled-badge">Enrolled</span>
                        </div>
                      </div>
                      
                      <div className="event-dates">
                        <p>
                          <FaCalendarCheck /> {formatDate(event.startDate)} - {formatDate(event.endDate)}
                        </p>
                        <p>
                          <FaClock /> {event.startTime} - {event.endTime}
                        </p>
                        <p>
                          <FaUniversity /> {event.department.split(' - ')[0]}
                        </p>
                      </div>
                      
                      <div className="event-details">
                        <p>{event.details}</p>
                      </div>
                      
                      <div className="event-actions">
                        <motion.button
                          className="cancel-participation-btn"
                          onClick={() => handleCancelParticipation(event._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={deadlinePassed}
                        >
                          <FaTimesCircle /> Cancel Registration
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <h2 className="section-title">Past Activities</h2>
              <div className="activities-grid">
                {myEvents.filter(event => !isUpcomingEvent(event)).map((event) => (
                  <motion.div 
                    key={event._id}
                    className="event-card past-event"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <div className="participation-badge">
                        <span className="completed-badge">Completed</span>
                      </div>
                    </div>
                    
                    <div className="event-dates">
                      <p>
                        <FaCalendarCheck /> {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      </p>
                      <p>
                        <FaUniversity /> {event.department.split(' - ')[0]}
                      </p>
                    </div>
                    
                    <div className="event-details">
                      <p>{event.details}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-events">
              <p>You are not registered for any activities yet.</p>
              <motion.button 
                className="browse-events-btn"
                onClick={() => window.location.href = '/student-dashboard/events'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Events
              </motion.button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default StudentMyActivities;
