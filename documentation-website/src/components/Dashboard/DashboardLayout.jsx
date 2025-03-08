// Dashboard.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";

const DashboardLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Outlet /> {/* This will render nested routes */}
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
        ></motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
