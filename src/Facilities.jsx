import { useState, useEffect } from "react";
import { fetchFacilities } from "./fetchFacilities";

const Facilities = () => {
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
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

  // Validate Facility Name Format
  const isValidFacilityName = (name) => {
    return /^[A-Za-z0-9\s&]+$/.test(name); // Allow letters, numbers, spaces, and "&"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "https://patient-care-server.onrender.com/api/v1/facilities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            facilityName,
            facilityAddress,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage("Facility added successfully!");
        setFacilityName("");
        setFacilityAddress("");
        loadFacilities(); // Refresh the list
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add New Facility</h2>
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-md bg-white">
        {/* Facility Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Facility Name</label>
          <input
            type="text"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            className={`border p-2 w-full rounded ${
              facilityName
                ? isValidFacilityName(facilityName)
                  ? "border-green-500"
                  : "border-red-500"
                : "border-gray-300"
            }`}
            required
          />
          {facilityName && (
            <p className={`text-sm mt-1 ${isValidFacilityName(facilityName) ? "text-green-600" : "text-red-600"}`}>
              {isValidFacilityName(facilityName)
                ? "✅ Format looks good!"
                : "⚠️ Only letters, numbers, spaces, and '&' are allowed."}
            </p>
          )}
        </div>

        {/* Facility Address Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Facility Address</label>
          <input
            type="text"
            placeholder="123 Main St, Springfield, IL 62704"
            value={facilityAddress}
            onChange={(e) => setFacilityAddress(e.target.value)}
            className="border p-2 w-full rounded border-gray-300"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Add Facility"}
        </button>

        {/* Success/Error Message */}
        {message && <p className="mt-3 text-center font-medium">{message}</p>}
      </form>

      {/* Facilities List */}
      <h2 className="text-2xl font-bold mb-4">Facilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.length > 0 ? (
          facilities.map((facility) => (
            <div key={facility.facilityId} className="border p-4 rounded-lg shadow-md bg-white">
              <h3 className="font-semibold">{facility.facilityName}</h3>
              <p className="text-gray-600">{facility.facilityAddress}</p>
            </div>
          ))
        ) : (
          <p>No facilities found</p>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber === 1}
          className="bg-gray-300 px-4 py-2 disabled:opacity-50 rounded"
        >
          Previous
        </button>
        <span className="font-semibold">Page {pageNumber}</span>
        <button
          onClick={() => setPageNumber((prev) => prev + 1)}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Facilities;
