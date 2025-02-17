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
  "Every moment spent in care is a moment filled with love.",
  "Dignity, respect, and kindness—because they deserve the best.",
  "Small acts of care create the greatest comfort.",
  "Aging gracefully is beautiful, and we are here to support it.",
  "Love, patience, and understanding—true pillars of caregiving.",
  "Every hand held, every smile shared—it all matters.",
  "Together, we create a safe and loving environment.",
  "Aging is a journey, and we walk it with you.",
  "Because every elder deserves to be heard, valued, and cherished.",
];

const images = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10];

const LandingPage = () => {
  const [content, setContent] = useState({
    image: images[Math.floor(Math.random() * images.length)],
    message: caregivingMessages[Math.floor(Math.random() * caregivingMessages.length)],
  });

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
      className="relative w-full h-screen flex items-center justify-center bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `url(${content.image})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <AnimatePresence mode="wait">
        <motion.div
          key={content.message}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1 }}
          className="relative z-10 bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg max-w-lg text-center"
        >
          <p className="text-2xl font-semibold text-white">{content.message}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
