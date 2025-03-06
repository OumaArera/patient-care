import React from 'react';
import bohel from './assets/bothel_ceo.jpg';

const BothellSerenityBrochure = () => {
  return (
    <div className="max-w-7xl mx-auto p-10 bg-gradient-to-b from-blue-900 to-green-700 text-white min-h-screen">
      {/* Header Section */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-green-300 tracking-wide">BOTHELL SERENITY CORP</h1>
        <p className="text-xl text-gray-300 mt-2">Providing Care with Passion</p>
      </header>

      {/* Company Profile */}
      <section className="mb-12 bg-white p-8 rounded-xl shadow-xl text-gray-900">
        <h2 className="text-4xl font-bold text-green-700 mb-6">Company Profile</h2>
        <p className="text-gray-200 leading-relaxed">
          Bothell Serenity Corp stands as a premier provider of home health care
          services dedicated to enhancing the quality of life for clients while
          preserving their independence and dignity. Founded on the
          fundamental belief that every individual deserves compassionate,
          personalized care in the comfort of their own home, our organization has
          established itself as a beacon of excellence in the healthcare industry.
        </p>
        <br />
        <p>
          At the heart of our operations is our unwavering commitment to providing
          exceptional care through a highly trained, skilled staff specifically selected
          to meet each client's unique needs. We recognize that effective home
          health care extends beyond medical assistance-it encompasses
          emotional support, respect for personal autonomy, and the cultivation of
          an environment where clients can thrive.
        </p>
        <br />
        <p>
          Our vision guides us toward becoming the most trusted name in home
          health care, delivering services with genuine passion while ensuring each
          client maintains their independence. This aspiration shapes every
          decision we make and every interaction we have.
        </p>
        <br />
        <p>
          Our balanced approach of professional expertise and genuine human
          connection continues to transform the home health care experience for
          our clients.
        </p>
      </section>

      {/* CEO Message */}
      <section className="relative mb-12 p-12 rounded-xl shadow-xl bg-cover bg-center text-white" style={{ backgroundImage: `url(${bohel})` }}>
        <div className="bg-black bg-opacity-50 p-8 rounded-xl">
          <h2 className="text-4xl font-bold mb-4">Message from the CEO</h2>
          <p className="text-xl italic">
            "We love what we do. We love Healthcare, and helping our clients is our hallmark.
            We aim to make that passion evident in every aspect of our work."
          </p>
          <div className="mt-6 font-extrabold text-green-300 text-xl">Haddy Saho, CEO & Provider</div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mb-12">
        <h2 className="text-4xl font-bold text-green-300 mb-8 text-center">Our Mission & Vision</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-green-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-semibold mb-2">Our Mission</h3>
            <p className="text-lg">To provide exceptional care with compassion, respect, and dignity.</p>
          </div>
          <div className="bg-blue-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-semibold mb-2">Our Vision</h3>
            <p className="text-lg">To become the most trusted home health care service provider.</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-12">
        <h2 className="text-4xl font-bold text-green-300 mb-6 text-center">Our Core Values</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: "Integrity", desc: "Doing the right thing, in the right way, at all times." },
            { title: "Excellence", desc: "Creating an environment of teamwork and participation." },
            { title: "Respect", desc: "We respect the aspirations and commitments of our clients." },
            { title: "Compassion", desc: "Combining professionalism with genuine care." }
          ].map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-gray-900">
              <h3 className="text-2xl font-bold text-green-800">{value.title}</h3>
              <p className="mt-2 text-lg">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Information */}
      <section className="text-center bg-green-900 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-green-300">Contact Us</h2>
        <p className="text-lg">Provider: Haddy Saho</p>
        <p className="text-lg">📞 425-346-9231</p>
        <p className="text-lg">✉️ hadsalo@hotmail.com</p>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-300 text-sm">
        <p>© 2025 Bothell Serenity Corp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BothellSerenityBrochure;







        