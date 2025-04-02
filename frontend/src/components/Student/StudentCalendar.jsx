import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaInfoCircle, FaUniversity, FaClock } from 'react-icons/fa';
import axios from 'axios';

// Setup the localizer for the calendar
const localizer = momentLocalizer(moment);

// Custom component to add event indicators to date cells
const DateCellWrapper = ({ children, value, events }) => {
  const hasEvents = events.some(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const date = new Date(value);
    
    // Reset hours for date comparison
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(23, 59, 59, 999);
    date.setHours(0, 0, 0, 0);
    
    return date >= eventStart && date <= eventEnd;
  });

  return (
    <div className="rbc-day-bg" style={{ position: 'relative' }}>
      {children}
      {hasEvents && <div className="event-indicator-dot" />}
    </div>
  );
};

const StudentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, myEventsRes] = await Promise.all([
          axios.get('/api/events/active'),
          axios.get('/api/student/events')
        ]);
        
        // Get participating event IDs
        const participatingIds = myEventsRes.data.events.map(event => event._id);
        setMyParticipations(participatingIds);
        
        // Format events for the calendar
        const formattedEvents = eventsRes.data.events.map(event => ({
          ...event,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          title: event.title,
          allDay: !event.startTime || !event.endTime,
          resource: {
            isParticipating: participatingIds.includes(event._id),
            department: event.department,
            details: event.details,
            startTime: event.startTime,
            endTime: event.endTime
          }
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Error fetching events for calendar:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calendar event rendering
  const eventStyleGetter = (event) => {
    const isParticipating = event.resource?.isParticipating;
    
    return {
      style: {
        backgroundColor: isParticipating ? 'var(--success)' : 'var(--primary)',
        borderRadius: '4px',
        opacity: 1,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  // Custom components
  const components = {
    dateCellWrapper: (props) => <DateCellWrapper {...props} events={events} />
  };

  // Add tooltips to events
  const formats = {
    eventTimeRangeFormat: () => null, // Disable default time range format
  };

  return (
    <motion.div 
      className="calendar-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="events-header">
        <h1 className="page-title">
          <FaCalendarAlt /> Calendar View
        </h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading calendar...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <div className="calendar-wrapper">
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'var(--primary)' }}></div>
              <span>Available Events</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'var(--success)' }}></div>
              <span>Enrolled Events</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot"></div>
              <span>Day with Events</span>
            </div>
          </div>
          
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleEventClick}
            formats={formats}
            tooltipAccessor={event => `${event.title} ${event.resource?.isParticipating ? '(Enrolled)' : ''}`}
            components={components}
          />
          
          {selectedEvent && (
            <motion.div 
              className="event-detail-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="modal-content">
                <button className="close-modal" onClick={closeEventDetails}>×</button>
                <h2>{selectedEvent.title}</h2>
                <div className="event-dates modal-dates">
                  <p>
                    <FaCalendarAlt /> {formatDate(selectedEvent.startDate)} - {formatDate(selectedEvent.endDate)}
                  </p>
                  <p>
                    <FaClock /> {selectedEvent.resource.startTime} - {selectedEvent.resource.endTime}
                  </p>
                  <p>
                    <FaUniversity /> {selectedEvent.resource.department.split(' - ')[0]}
                  </p>
                </div>
                <div className="event-details">
                  <p>{selectedEvent.resource.details}</p>
                </div>
                <div className="event-status">
                  {myParticipations.includes(selectedEvent._id) ? (
                    <div className="enrolled-status">
                      <FaInfoCircle /> You are enrolled in this event
                    </div>
                  ) : (
                    <button 
                      className="participate-btn"
                      onClick={() => window.location.href = '/student-dashboard/events'}
                    >
                      View in Events List
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StudentCalendar;
