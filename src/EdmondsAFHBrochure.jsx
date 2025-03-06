import React from 'react';

const EdmondsAFHBrochure = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-blue-50">
      {/* Header Section */}
      <header className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">1E</span>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800">1st Edmonds AFH LLC</h1>
              <p className="text-blue-600 italic">Adult Family Home Care</p>
            </div>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-md text-blue-800 text-center">
            <p className="font-semibold">Licensed by Washington State</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-64 bg-blue-200 flex items-center justify-center">
            <p className="text-xl md:text-2xl text-center text-blue-800 px-6 font-semibold">
              Compassionate Care in a Home-Like Environment
            </p>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              At 1st Edmonds AFH LLC, we provide personalized care services for seniors in a comfortable, 
              family-style setting. Our experienced caregivers are dedicated to enhancing the quality of life 
              for each resident while maintaining their dignity and independence.
            </p>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">💊</span>
            </div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Medication Management</h3>
            <p className="text-gray-600">
              Our trained staff ensures that all medications are administered correctly and on schedule, 
              with proper documentation and monitoring of effects.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🍽️</span>
            </div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Nutritious Meals</h3>
            <p className="text-gray-600">
              We provide home-cooked, balanced meals that accommodate dietary restrictions and preferences 
              while promoting good nutrition and health.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🚿</span>
            </div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Personal Care Assistance</h3>
            <p className="text-gray-600">
              We assist with activities of daily living including bathing, dressing, grooming, and mobility 
              support, tailored to each resident's abilities and needs.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Activities & Engagement</h3>
            <p className="text-gray-600">
              We offer social activities, cognitive stimulation, and recreational opportunities designed 
              to enhance mental well-being and prevent isolation.
            </p>
          </div>
        </div>
      </section>

      {/* Our Facility Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Our Facility</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Wheelchair accessible throughout</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Private and semi-private rooms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Emergency response system</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Homelike common areas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Secured outdoor garden space</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-200 h-48 md:h-auto flex items-center justify-center p-6">
              <p className="text-blue-800 text-center font-medium">
                Our home is designed with safety, comfort, and accessibility in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="mb-8">
        <div className="bg-blue-600 text-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">What Families Say About Us</h2>
          <div className="bg-blue-700 rounded-lg p-5 mb-4">
            <p className="italic mb-3">
              "The staff at 1st Edmonds AFH has been exceptional in caring for my mother. 
              They treat her with respect and genuine affection, and the home-like setting 
              has made her transition much easier than we expected."
            </p>
            <p className="font-semibold text-right">— Mary T., Daughter of Resident</p>
          </div>
          <div className="bg-blue-700 rounded-lg p-5">
            <p className="italic mb-3">
              "We visited many facilities before choosing 1st Edmonds AFH. The personalized 
              attention, cleanliness, and warm atmosphere stood out immediately. Our father 
              has thrived under their care."
            </p>
            <p className="font-semibold text-right">— James W., Son of Resident</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Contact Us</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6">
              <p className="mb-4">We welcome your inquiries and would be happy to schedule a tour of our facility.</p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">📍</span>
                  <p>123 Care Avenue, Edmonds, WA 98020</p>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">📞</span>
                  <p>(425) 555-1234</p>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">✉️</span>
                  <p>care@1stedmondsafh.com</p>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">⏰</span>
                  <p>Tours available daily: 10am - 4pm</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-blue-50">
              <form className="space-y-4">
                <div>
                  <label className="block text-blue-800 mb-1">Name</label>
                  <input type="text" className="w-full p-2 border border-blue-200 rounded" />
                </div>
                <div>
                  <label className="block text-blue-800 mb-1">Phone</label>
                  <input type="tel" className="w-full p-2 border border-blue-200 rounded" />
                </div>
                <div>
                  <label className="block text-blue-800 mb-1">Message</label>
                  <textarea rows="3" className="w-full p-2 border border-blue-200 rounded"></textarea>
                </div>
                <button className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700">
                  Request Information
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-blue-800 border-t border-blue-200 pt-6">
        <p>© 2025 1st Edmonds AFH LLC. All rights reserved.</p>
        <p className="mt-2 text-sm">License #AFH-12345 | Washington State Department of Social and Health Services</p>
      </footer>
    </div>
  );
};

export default EdmondsAFHBrochure;