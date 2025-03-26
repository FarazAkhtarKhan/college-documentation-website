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
  // Check if this date has any events
  const hasEvents = events.some(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const date = new Date(value);
    
    // Reset time to compare only dates
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    // Check if the date is between the event start and end dates (inclusive)
    return date >= eventStart && date <= eventEnd;
  });

  return (
    <div className="rbc-day-bg">
      {children}
      {hasEvents && (
        <div className="event-indicator-dot" />
      )}
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
          axios.get('/api/events'),
          axios.get('/api/student/events')
        ]);
        
        // Filter for upcoming events only (events that haven't ended yet)
        const today = new Date();
        const upcomingEvents = eventsRes.data.events.filter(event => 
          new Date(event.endDate) >= today && !event.completed
        );
        
        // Format events for the calendar
        const formattedEvents = upcomingEvents.map(event => ({
          ...event,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          title: event.title,
          isParticipating: myEventsRes.data.events.some(e => e._id === event._id)
        }));
        
        setEvents(formattedEvents);
        
        // Create an array of event IDs the student is participating in
        const participatingIds = myEventsRes.data.events.map(event => event._id);
        setMyParticipations(participatingIds);
        
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
    const isParticipating = myParticipations.includes(event._id);
    
    return {
      style: {
        backgroundColor: isParticipating ? 'var(--success)' : 'var(--primary)',
        color: 'white',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        padding: '2px 5px',
        fontSize: '0.85rem',
        cursor: 'pointer'
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
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleEventClick}
            popup={true}
            tooltipAccessor={event => event.title}
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
                    <FaClock /> {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                  <p>
                    <FaUniversity /> {selectedEvent.department.split(' - ')[0]}
                  </p>
                </div>
                <div className="event-details">
                  <p>{selectedEvent.details}</p>
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
