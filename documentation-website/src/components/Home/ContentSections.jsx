import React from "react";
import { motion } from "framer-motion";

const ContentSections = () => {
  const sections = [
    {
      image: "/bagalur-campus.png",
      title: "Bagalur Campus",
      text: "The CMR University Main Campus at Bagalur is an architectural marvel, housing the famous Steel Building designed by the CEO of CMR GI himself. This 60-acre lakefront campus has recently opened India's first on-campus animal shelter, ACSA.",
      reverse: false,
    },
    {
      image: "/city-campus.png",
      title: "city Campus(HRBR)",
      text: "At HRBR Layout, CMR University has set up its City Campus. The School of Ecnomics and School of Social Sciences and Humanities are located at this campus along with various administrative offices such as the Office of Student Affairs, the Department of Common Core Curriculum",
      reverse: true,
    },
    {
      image: "/ombr-campus.png",
      title: "Satellite Campus (OMBR)",
      text: "The Satellite Campus, located at OMBR Layout is one of the most happening and vibrant venues of the University. Students here are affiliated with School of Management, School of Science Studies, School of Legal Studies and the School of Economics and Commerce.",
      reverse: false,
    },
  ];

  return (
    <div className="content-sections">
      {sections.map((section, index) => (
        <motion.div
          key={index}
          className="content-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
        >
          {!section.reverse && (
            <div className="image-wrapper">
              <img src={section.image} alt={section.title} />
            </div>
          )}
          <div className="text-content">
            <h3>{section.title}</h3>
            <p>{section.text}</p>
          </div>
          {section.reverse && (
            <div className="image-wrapper">
              <img src={section.image} alt={section.title} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ContentSections;
