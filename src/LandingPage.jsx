import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaChartBar, 
  FaPills, 
  FaUserInjured, 
  FaCalendarAlt, 
  FaBell,
  FaUsers,
  FaHospital
} from "react-icons/fa";

import image1 from "./assets/image1.jpg";
import image2 from "./assets/image2.jpg";
import image3 from "./assets/image3.jpg";
import image4 from "./assets/image4.jpg";
import image5 from "./assets/image5.jpg";
import image6 from "./assets/image6.jpg";
import secondPDF from "./assets/BOTHELL_SERENITY_CORP _BROCHURE.pdf";
import firstPDF from "./assets/1ST_EDMONDS AFH LLC _BROCHURE.pdf";

const caregivingMessages = [
  "Mission: We are dedicated to providing exceptional care with compassion, respect, and dignity by providing appropriate training and skills for our staff that fit our client's needs.",
  "Vision: To become the most trusted name in home healthcare by providing care with passion while ensuring independence of every client.",
  "Respect: We respect our residents' aspirations and commitments, seeking to understand and promote their priorities, needs, abilities, and limits.",
  "Integrity: Doing the right thing, in the right way, at all times. Being the model for compliance, discipline, and quality.",
  "Compassion: At the heart of everything we do, combining humanity, kindness, and care.",
  "Excellence: Creating an environment of teamwork and participation through continuous improvement and open communication.",
];

const images = [image1, image2, image3, image4, image5, image6];

const QuickAccessCard = ({ icon, title, count, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 cursor-pointer transition-all duration-300 transform hover:scale-105"
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <span className="text-2xl font-bold text-blue-400">{count}</span>
    </div>
  </div>
);

const LandingPage = ({ onTabChange }) => {
  const indexRef = useRef(Math.floor(Math.random() * images.length));
  const [content, setContent] = useState({
    image: images[indexRef.current],
    message: caregivingMessages[
      Math.floor(Math.random() * caregivingMessages.length)
    ],
  });

  const quickAccessItems = [
    {
      icon: <FaUserInjured className="text-3xl text-blue-400" />,
      title: "Manage Residents",
      count: 42,
      tab: "patients"
    },
    {
      icon: <FaCalendarAlt className="text-3xl text-green-400" />,
      title: "Appointments",
      count: 15,
      tab: "appointments"
    },
    {
      icon: <FaPills className="text-3xl text-purple-400" />,
      title: "Medication Admin",
      count: 23,
      tab: "medications"
    },
    {
      icon: <FaChartBar className="text-3xl text-yellow-400" />,
      title: "Charts",
      count: 8,
      tab: "charts"
    },
    {
      icon: <FaUsers className="text-3xl text-pink-400" />,
      title: "Staff Management",
      count: 35,
      tab: "manageUser"
    },
    {
      icon: <FaHospital className="text-3xl text-red-400" />,
      title: "Facilities",
      count: 6,
      tab: "facilities"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % images.length;
      const nextImage = images[indexRef.current];

      // Preload next image to prevent glitches
      const img = new Image();
      img.src = nextImage;
      img.onload = () => {
        setContent({
          image: nextImage,
          message:
            caregivingMessages[
              Math.floor(Math.random() * caregivingMessages.length)
            ],
        });
      };
    }, 15000); // Change every 15 seconds for smoother experience

    return () => clearInterval(interval);
  }, []);

  const openPDF = (pdfFile) => {
    window.open(pdfFile, "_blank");
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image Section */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${content.image})`,
          backgroundSize: "cover",
        }}
      >
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Animated Mission Statement */}
        <AnimatePresence mode="wait">
          <motion.div
            key={content.message}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="absolute top-0 left-0 right-0 bg-black/60 p-6 text-center"
          >
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed drop-shadow-lg">
              {content.message}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 mt-20">
          {/* Quick Access Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
              <FaBell className="mr-3 text-blue-500" /> Quick Access
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickAccessItems.map((item) => (
                <QuickAccessCard 
                  key={item.title}
                  {...item}
                  onClick={() => onTabChange(item.tab)}
                />
              ))}
            </div>
          </div>

          {/* PDF Buttons */}
          <div className="flex flex-col justify-end">
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => openPDF(firstPDF)}
                className="px-4 py-2 bg-blue-300 hover:bg-blue-400 text-white font-medium rounded-md shadow-md transition-all duration-200"
              >
                View Edmonds Brochure
              </button>
              <button
                onClick={() => openPDF(secondPDF)}
                className="px-4 py-2 bg-green-300 hover:bg-green-400 text-white font-medium rounded-md shadow-md transition-all duration-200"
              >
                View Bothell Brochure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;