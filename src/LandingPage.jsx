import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import image1 from "./assets/image1.jpg";
import image2 from "./assets/image2.jpg";
import image3 from "./assets/image3.jpg";
import image4 from "./assets/image4.jpg";
import image5 from "./assets/image5.jpg";
import image6 from "./assets/image6.jpg";

const caregivingMessages = [
  "Mission: We are dedicated to providing exceptional care with compassion, respect, and dignity by providing appropriate training and skills for our staff that fit our client's needs.",
  "Vision: To become the most trusted name in home healthcare by providing care with passion while ensuring independence of every client.",
  "Respect: We respect our residents’ aspirations and commitments, seeking to understand and promote their priorities, needs, abilities, and limits.",
  "Integrity: Doing the right thing, in the right way, at all times. Being the model for compliance, discipline, and quality.",
  "Compassion: At the heart of everything we do, combining humanity, kindness, and care.",
  "Excellence: Creating an environment of teamwork and participation through continuous improvement and open communication.",
];

const images = [image1, image2, image3, image4, image5, image6];

const LandingPage = () => {
  const indexRef = useRef(Math.floor(Math.random() * images.length));
  const [content, setContent] = useState({
    image: images[indexRef.current],
    message:
      caregivingMessages[
        Math.floor(Math.random() * caregivingMessages.length)
      ],
  });

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

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-end transition-all duration-1000"
      style={{
        backgroundImage: `url(${content.image})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark Gradient Overlay at Bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-1000"></div>

      {/* Animated Text Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={content.message}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1 }}
          className="relative z-10 mb-6 bg-black/60 p-6 rounded-xl shadow-lg max-w-4xl text-center"
        >
          <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed drop-shadow-lg">
            {content.message}
          </p>
        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;
