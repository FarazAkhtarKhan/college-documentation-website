import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaUniversity, FaHeading, 
  FaAlignLeft, FaListUl, FaChevronDown, FaChevronUp, FaTrash 
} from 'react-icons/fa';

const Events = () => {
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

  const departments = [
    "SSCS - School of Science and Computer Studies",
    "SOM - School of Management",
    "SOH - School of Humanities",
    "SOET - School of Engineering and Technology",
    "SOLS - School of Legal Studies",
    "SLS - School of Liberal Studies"
  ];

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        setEvents(prev => [...prev, data.event]);
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
      })
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteEvent = (eventId) => {
    fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      .then(() => {
        setEvents(prev => prev.filter(event => event.id !== eventId));
      })
      .catch(err => console.error(err));
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

  return (
    <motion.div 
      className="events-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="events-header">
        <h1 className="page-title">
          <FaListUl /> Event Management
        </h1>
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
          {/* ...existing form fields... */}
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
                  {eventsByDepartment[department].map(event => (
                    <motion.div 
                      key={event.id}
                      className="event-card"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <motion.button 
                          className="delete-event-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                      <div className="event-dates">
                        <p>
                          <FaCalendarAlt /> {event.startDate} - {event.endDate}
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
