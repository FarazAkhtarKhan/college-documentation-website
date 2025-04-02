import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaUniversity, FaSearch, 
  FaFilter, FaCheckCircle, FaTimesCircle, FaInfoCircle 
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    dateFrom: '',
    dateTo: '',
  });
  const { currentUser } = useAuth();
  const [myParticipations, setMyParticipations] = useState([]);
  const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && currentPage < totalPages) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, currentPage, totalPages]);

  // Fetch upcoming events and user participations
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [eventsRes, participationsRes] = await Promise.all([
          axios.get('/api/events/active'),
          axios.get('/api/student/events')
        ]);

        // Get participating event IDs
        const participatingIds = participationsRes.data.events.map(event => event._id);
        setMyParticipations(participatingIds);

        // Process and set events
        const activeEvents = eventsRes.data.events;
        console.log('Fetched events:', activeEvents); // Debug log
        setEvents(activeEvents);
        setTotalPages(Math.ceil(activeEvents.length / 10));
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.response?.data?.message || 'Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters and search
  const filteredEvents = events.filter(event => {
    // Search term filter
    if (searchTerm && 
        !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.details.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Department filter
    if (filters.department && !event.department.includes(filters.department)) {
      return false;
    }
    
    // Date range filter
    if (filters.dateFrom && new Date(event.startDate) < new Date(filters.dateFrom)) {
      return false;
    }
    
    if (filters.dateTo && new Date(event.endDate) > new Date(filters.dateTo)) {
      return false;
    }

    // Category filter
    if (selectedCategory && event.category !== selectedCategory) {
      return false;
    }

    // Tags filter
    if (selectedTags.length > 0 && !event.tags?.some(tag => selectedTags.includes(tag))) {
      return false;
    }
    
    return true;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      department: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTags([]);
  };

  const handleParticipate = async (eventId) => {
    try {
      await axios.post(`/api/events/${eventId}/participate`);
      setMyParticipations(prev => [...prev, eventId]);
      setActionStatus({ 
        message: 'Successfully registered for the event!', 
        type: 'success' 
      });
      
      // Clear the status message after 3 seconds
      setTimeout(() => {
        setActionStatus({ message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      setActionStatus({ 
        message: error.response?.data?.message || 'Failed to register for event', 
        type: 'error' 
      });
      
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setActionStatus({ message: '', type: '' });
      }, 3000);
    }
  };

  const handleCancelParticipation = async (eventId) => {
    try {
      await axios.delete(`/api/events/${eventId}/participate`);
      setMyParticipations(prev => prev.filter(id => id !== eventId));
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

  return (
    <motion.div 
      className="events-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="events-header">
        <h1 className="page-title">
          <FaCalendarAlt /> Upcoming Events
        </h1>
      </div>

      {actionStatus.message && (
        <motion.div 
          className={`action-status ${actionStatus.type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {actionStatus.type === 'success' ? <FaCheckCircle /> : <FaInfoCircle />}
          {actionStatus.message}
        </motion.div>
      )}

      <div className="search-filter-container">
        <div className="search-box" style={{ flex: '0 1 60%' }}> {/* Adjusted width */}
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <motion.button 
          className="filter-button"
          onClick={() => setFilterVisible(!filterVisible)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaFilter /> {filterVisible ? 'Hide Filters' : 'Show Filters'}
        </motion.button>
      </div>
      
      {filterVisible && (
        <motion.div 
          className="filter-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="filter-grid">
            <div className="filter-item">
              <label><FaUniversity /> Department</label>
              <select 
                name="department" 
                value={filters.department}
                onChange={handleFilterChange}
              >
                <option value="">All Departments</option>
                {/* You can map through departments here */}
                <option value="SSCS">SSCS</option>
                <option value="SOM">SOM</option>
                <option value="SOH">SOH</option>
              </select>
            </div>
            
            <div className="filter-item">
              <label><FaCalendarAlt /> From Date</label>
              <input 
                type="date" 
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-item">
              <label><FaCalendarAlt /> To Date</label>
              <input 
                type="date" 
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <motion.button 
              className="reset-filter-btn"
              onClick={resetFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset Filters
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <div className="activities-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => {
              const isParticipating = myParticipations.includes(event._id);
              const isEventFull = event.maxParticipants > 0 && 
                                 event.participants.length >= event.maxParticipants;
              const deadlinePassed = event.registrationDeadline && 
                                    new Date() > new Date(event.registrationDeadline);
                                    
              return (
                <motion.div 
                  key={event._id}
                  ref={index === filteredEvents.length - 1 ? lastElementRef : null}
                  className={`event-card ${isParticipating ? 'participating-event' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <div className="participation-badge">
                      {isParticipating && <span className="enrolled-badge">Enrolled</span>}
                    </div>
                  </div>
                  
                  <div className="event-dates">
                    <p>
                      <FaCalendarAlt /> {formatDate(event.startDate)} - {formatDate(event.endDate)}
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
                    
                    {event.maxParticipants > 0 && (
                      <div className="capacity-info">
                        Capacity: {event.participants.length}/{event.maxParticipants} 
                        {isEventFull && <span className="full-badge">Full</span>}
                      </div>
                    )}
                    
                    {event.registrationDeadline && (
                      <div className="deadline-info">
                        Registration deadline: {formatDate(event.registrationDeadline)}
                        {deadlinePassed && <span className="passed-badge">Passed</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="event-actions">
                    {isParticipating ? (
                      <motion.button
                        className="cancel-participation-btn"
                        onClick={() => handleCancelParticipation(event._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={deadlinePassed}
                      >
                        <FaTimesCircle /> Cancel Registration
                      </motion.button>
                    ) : (
                      <motion.button
                        className="participate-btn"
                        onClick={() => handleParticipate(event._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isEventFull || deadlinePassed}
                      >
                        <FaCheckCircle /> Register for Event
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="no-events">
              <p>No upcoming events found</p>
              {(searchTerm || filters.department || filters.dateFrom || filters.dateTo) && (
                <motion.button 
                  className="reset-filter-btn"
                  onClick={resetFilters}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset Filters
                </motion.button>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StudentEvents;
