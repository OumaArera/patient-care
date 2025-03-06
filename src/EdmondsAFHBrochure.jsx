import React from 'react';
import bohel from './assets/bothel_ceo.jpg';

const BothellSerenityBrochure = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-b from-blue-900 to-green-700 text-gray-100">
      {/* Header Section */}
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-white tracking-wide">BOTHELL SERENITY CORP</h1>
        <p className="text-lg text-green-300 italic">Providing Care with Passion</p>
      </header>

      {/* Company Profile */}
      <section className="mb-12 bg-gradient-to-r from-blue-800 to-green-600 p-8 rounded-lg shadow-xl">
        <h2 className="text-4xl font-semibold text-white mb-4 border-b-2 border-green-300 pb-2">Company Profile</h2>
        <p className="text-gray-200 leading-relaxed">
          Bothell Serenity Corp stands as a premier provider of home health care
          services dedicated to enhancing the quality of life for clients while
          preserving their independence and dignity. Founded on the
          fundamental belief that every individual deserves compassionate,
          personalized care in the comfort of their own home, our organization has
          established itself as a beacon of excellence in the healthcare industry.
        </p>
      </section>

      {/* CEO Message */}
      <section className="relative mb-12 bg-cover bg-center p-12 rounded-lg shadow-xl text-center" style={{ backgroundImage: `url(${bohel})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg"></div>
        <h2 className="relative text-4xl font-bold text-white mb-6">Message from the CEO</h2>
        <p className="relative text-xl italic text-green-200">
          "We love what we do. We love Healthcare, and helping our clients is our hallmark. We aim to make that passion evident in every aspect of our work."
        </p>
        <div className="relative mt-4 text-green-300 font-semibold text-lg">Haddy Saho, CEO & Provider</div>
      </section>

      {/* Our Mission & Vision */}
      <section className="mb-12 text-center">
        <h2 className="text-4xl font-semibold text-white mb-6">Our Mission & Vision</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-700 to-green-500 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-medium text-white mb-2">Our Mission</h3>
            <p className="text-gray-200 leading-relaxed">
              To provide exceptional care with compassion, respect, and dignity by providing appropriate training and skills
              for our staff that fit our client's needs.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-medium text-white mb-2">Our Vision</h3>
            <p className="text-gray-200 leading-relaxed">
              To become the most trusted home health care service provider by providing care with passion and ensuring
              independence for every client.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-12">
        <h2 className="text-4xl font-semibold text-white mb-6">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "Integrity", desc: "Doing the right thing, in the right way, at all times. Being the model for compliance, discipline, accountability, and quality." },
            { title: "Excellence", desc: "Creating an environment of teamwork and participation through continuous performance improvement and open communication." },
            { title: "Respect", desc: "We respect the aspirations and commitments of our clients and seek to comprehend and advance their priorities and abilities." },
            { title: "Compassion", desc: "The heart of everything we do for our clients, combining professionalism with genuine care." }
          ].map((value, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-800 to-gray-700 p-8 rounded-lg shadow-lg border-l-4 border-green-400">
              <h3 className="text-2xl font-medium text-green-300">{value.title}</h3>
              <p className="text-gray-300 mt-2">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section className="mb-12 bg-gradient-to-r from-blue-800 to-green-600 p-8 rounded-lg shadow-xl">
        <h2 className="text-4xl font-semibold text-white mb-6">Our Branches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { name: "Bothell Serenity AFH", address: "3411 174th PI SE, Bothell, 98012", phone: "425-895-2641", fax: "425-892-7391", email: "serenityadultfamilyhome@gmail.com" },
            { name: "Serenity Everett AFH", address: "1507 128th St SW, Everett, 98204", phone: "425-521-0504", fax: "425-491-7499", email: "serenityeverettafh1507@gmail.com" },
            { name: "Lynnwood Serenity AFH", address: "322 151st PI SE, Lynnwood, 98087", phone: "425-532-2090", fax: "360-939-8003", email: "serenitylynnwoodafh@gmail.com" },
            { name: "Canyon Park Serenity AFH", address: "20710 13th Dr SE, Bothell WA, 98012", phone: "425-521-0320", fax: "360-939-8003", email: "serenityatcanyonpark@gmail.com" },
          ].map((branch, index) => (
            <div key={index} className="bg-gray-900 p-8 rounded-lg shadow-lg border-l-4 border-blue-300">
              <h3 className="text-2xl font-medium text-blue-300">{branch.name}</h3>
              <p className="text-gray-300">{branch.address}</p>
              <p className="text-gray-300">📞 {branch.phone}</p>
              <p className="text-gray-300">📠 {branch.fax}</p>
              <p className="text-gray-300">✉️ {branch.email}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-500 text-center text-gray-300 text-sm">
        <p>© 2025 Bothell Serenity Corp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BothellSerenityBrochure;
