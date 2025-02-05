import { useState, useEffect } from "react";
import { fetchFacilities } from "./fetchFacilities";

const Facilities = () => {
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

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

    if (response.ok) {
      alert("Facility added successfully!");
      setFacilityName("");
      setFacilityAddress("");
      loadFacilities(); // Refresh the list
    } else {
      alert("Failed to add facility");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Add New Facility</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Facility Name"
          value={facilityName}
          onChange={(e) => setFacilityName(e.target.value)}
          className="border p-2 mr-2 w-full md:w-auto"
          required
        />
        <input
          type="text"
          placeholder="123 Main St, Springfield, IL 62704"
          value={facilityAddress}
          onChange={(e) => setFacilityAddress(e.target.value)}
          className="border p-2 mr-2 w-full md:w-auto"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Add Facility
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4">Facilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.length > 0 ? (
          facilities.map((facility) => (
            <div key={facility.facilityId} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{facility.facilityName}</h3>
              <p>{facility.facilityAddress}</p>
            </div>
          ))
        ) : (
          <p>No facilities found</p>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber === 1}
          className="bg-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {pageNumber}</span>
        <button
          onClick={() => setPageNumber((prev) => prev + 1)}
          className="bg-gray-300 px-4 py-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Facilities;
