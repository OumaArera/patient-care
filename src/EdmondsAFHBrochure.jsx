import React from 'react';
import bohel from './assets/bothel_ceo.jpg';

const EdmondsAFHBrochure = () => {
  return (
    <div className="max-w-6xl mx-auto bg-white text-gray-800">
      {/* Header Section */}
      <div className="bg-teal-700 text-white py-10 px-8">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold tracking-wide">1ST EDMONDS AFH LLC</h1>
          <p className="text-lg text-teal-100 italic mt-2">Providing Care with Passion</p>
        </header>
      </div>

      <div className="p-8">
        {/* Company Profile */}
        <section className="mb-12 bg-white p-8 rounded-lg shadow-md border-l-4 border-teal-700">
          <h2 className="text-3xl font-semibold text-teal-800 mb-4 pb-2 border-b border-teal-200 text-center">Company Profile</h2>
          <p className="text-gray-700 leading-relaxed">
            1st Edmonds AFH is a dedicated home healthcare service provider
            committed to delivering personalized care services that promote client
            independence and dignity. We have established ourselves as a
            compassionate care provider that prioritizes the unique needs of each
            individual client.
          </p>
          <br />
          <p className="text-gray-700 leading-relaxed">
            At 1st Edmonds AFH, we understand that every client has different needs,
            abilities, and preferences. Our care-giving philosophy centers around
            tailoring our services to fit these individual requirements, rather than
            offering one-size-fits-all solutions. This client-centered approach is
            reflected in our commitment to providing appropriate training and skills
            development for our staff members.
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
        <section className="relative mb-12 bg-cover bg-center rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <img src={bohel} alt="CEO" className="w-full h-64 md:h-80 object-cover" />
            <div className="absolute inset-0 bg-teal-900 bg-opacity-75"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Message from the CEO</h2>
              <p className="text-xl italic text-white">
                "Our clients feelings and needs
                are important and we take into
                consideration every step of the
                way to make sure we understand
                how best to serve them".
              </p>
              <div className="mt-4 text-teal-100 font-semibold text-lg">Abdoullie Lowe, CEO & Provider</div>
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
                To provide exceptional care with compassion, respect,
                and dignity by providing appropriate training and skills
                for our staff that fit our client's needs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-teal-700">
              <h3 className="text-2xl font-medium text-teal-700 mb-3">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become the most trusted home health care
                service provider by providing care with passion and
                ensuring independence for every client.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-teal-800 mb-6 text-center">Our Core Values</h2>
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
          <h2 className="text-3xl font-semibold text-teal-800 mb-6 text-center">Our Branches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "1st Edmonds AFH", address: "22416 80th Ave, Edmonds, 98026", phone: "425-521-1070", fax: "425-491-7499", email: "1stedmondafh@gmail.com" },
              { name: "1st Edmond - Filbert Rd AFH", address: "20124 Filbert Road House", phone: "425-286-6679", fax: "425-892-7391", email: "williamserenity4@gmail.com" },
              { name: "1st Edmond - Best Care Harbour Pointe- Mukilteo", address: "10820 53rd Ave W, Mukilteo WA, 98275", phone: "425-531-4916", fax: "425-491-7499", email: "bestcareharbourpointeafh@gmail.com" },
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
        <p>© 2025 1st Edmonds AFH LLC. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default EdmondsAFHBrochure;