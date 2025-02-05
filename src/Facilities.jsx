import { useState, useEffect } from "react";
import { fetchFacilities } from "./fetchFacilities";

const Facilities = () => {
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showAddressExample, setShowAddressExample] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    loadFacilities();
  }, [pageNumber]);

  const loadFacilities = async () => {
    const data = await fetchFacilities(pageNumber, pageSize);
    if (data && data.successful) {
      setFacilities(data.responseObject);
    }
  };

  const isValidFacilityName = (name) => {
    return /^[A-Za-z0-9\s&]+$/.test(name);
  };

  const isValidUSAddress = (address) => {
    return /\d{1,5}\s[A-Za-z0-9\s]+,\s[A-Za-z\s]+,\s[A-Z]{2}\s\d{5}/.test(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token || !isValidFacilityName(facilityName) || !isValidUSAddress(facilityAddress)) return;

    const facility = {
      facilityName: facilityName,
      facilityAddress: facilityAddress,
    };

    try {
      const response = await fetch(
        "https://patient-care-server.onrender.com/api/v1/facilities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(facility),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setMessage("Facility added successfully!");
        setFacilityName("");
        setFacilityAddress("");
        loadFacilities();
      } else {
        setMessage(result.statusMessage || "Failed to add facility");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Add New Facility</h2>
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-md bg-gray-800">
        <div className="mb-4">
          <label className="block text-gray-300 font-semibold mb-1">Facility Name</label>
          <input
            type="text"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            className={`border p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 ${
              facilityName && !isValidFacilityName(facilityName) ? "border-red-500" : "border-gray-500"
            }`}
            placeholder="Enter facility name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 font-semibold mb-1">Facility Address</label>
          <input
            type="text"
            value={facilityAddress}
            onChange={(e) => {
              setFacilityAddress(e.target.value);
              setShowAddressExample(true);
            }}
            className={`border p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 ${
              facilityAddress && !isValidUSAddress(facilityAddress) ? "border-red-500" : "border-gray-500"
            }`}
            placeholder="123 Main St, Springfield, IL 62704"
            required
          />
          {showAddressExample && !isValidUSAddress(facilityAddress) && (
            <p className="text-red-400 text-sm mt-1">Example: 123 Main St, Springfield, IL 62704</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full p-3 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg"
          disabled={!facilityName || !facilityAddress || !isValidFacilityName(facilityName) || !isValidUSAddress(facilityAddress) || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Add Facility"}
        </button>

        {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
      </form>

      <h2 className="text-2xl font-bold mb-4 text-blue-400">Facilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.length > 0 ? (
          facilities.map((facility) => (
            <div key={facility.facilityId} className="border p-4 rounded-lg shadow-md bg-gray-800 text-white">
              <h3 className="font-semibold text-blue-300">{facility.facilityName}</h3>
              <p className="text-gray-400">{facility.facilityAddress}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No facilities found</p>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber === 1}
          className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="font-semibold text-blue-300">Page {pageNumber}</span>
        <button
          onClick={() => setPageNumber((prev) => prev + 1)}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Facilities;
