import React from 'react';

const BothellSerenityBrochure = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-b from-blue-50 to-green-50 min-h-screen">
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-300">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">BS</span>
            </div>
            <h1 className="text-3xl font-bold ml-4 text-blue-800">Bothell Serenity Corp</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#about" className="text-gray-700 hover:text-blue-600 transition">About</a></li>
              <li><a href="#services" className="text-gray-700 hover:text-blue-600 transition">Services</a></li>
              <li><a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a></li>
            </ul>
          </nav>
        </div>
        <div className="h-72 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
          <p className="text-3xl text-white font-semibold px-12 text-center">
            Creating peaceful environments for mindful living
          </p>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="mb-12">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">About Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-xl font-medium text-blue-700 mb-2">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              At Bothell Serenity Corp, we're dedicated to creating spaces that promote peace, 
              wellness, and mindfulness through design that integrates nature with modern aesthetics.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-xl font-medium text-green-700 mb-2">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              We strive to make every space a sanctuary of mental and physical wellbeing, 
              transforming how people experience their surroundings with sustainable design.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="mb-12">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Wellness Design", description: "Spaces designed to enhance mental and physical wellbeing.", color: "blue" },
            { title: "Meditation Areas", description: "Custom-designed spaces for mindfulness and relaxation.", color: "green" },
            { title: "Biophilic Integration", description: "Bringing nature into everyday spaces for harmony.", color: "teal" }
          ].map((service, index) => (
            <div key={index} className={`bg-white p-6 rounded-lg shadow-lg border-t-4 border-${service.color}-500 hover:shadow-xl transition`}> 
              <h3 className={`text-lg font-medium text-${service.color}-700 mb-2`}>{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-4">Let's create a serene space together. Reach out to us today.</p>
            <ul className="space-y-3">
              <li className="flex items-center"><span className="mr-2">📍</span> 123 Tranquility Lane, Bothell, WA 98011</li>
              <li className="flex items-center"><span className="mr-2">📞</span> (425) 555-0123</li>
              <li className="flex items-center"><span className="mr-2">✉️</span> info@bothellserenity.com</li>
            </ul>
          </div>
          <div>
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full p-3 rounded bg-white text-gray-800" />
              <input type="email" placeholder="Your Email" className="w-full p-3 rounded bg-white text-gray-800" />
              <textarea placeholder="Your Message" rows="3" className="w-full p-3 rounded bg-white text-gray-800"></textarea>
              <button className="w-full py-3 bg-white text-blue-800 font-bold rounded hover:bg-gray-100 transition">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-600 text-sm">
        <p>© 2025 Bothell Serenity Corp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BothellSerenityBrochure;