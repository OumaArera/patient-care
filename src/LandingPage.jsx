import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import image1 from "./assets/image1.jpg";
import image2 from "./assets/image2.jpg";
import image3 from "./assets/image3.jpg";
import image4 from "./assets/image4.jpg";
import image5 from "./assets/image5.jpg";
import image6 from "./assets/image6.jpg";
import image7 from "./assets/image7.jpg";
import image8 from "./assets/image8.jpg";
import image9 from "./assets/image9.jpg";
import image10 from "./assets/image10.jpg";

const caregivingMessages = [
  "Caring for our elders is more than duty—it’s an honor.",
  "Mission: We are dedicated to providing exceptional care with compassion, respect, and dignity by providing appropriate training and skills for our staff that fit our client's needs",
  "Dignity, respect, and kindness—because they deserve the best.",
  "Vision: To become the most trusted name in home healthcare by providing care with passion while ensuring independence of every client",
  "Respect: We respect our residents aspirations, and commitments and seek to understand and promote their priorities, needs, abilities, and limits.",
  "Integrity: Doing the right thing, in the right way, at all times. Being the model for compliance, discipline, and quality.",
  "Compassion: is at the heart of everything we do for our residents, combining humanity, kindness, and care.",
  "Together, we create a safe and loving environment.",
  "Excellence: Creating an environment of teamwork and participation through continuous performance improvement and open communication.",
  "Because every elder deserves to be heard, valued, and cherished.",
];

const images = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10];

const LandingPage = () => {
  const [content, setContent] = useState({
    image: images[Math.floor(Math.random() * images.length)],
    message: caregivingMessages[Math.floor(Math.random() * caregivingMessages.length)],
  });

  // Controls whether the background should be "cover" or "contain"
  const [fitToScreen, setFitToScreen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setContent({
        image: images[Math.floor(Math.random() * images.length)],
        message: caregivingMessages[Math.floor(Math.random() * caregivingMessages.length)],
      });
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center transition-all duration-1000"
      style={{
        backgroundImage: `url(${content.image})`,
        backgroundSize: fitToScreen ? "contain" : "cover", // Toggle between "contain" and "cover"
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-opacity-75"></div>

      {/* Animated text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={content.message}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-black bg-opacity-75 p-6 rounded-lg shadow-lg max-w-lg text-center"
        >
          <p className="text-3xl font-semibold">{content.message}</p>
        </motion.div>
      </AnimatePresence>

      {/* Toggle Button for fit mode */}
      <button
        onClick={() => setFitToScreen(!fitToScreen)}
        className="absolute bottom-5 right-5 z-20 bg-gray-800 text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-700 transition"
      >
        Toggle Fit Mode ({fitToScreen ? "Cover" : "Contain"})
      </button>
    </div>
  );
};

export default LandingPage;
