import { useState, useEffect } from "react";
import { fetchFacilities } from "./fetchFacilities";
import { fetchBranches } from "./fetchBranches";

const isValidAddress = (address) => {
  return /\d{1,5}\s\w+(\s\w+)*,\s\w+,\s[A-Z]{2}\s\d{5}/.test(address);
};

const Branches = () => {
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [message, setMessage] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const pageSize = 10;

  useEffect(() => {
    fetchFacilities(pageNumber, pageSize).then((data) => setFacilities(data.responseObject || []));
  }, [pageNumber]);

  useEffect(() => {
    fetchBranches(pageNumber, pageSize).then((data) => setBranches(data.responseObject || []));
  }, [pageNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidAddress(branchAddress)) return;

    setIsSubmitting(true);
    setMessage("");
    setErrors([]);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("https://patient-care-server.onrender.com/api/v1/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ branchName, branchAddress, facility: facilityId }),
      });
      const result = await response.json();

      if (response.ok) {
        setBranchName("");
        setBranchAddress("");
        setMessage("Branch added successfully!");
        setErrors([]);
        fetchBranches(pageNumber, pageSize).then((data) => setBranches(data.responseObject || []));
      } else {
        let errorString = result?.responseObject?.errors;

        let parsedErrors = [];
        if (typeof errorString === "string") {
            try {
                parsedErrors = JSON.parse(errorString.replace(/'/g, '"'));
            } catch (parseError) {
                console.log("JSON Parse Error:", parseError);
                parsedErrors = [errorString]; // If parsing fails, use as-is
            }
        } else if (Array.isArray(errorString)) {
        parsedErrors = errorString;
        } else {
        parsedErrors = ["An unknown error occurred."];
        }
        setErrors(parsedErrors);
      }
    } catch (error) {
      setErrors(["An error occurred. Please try again."]);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setErrors([]), 5000);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Add New Branch</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-md bg-gray-800">
        <div className="mb-4">
          <label className="block text-gray-300 font-semibold mb-1">Branch Name</label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="border p-2 w-full rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 font-semibold mb-1">Branch Address</label>
          <input
            type="text"
            placeholder="123 Main St, Springfield, IL 62704"
            value={branchAddress}
            onChange={(e) => setBranchAddress(e.target.value)}
            className={`border p-2 w-full rounded bg-gray-700 text-white ${
              branchAddress && isValidAddress(branchAddress) ? "border-green-500" : "border-red-500"
            }`}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 font-semibold mb-1">Facility</label>
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="border p-2 w-full rounded bg-gray-700 text-white"
            required
          >
            <option value="">Select Facility</option>
            {facilities.map((facility) => (
              <option key={facility.facilityId} value={facility.facilityId}>
                {facility.facilityName}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 disabled:opacity-50"
          disabled={!branchName || !isValidAddress(branchAddress) || !facilityId || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Add Branch"}
        </button>
        {errors.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-300 text-white rounded">
          {errors.map((error, index) => (
            <p key={index} className="text-sm">⚠ {error}</p>
          ))}
          {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
        </div>
      )}
      </form>

      <h2 className="text-2xl font-bold mb-4 text-blue-400">Branches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.length > 0 ? (
          branches.map((branch) => (
            <div key={branch.branchId} className="border p-4 rounded-lg shadow-md bg-gray-800 text-white">
              <h3 className="font-semibold text-blue-300">{branch.branchName}</h3>
              <p className="text-gray-400">{branch.branchAddress}</p>
              <p className="text-gray-500">Facility: {branch.facilityName}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No branches found</p>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <button onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))} className="bg-gray-700 px-4 py-2 rounded">Previous</button>
        <span className="font-semibold text-blue-300">Page {pageNumber}</span>
        <button onClick={() => setPageNumber((prev) => prev + 1)} className="bg-gray-700 px-4 py-2 rounded">Next</button>
      </div>
    </div>
  );
};

export default Branches;
