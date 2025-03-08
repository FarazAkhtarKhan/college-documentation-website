// Dashboard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import {
  FaUser,
  FaHome,
  FaBuilding,
  FaCalendarAlt,
  FaRunning,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Swiper styles { i used this for image slider}
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const navigate = useNavigate();
  const images = ["/Image.jpg", "/Image2.jpg"];
  const navItems = [
    { id: 1, name: "Home", icon: <FaHome /> },
    { id: 2, name: "Departments", icon: <FaBuilding /> },
    { id: 3, name: "Events", icon: <FaCalendarAlt /> },
    { id: 4, name: "Activities", icon: <FaRunning /> },
  ];

  return (
    <div className="dashboard-container">
      {/* Navigation Sidebar */}
      <motion.nav
        className="sidebar"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="logo">Admin Panel</div>
        <div className="nav-items">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              className={`nav-item ${activeTab === item.name ? "active" : ""}`}
              onClick={() => setActiveTab(item.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="user-icon-container">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <FaUser className="user-icon" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ flex: 1 }}
        >
          <h1>{activeTab}</h1>

          {/* Image Slider */}
          <div className="swiper-container">
            <Swiper
              className="swiper-container"
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
            >
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img}
                    alt={`Slide ${index + 1}`}
                    className="slider-image"
                  />
                </SwiperSlide>
              ))}

              {/* Navigation Arrows */}
              <div className="swiper-nav swiper-button-prev-custom">
                <FaChevronLeft size={24} />
              </div>
              <div className="swiper-nav swiper-button-next-custom">
                <FaChevronRight size={24} />
              </div>
            </Swiper>
          </div>

          {activeTab === "Home" && (
            <div className="content-sections">
              {/* Section 1 */}
              <motion.div
                className="content-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="image-wrapper">
                  <img src="/Image2.jpg" alt="Section 1" />
                </div>
                <div className="text-content">
                  <h3>About College</h3>
                  <p>
                    Our state-of-the-art facilities provide the perfect
                    environment for innovation and growth. Designed with
                    sustainability in mind.
                  </p>
                </div>
              </motion.div>

              {/* Section 2 */}
              <motion.div
                className="content-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-content">
                  <h3>Placements</h3>
                  <p>
                    Leveraging the latest advancements in AI and machine
                    learning to drive business transformation and operational
                    efficiency.
                  </p>
                </div>
                <div className="image-wrapper">
                  <img src="/Image2.jpg" alt="Section 2" />
                </div>
              </motion.div>

              {/* Section 3 */}
              <motion.div
                className="content-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="image-wrapper">
                  <img src="/Image2.jpg" alt="Section 3" />
                </div>
                <div className="text-content">
                  <h3>Success stories</h3>
                  <p>
                    Connecting teams worldwide through our secure cloud-based
                    collaboration platform, enabling seamless communication.
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          <div className="paragraph-container">
            <p>
              This is the {activeTab.toLowerCase()} section of the dashboard.
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis
              optio, commodi doloribus architecto qui aliquam amet praesentium
              et quidem molestias laboriosam delectus vel? Fugit sed odio
              sapiente sequi deleniti laudantium.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
