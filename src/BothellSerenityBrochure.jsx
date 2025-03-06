import React from 'react';
import secondPDF from "./assets/BOTHELL_SERENITY_CORP _BROCHURE.pdf";
import logo from './assets/BSC-LOGO.png';
import bothelCEO from './bothel_ceo.jpg';

const BothellSerenityBrochure = () => {
  return (
    <div className="max-w-6xl mx-auto bg-white text-gray-800">
      {/* Header Section */}
      <div className="bg-white border-b-4 border-teal-700 py-6 px-8 shadow-md">
        <header className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex-shrink-0">
            <img src={logo} alt="1ST Edmonds Logo" className="h-20 object-contain" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-wide text-teal-800">BOTHELL SERENITY CORP</h1>
            <p className="text-lg text-teal-600 italic mt-1">Providing Care with Passion</p>
          </div>
        </header>
      </div>

      <div className="p-8">
        {/* PDF Download Button */}
        <div className="mb-8 flex justify-center">
          <a 
            href={secondPDF} 
            download
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition duration-300 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Download Our Brochure
          </a>
        </div>

        {/* Company Profile */}
        <section className="mb-12 bg-white p-8 rounded-lg shadow-md border-l-4 border-teal-700">
          <h2 className="text-3xl font-semibold text-teal-800 mb-4 pb-2 border-b border-teal-200 text-center">Company Profile</h2>
          <p className="text-gray-700 leading-relaxed">
            Bothell Serenity Corp stands as a premier provider of home health care
            services dedicated to enhancing the quality of life for clients while
            preserving their independence and dignity. Founded on the
            fundamental belief that every individual deserves compassionate,
            personalized care in the comfort of their own home, our organization has
            established itself as a beacon of excellence in the healthcare industry.
          </p>
          <br />
          <p className="text-gray-700 leading-relaxed">
            At the heart of our operations is our unwavering commitment to providing
            exceptional care through a highly trained, skilled staff specifically selected
            to meet each client's unique needs. We recognize that effective home
            health care extends beyond medical assistance-it encompasses
            emotional support, respect for personal autonomy, and the cultivation of
            an environment where clients can thrive.
          </p>
          <br />
          <p className="text-gray-700 leading-relaxed">
            Our vision guides us toward becoming the most trusted name in home
            health care, delivering services with genuine passion while ensuring each
            client maintains their independence. This aspiration shapes every
            decision we make and every interaction we have.
          </p>
          <br />
          <p className="text-gray-700 leading-relaxed">
            Our balanced approach of professional expertise and genuine human
            connection continues to transform the home health care experience for
            our clients.
          </p>
        </section>

        {/* CEO Message */}
        <section className="mb-12 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5 relative">
              <img 
                src={bothelCEO} 
                alt="Haddy Saho, CEO" 
                className="w-full h-full object-cover object-center"
                style={{ minHeight: "300px" }}
              />
            </div>
            {/* Message Side */}
            <div className="md:w-3/5 bg-teal-700 p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-teal-500 pb-3">Message from the CEO</h2>
              <p className="text-xl italic text-white mb-6 leading-relaxed">
              "We love what we do. We love Healthcare, and helping our clients is our hallmark. We aim to make that passion evident in every aspect of our work."
              </p>
              <div className="text-teal-100 font-semibold text-lg self-end">
                — Haddy Saho, CEO & Provider
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Vision */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-teal-800 mb-6 text-center">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-teal-700">
              <h3 className="text-2xl font-medium text-teal-700 mb-3">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide exceptional care with compassion, respect, and dignity by providing appropriate training and skills
                for our staff that fit our client's needs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-teal-700">
              <h3 className="text-2xl font-medium text-teal-700 mb-3">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become the most trusted home health care service provider by providing care with passion and ensuring
                independence for every client.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-teal-800 text-center mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Integrity", desc: "Doing the right thing, in the right way, at all times. Being the model for compliance, discipline, accountability, and quality." },
              { title: "Excellence", desc: "Creating an environment of teamwork and participation through continuous performance improvement and open communication." },
              { title: "Respect", desc: "We respect the aspirations and commitments of our clients and seek to comprehend and advance their priorities and abilities." },
              { title: "Compassion", desc: "The heart of everything we do for our clients, combining professionalism with genuine care." }
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-600">
                <h3 className="text-xl font-medium text-teal-700">{value.title}</h3>
                <p className="text-gray-600 mt-2">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Branches */}
        <section className="mb-12 bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold text-teal-800 text-center mb-6">Our Branches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Bothell Serenity AFH", address: "3411 174th PI SE, Bothell, 98012", phone: "425-895-2641", fax: "425-892-7391", email: "serenityadultfamilyhome@gmail.com" },
              { name: "Serenity Everett AFH", address: "1507 128th St SW, Everett, 98204", phone: "425-521-0504", fax: "425-491-7499", email: "serenityeverettafh1507@gmail.com" },
              { name: "Lynnwood Serenity AFH", address: "322 151st PI SE, Lynnwood, 98087", phone: "425-532-2090", fax: "360-939-8003", email: "serenitylynnwoodafh@gmail.com" },
              { name: "Canyon Park Serenity AFH", address: "20710 13th Dr SE, Bothell WA, 98012", phone: "425-521-0320", fax: "360-939-8003", email: "serenityatcanyonpark@gmail.com" },
            ].map((branch, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border-b-2 border-teal-500">
                <h3 className="text-xl font-medium text-teal-700 mb-2">{branch.name}</h3>
                <p className="text-gray-600 mb-1">{branch.address}</p>
                <p className="text-gray-600 mb-1">📞 {branch.phone}</p>
                <p className="text-gray-600 mb-1">📠 {branch.fax}</p>
                <p className="text-gray-600">✉️ {branch.email}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-teal-700 text-white py-6 px-8 text-center">
        <p>© 2025 Bothell Serenity Corp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BothellSerenityBrochure;