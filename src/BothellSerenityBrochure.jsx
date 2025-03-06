import React from 'react';

const BothellSerenityBrochure = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">BS</span>
            </div>
            <h1 className="text-3xl font-bold ml-4 text-teal-800">Bothell Serenity Corp</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#about" className="text-teal-700 hover:text-teal-900">About</a></li>
              <li><a href="#services" className="text-teal-700 hover:text-teal-900">Services</a></li>
              <li><a href="#contact" className="text-teal-700 hover:text-teal-900">Contact</a></li>
            </ul>
          </nav>
        </div>
        <div className="h-64 bg-teal-50 rounded-lg flex items-center justify-center mb-6">
          <p className="text-2xl text-center text-teal-800 px-12">Creating peaceful environments for mindful living</p>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* About Section */}
        <section id="about" className="mb-12">
          <h2 className="text-2xl font-semibold text-teal-800 mb-4">About Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium text-teal-700 mb-2">Our Mission</h3>
              <p className="text-gray-700">
                At Bothell Serenity Corp, we're dedicated to creating spaces that promote peace, 
                wellness, and mindfulness. Our designs integrate natural elements with modern aesthetics 
                to foster environments where balance and tranquility thrive.
              </p>
            </div>
            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium text-teal-700 mb-2">Our Vision</h3>
              <p className="text-gray-700">
                We envision a world where every space contributes to the mental and physical wellbeing 
                of its occupants. Through thoughtful design and sustainable practices, we aim to transform 
                how people experience their surroundings.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="mb-12">
          <h2 className="text-2xl font-semibold text-teal-800 mb-4">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-teal-200 p-4 rounded-lg">
              <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-teal-600 text-lg">1</span>
              </div>
              <h3 className="text-lg font-medium text-teal-700 mb-2">Wellness Design</h3>
              <p className="text-gray-600 text-sm">
                Spaces designed specifically to promote physical and mental wellbeing.
              </p>
            </div>
            <div className="border border-teal-200 p-4 rounded-lg">
              <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-teal-600 text-lg">2</span>
              </div>
              <h3 className="text-lg font-medium text-teal-700 mb-2">Meditation Areas</h3>
              <p className="text-gray-600 text-sm">
                Custom-designed spaces for mindfulness practices and relaxation.
              </p>
            </div>
            <div className="border border-teal-200 p-4 rounded-lg">
              <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-teal-600 text-lg">3</span>
              </div>
              <h3 className="text-lg font-medium text-teal-700 mb-2">Biophilic Integration</h3>
              <p className="text-gray-600 text-sm">
                Incorporating natural elements to create harmony with the environment.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12 bg-teal-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-teal-800 mb-4">What Our Clients Say</h2>
          <div className="italic text-gray-700 mb-4">
            "Bothell Serenity Corp transformed our office space into an oasis of calm productivity. 
            Our team's wellbeing and creativity have improved tremendously."
          </div>
          <div className="text-right text-teal-700 font-medium">
            — Jane Smith, CEO of Mindful Innovations
          </div>
        </section>
      </main>

      {/* Contact Section */}
      <section id="contact" className="bg-teal-700 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-4">
              Ready to transform your space into a sanctuary of serenity? 
              Reach out to us to schedule a consultation.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="mr-2">📍</span> 
                <span>123 Tranquility Lane, Bothell, WA 98011</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span> 
                <span>(425) 555-0123</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✉️</span> 
                <span>info@bothellserenity.com</span>
              </li>
            </ul>
          </div>
          <div>
            <form className="space-y-3">
              <div>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full p-2 rounded border-teal-300 bg-white text-gray-800"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full p-2 rounded border-teal-300 bg-white text-gray-800"
                />
              </div>
              <div>
                <textarea 
                  placeholder="Your Message" 
                  rows="3" 
                  className="w-full p-2 rounded border-teal-300 bg-white text-gray-800"
                ></textarea>
              </div>
              <button className="bg-white text-teal-800 px-4 py-2 rounded font-medium hover:bg-teal-100">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-teal-200 text-center text-gray-500 text-sm">
        <p>© 2025 Bothell Serenity Corp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BothellSerenityBrochure;