import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaCalendarAlt, FaUniversity, FaListUl, FaTimes, FaHistory, FaChevronLeft, FaChevronRight, FaFilePdf, FaCog } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Records = () => {
  const [searchParams] = useSearchParams();
  const departmentFromUrl = searchParams.get('department');
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [pdfOptionsVisible, setPdfOptionsVisible] = useState(false);
  const [filters, setFilters] = useState({
    department: departmentFromUrl || '',
    dateFrom: '',
    dateTo: '',
    type: ''
  });
  
  // PDF export options
  const [pdfOptions, setPdfOptions] = useState({
    title: 'Event Records Report',
    includeDetails: true,
    landscape: false,
    includeHeader: true,
    includeDepartment: true,
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  // Infinite scroll state
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(true); // Default to infinite scroll
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

  // Sample departments for filter dropdown
  const departments = [
    "SSCS - School of Science and Computer Studies",
    "SOM - School of Management",
    "SOH - School of Humanities",
    "SOET - School of Engineering and Technology",
    "SOLS - School of Legal Studies",
    "SLS - School of Liberal Studies"
  ];

  // Fetch completed events
  const fetchCompletedEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter for past events (events that have ended or are manually completed)
      const pastEvents = data.events.filter(event => 
        new Date(event.endDate) < new Date() || event.completed
      );
      
      setEvents(pastEvents);
      // Calculate total pages based on filtered events and items per page
      setTotalPages(Math.ceil(pastEvents.length / itemsPerPage));
      setError(null);
    } catch (err) {
      console.error('Error fetching completed events:', err);
      setError('Failed to load completed events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedEvents();
    
    if (departmentFromUrl) {
      setFilterVisible(true);
    }
  }, [departmentFromUrl]);

  // Apply search and filters to events
  const filteredEvents = events.filter(event => {
    // Search term filter
    if (searchTerm && 
        !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.details.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Department filter
    if (filters.department) {
      const deptFilter = filters.department.toLowerCase();
      const eventDept = event.department.toLowerCase();
      
      if (!eventDept.includes(deptFilter)) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateFrom && new Date(event.startDate) < new Date(filters.dateFrom)) {
      return false;
    }
    
    if (filters.dateTo && new Date(event.endDate) > new Date(filters.dateTo)) {
      return false;
    }
    
    return true;
  });

  // Update total pages whenever filtered events change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredEvents.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredEvents.length, itemsPerPage, searchTerm, filters]);

  // Get current events for pagination
  const indexOfLastEvent = currentPage * itemsPerPage;
  const currentEvents = filteredEvents.slice(0, indexOfLastEvent);

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
      dateTo: '',
      type: ''
    });
    setSearchTerm('');
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  const togglePaginationMode = () => {}; // Remove toggle functionality

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle PDF options change
  const handlePdfOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPdfOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Generate PDF report
  const generatePDF = () => {
    // Create a new PDF document
    const doc = new jsPDF(pdfOptions.landscape ? 'landscape' : 'portrait', 'mm', 'a4');
    
    // Set document properties
    doc.setProperties({
      title: pdfOptions.title,
      subject: 'Event Records',
      author: 'Event Documentation Site',
      creator: 'Event Documentation Site'
    });
    
    // Add title to the PDF
    if (pdfOptions.includeHeader) {
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(pdfOptions.title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      // Add report generation details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Report generated on ${new Date().toLocaleString()}`, 
        doc.internal.pageSize.getWidth() / 2, 
        27, 
        { align: 'center' }
      );
      
      // Add filter details if any
      if (filters.department || filters.dateFrom || filters.dateTo) {
        let filterText = 'Filters applied: ';
        if (filters.department) filterText += `Department: ${filters.department} | `;
        if (filters.dateFrom) filterText += `From: ${new Date(filters.dateFrom).toLocaleDateString()} | `;
        if (filters.dateTo) filterText += `To: ${new Date(filters.dateTo).toLocaleDateString()} | `;
        
        doc.text(
          filterText.slice(0, -3),
          doc.internal.pageSize.getWidth() / 2,
          33,
          { align: 'center' }
        );
      }
    }
    
    // Prepare data for table
    const tableColumns = [
      { header: 'Title', dataKey: 'title' },
      { header: 'Start Date', dataKey: 'startDate' },
      { header: 'End Date', dataKey: 'endDate' }
    ];
    
    // Include department column if option is selected
    if (pdfOptions.includeDepartment) {
      tableColumns.push({ header: 'Department', dataKey: 'department' });
    }
    
    // Include details column if option is selected
    if (pdfOptions.includeDetails) {
      tableColumns.push({ header: 'Details', dataKey: 'details' });
    }
    
    // Prepare rows data
    const tableData = filteredEvents.map(event => {
      const row = {
        title: event.title,
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate)
      };
      
      if (pdfOptions.includeDepartment) {
        row.department = event.department.split(' - ')[0]; // Short department name
      }
      
      if (pdfOptions.includeDetails) {
        row.details = event.details;
      }
      
      return row;
    });
    
    // Generate the table
    autoTable(doc, {
      startY: pdfOptions.includeHeader ? 40 : 10,
      head: [tableColumns.map(col => col.header)],
      body: tableData.map(row => tableColumns.map(col => row[col.dataKey])),
      headStyles: {
        fillColor: [67, 97, 238], // Primary color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto',
        fontSize: 9
      },
      columnStyles: {
        details: { cellWidth: 'auto' }
      },
      margin: { top: 10 }
    });
    
    // Add footer with page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${totalPages}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`${pdfOptions.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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
          <FaHistory /> {filters.department ? `${filters.department} Events` : 'Event Records'}
        </h1>
        
        {/* Add PDF export button */}
        <div className="header-actions">
          <motion.button 
            className="pdf-export-btn"
            onClick={() => setPdfOptionsVisible(!pdfOptionsVisible)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={filteredEvents.length === 0 || loading}
          >
            <FaFilePdf /> Generate PDF Report
          </motion.button>
        </div>
      </div>
      
      {/* PDF Options Panel */}
      {pdfOptionsVisible && (
        <motion.div 
          className="pdf-options-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h3><FaCog /> PDF Report Options</h3>
          
          <div className="pdf-options-grid">
            <div className="form-group">
              <label htmlFor="pdf-title">Report Title</label>
              <input
                type="text"
                id="pdf-title"
                name="title"
                value={pdfOptions.title}
                onChange={handlePdfOptionChange}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="includeDetails"
                  checked={pdfOptions.includeDetails}
                  onChange={handlePdfOptionChange}
                />
                Include Event Details
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="includeDepartment"
                  checked={pdfOptions.includeDepartment}
                  onChange={handlePdfOptionChange}
                />
                Include Department
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="landscape"
                  checked={pdfOptions.landscape}
                  onChange={handlePdfOptionChange}
                />
                Landscape Orientation
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="includeHeader"
                  checked={pdfOptions.includeHeader}
                  onChange={handlePdfOptionChange}
                />
                Include Header
              </label>
            </div>
          </div>
          
          <div className="pdf-actions">
            <motion.button
              className="cancel-btn"
              onClick={() => setPdfOptionsVisible(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            
            <motion.button
              className="generate-pdf-btn"
              onClick={generatePDF}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={filteredEvents.length === 0}
            >
              <FaFilePdf /> Generate PDF
            </motion.button>
          </div>
        </motion.div>
      )}
      
      <div className="search-filter-container">
        <div className="search-box" style={{ flex: '0 1 60%' }}> {/* Adjusted width */}
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search completed events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <FaTimes 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>
        
        <motion.button 
          className="filter-button"
          onClick={() => setFilterVisible(!filterVisible)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaFilter /> {filterVisible ? 'Hide Filters' : 'Show Filters'}
        </motion.button>

        {/* Removed the circle-shaped element */}
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
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
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

            <div className="filter-item">
              <label><FaListUl /> Items Per Page</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
              </select>
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
          <p>Loading completed events...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <motion.button 
            className="retry-btn"
            onClick={fetchCompletedEvents}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </div>
      ) : (
        <>
          <div className="activities-grid">
            {currentEvents.length > 0 ? (
              currentEvents.map((event, index) => (
                <motion.div 
                  key={event._id} 
                  className="event-card completed-event"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  ref={useInfiniteScroll && index === currentEvents.length - 1 ? lastElementRef : null}
                >
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <div className="card-actions">
                      <span className="department-badge">Completed</span>
                    </div>
                  </div>
                  <div className="event-dates">
                    <p>
                      <FaCalendarAlt /> {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </p>
                    <p>
                      <FaUniversity /> {event.department.split(' - ')[0]}
                    </p>
                  </div>
                  <div className="event-details">
                    <p>{event.details}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-events">
                <p>No completed events found matching your criteria</p>
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
          
          {/* Infinite Scroll Loader */}
          {currentPage < totalPages && !loading && (
            <div className="infinite-scroll-loader">
              <div className="loading-spinner small"></div>
              <p>Loading more events...</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Records;
