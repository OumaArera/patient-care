import React from 'react';

const BothellSerenityBrochure = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-b from-blue-50 to-green-50 text-gray-800">
      {/* Header Section */}
      <header className="mb-10 text-center">
        <div className="text-4xl font-bold text-blue-800">Bothell Serenity Corp</div>
        <p className="text-lg text-gray-600">Enhancing Lives with Compassionate Care</p>
      </header>

      {/* Company Profile */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-green-800 mb-4">Company Profile</h2>
        <p className="text-gray-700">
          Bothell Serenity Corp is a premier provider of home health care services dedicated to enhancing the quality of life for clients
          while preserving their independence and dignity. Our highly trained and skilled staff ensure that each individual receives compassionate,
          personalized care in the comfort of their home.
        </p>
      </section>

      {/* CEO Message */}
      <section className="relative mb-12 bg-blue-700 text-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-semibold mb-4">Message from the CEO</h2>
        <p className="text-lg italic">
          "We love what we do. We love Healthcare, and helping our clients is our hallmark. We aim to make that passion evident in every aspect of our work."
        </p>
        <div className="mt-4 font-bold">Haddy Saho, CEO & Provider</div>
      </section>

      {/* Core Values */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-green-800 mb-4">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Integrity", desc: "Doing the right thing, in the right way, at all times. Being the model for compliance, discipline, accountability, and quality." },
            { title: "Excellence", desc: "Creating an environment of teamwork and participation through continuous performance improvement and open communication." },
            { title: "Respect", desc: "We respect the aspirations and commitments of our clients and seek to comprehend and advance their priorities and abilities." },
            { title: "Compassion", desc: "The heart of everything we do for our clients, combining professionalism with genuine care." }
          ].map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
              <h3 className="text-xl font-medium text-green-700">{value.title}</h3>
              <p className="text-gray-700 mt-2">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-blue-800 mb-4">Our Branches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[
            { name: "Bothell Serenity AFH", address: "3411 174th PI SE, Bothell, 98012", phone: "425-895-2641", fax: "425-892-7391", email: "serenityadultfamilyhome@gmail.com" },
            { name: "Serenity Everett AFH", address: "1507 128th St SW, Everett, 98204", phone: "425-521-0504", fax: "425-491-7499", email: "serenityeverettafh1507@gmail.com" },
            { name: "Lynnwood Serenity AFH", address: "322 151st PI SE, Lynnwood, 98087", phone: "425-532-2090", fax: "360-939-8003", email: "serenitylynnwoodafh@gmail.com" },
            { name: "Canyon Park Serenity AFH", address: "20710 13th Dr SE, Bothell WA, 98012", phone: "425-521-0320", fax: "360-939-8003", email: "serenityatcanyonpark@gmail.com" },
          ].map((branch, index) => (
            <div key={index} className="p-6 rounded-lg shadow-md border-l-4 border-blue-600">
              <h3 className="text-xl font-medium text-blue-700">{branch.name}</h3>
              <p className="text-gray-700">{branch.address}</p>
              <p className="text-gray-700">📞 {branch.phone}</p>
              <p className="text-gray-700">📠 {branch.fax}</p>
              <p className="text-gray-700">✉️ {branch.email}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Information */}
      <section className="text-center bg-green-700 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p>Provider: Haddy Saho</p>
        <p>📞 425-346-9231</p>
        <p>✉️ hadsalo@hotmail.com</p>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-600 text-sm">
        <p>© 2025 Bothell Serenity Corp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BothellSerenityBrochure;