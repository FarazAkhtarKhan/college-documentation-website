import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaUniversity, FaHeading, 
  FaAlignLeft, FaListUl, FaChevronDown, FaChevronUp, FaTrash,
  FaCheckCircle, FaRegCheckCircle, FaSearch, FaFilter
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Events = () => {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    details: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  // Add missing state variables for infinite scroll
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const departments = [
    "SSCS - School of Science and Computer Studies",
    "SOM - School of Management",
    "SOH - School of Humanities",
    "SOET - School of Engineering and Technology",
    "SOLS - School of Legal Studies",
    "SLS - School of Liberal Studies"
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events/active'); // Changed endpoint
        setEvents(response.data.events);
        setTotalPages(Math.ceil(response.data.events.length / 10)); // Assuming 10 items per page
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await axios.post('/api/events', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Only add to the list if it's an upcoming event
      const eventEndDate = new Date(response.data.event.endDate);
      if (eventEndDate >= new Date()) {
        setEvents(prev => [...prev, response.data.event]);
      }
      
      setFormData({
        title: '',
        department: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        details: ''
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating event:', err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        alert('You need to be logged in to create events.');
      } else if (err.response?.status === 403) {
        alert('You do not have permission to create events. Admin access is required.');
      } else {
        alert('Failed to create event. Please try again later.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      await axios.delete(`/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setEvents(prev => prev.filter(event => event._id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err.response?.data || err.message);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleCompleteEvent = async (eventId) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      await axios.patch(`/api/events/${eventId}/complete`, 
        { completed: true },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Remove the completed event from the display list
      setEvents(prev => prev.filter(event => event._id !== eventId));
    } catch (err) {
      console.error('Error completing event:', err.response?.data || err.message);
      alert('Failed to mark event as completed. Please try again.');
    }
  };

  const eventsByDepartment = events.reduce((acc, event) => {
    if (!acc[event.department]) {
      acc[event.department] = [];
    }
    acc[event.department].push(event);
    return acc;
  }, {});

  const toggleDepartment = (department) => {
    setExpandedDepartments({
      ...expandedDepartments,
      [department]: !expandedDepartments[department]
    });
  };

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

  return (
    <motion.div 
      className="events-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="events-header">
        <h1 className="page-title">
          <FaListUl /> Upcoming Events
        </h1>
      </div>

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

      <motion.button
        className="add-event-btn fixed-add-btn"
        onClick={() => setShowForm(!showForm)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
       {showForm ? 'Close Form' : 'Add New Event'}
      </motion.button>

      {showForm && (
        <motion.form 
          onSubmit={handleSubmit}
          className="event-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="form-group">
            <label><FaHeading /> Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label><FaUniversity /> Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label><FaCalendarAlt /> Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label><FaCalendarAlt /> End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label><FaClock /> Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label><FaClock /> End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label><FaAlignLeft /> Details</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>
          
          <button type="submit" className="submit-btn">
            Add Event
          </button>
        </motion.form>
      )}

      <div className="events-by-department">
        {Object.keys(eventsByDepartment).length === 0 ? (
          <div className="no-events">
            <p>No upcoming events found</p>
          </div>
        ) : (
          Object.keys(eventsByDepartment).map(department => (
            <div className="department-events-section" key={department}>
              <motion.div 
                className="department-header"
                onClick={() => toggleDepartment(department)}
                whileHover={{ backgroundColor: '#f8f9fa' }}
              >
                <h2><FaUniversity /> {department}</h2>
                <button className="toggle-btn">
                  {expandedDepartments[department] ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </motion.div>
              
              {(expandedDepartments[department] !== false) && (
                <div className="department-events">
                  {eventsByDepartment[department].map((event, index) => (
                    <motion.div 
                      key={event._id}
                      ref={index === eventsByDepartment[department].length - 1 ? lastElementRef : null}
                      className="event-card"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <div className="card-actions">
                          <motion.button 
                            className="complete-event-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteEvent(event._id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Mark as completed"
                          >
                            <FaRegCheckCircle />
                          </motion.button>
                          <motion.button 
                            className="delete-event-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event._id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
                      </div>
                      <div className="event-dates">
                        <p>
                          <FaCalendarAlt /> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                        <p>
                          <FaClock /> {event.startTime} - {event.endTime}
                        </p>
                      </div>
                      <div className="event-details">
                        <p>{event.details}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Events;
