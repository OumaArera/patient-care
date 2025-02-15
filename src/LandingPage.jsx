import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

// Array of caregiving messages
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

// Array of imported images
const images = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10];

const LandingPage = () => {
  const [randomImage, setRandomImage] = useState(null);
  const [randomMessage, setRandomMessage] = useState("");

  useEffect(() => {
    // Select a random image and message on mount
    setRandomImage(images[Math.floor(Math.random() * images.length)]);
    setRandomMessage(caregivingMessages[Math.floor(Math.random() * caregivingMessages.length)]);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-6">
      <div className="max-w-3xl w-full p-6 shadow-lg bg-white rounded-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-2xl"
        >
          <img src={randomImage} alt="Caregiving moment" className="w-full h-64 object-cover rounded-2xl" />
        </motion.div>
        <div className="mt-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl font-semibold text-gray-800"
          >
            {randomMessage}
          </motion.h2>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
