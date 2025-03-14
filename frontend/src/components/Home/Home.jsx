import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  // Sample department data with images from the public folder
  const departments = [
    {
      name: 'School of Science',
      abbr: 'SSCS',
      image: '/sscs.jpg',
      events: 12,
    },
    {
      name: 'School of Management',
      abbr: 'SOM',
      image: '/som.jpg',
      events: 8,
    },
    {
      name: 'School of Humanities',
      abbr: 'SOH',
      image: '/soh.jpg',
      events: 5,
    },
    {
      name: 'School of Engineering',
      abbr: 'SOET',
      image: '/soet.jpg',
      events: 9,
    },
    {
      name: 'School of Legal Studies',
      abbr: 'SOLS',
      image: '/sols.jpg',
      events: 3,
    },
    {
      name: 'School of Liberal Studies',
      abbr: 'SLS',
      image: '/sls.jpg',
      events: 7,
    },
  ];

  return (
    <div className="home-container">
      <section className="hero">
        <img src="/Image.jpg" alt="College Campus" className="hero-image" />
        <div className="hero-text">
          <h1>Welcome to the College Dashboard</h1>
          <p>Explore departments, events, and activities effortlessly.</p>
          <Link to="/dashboard/departments" className="btn">Explore Departments</Link>
        </div>
      </section>

      <section className="cards-section">
        <h2>Our Departments</h2>
        <div className="card-grid">
          {departments.map((dept, index) => (
            <motion.div 
              key={index} 
              className="card"
              whileHover={{ scale: 1.03 }}
            >
              <img src={dept.image} alt={dept.name} className="card-image" />
              <div className="card-content">
                <h3>{dept.name} <span>({dept.abbr})</span></h3>
                <p>{dept.events} Upcoming Events</p>
                <Link to="/dashboard/departments" className="btn">Learn More</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;