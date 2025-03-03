import { useState, useEffect } from "react";
import { fetchBranches } from "../services/fetchBranches";
import { fetchFacilities } from "../services/fetchFacilities";
import { errorHandler } from "../services/errorHandler";
import { updateData } from "../services/updatedata";

const URL = "https://patient-care-server.onrender.com/api/v1/branches"

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
  const [editingBranch, setEditingBranch] = useState(null);
  const [editedBranchName, setEditedBranchName] = useState("");
  const [editedBranchAddress, setEditedBranchAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchFacilities(pageNumber, pageSize).then((data) => setFacilities(data.responseObject || []));
  }, [pageNumber]);

  const getBranches =()=>{
    fetchBranches(pageNumber, pageSize).then((data) => setBranches(data.responseObject || []));
  }

  useEffect(() => {
    getBranches()
  }, [pageNumber]);

  const handleEditClick = (branch) => {
    setEditingBranch(branch);
    setEditedBranchName(branch.branchName);
    setEditedBranchAddress(branch.branchAddress);
  };

  const handleSave = async () => {
    const updatedFields = {}; // No branchId here
  
    if (editedBranchName !== editingBranch.branchName) {
        updatedFields.branchName = editedBranchName;
    }

    if (editedBranchAddress !== editingBranch.branchAddress) {
        updatedFields.branchAddress = editedBranchAddress;
    }

    if (Object.keys(updatedFields).length > 0) { 
        setLoading(true);
        const updateURL = `${URL}/${editingBranch.branchId}`;
        console.log("URL: ", updateURL);

        try {
            console.log("Data Sent: ", updatedFields); // Debugging log
            const response = await updateData(updateURL, updatedFields);
            
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Data updated successfully");
                setTimeout(() => getBranches(), 7000);
                setTimeout(() => setMessage(""), 7000);
            }
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setLoading(false);
        }
    } else {
        setErrors(["No changes made."]);
        setTimeout(() => setErrors([]), 5000);
    }
  };

  

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
        setErrors(errorHandler(errorString));
        setTimeout(() => setErrors([]));
      }
    } catch (error) {
      setErrors(["An error occurred. Please try again."]);
      setTimeout(() => setErrors([]));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setErrors([]), 5000);
    }
  };
  const closeBranchModal = () => {
    setEditingBranch(null);
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
          <div className="mb-4 p-3 rounded">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
        )}
      {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
      </form>

      <h2 className="text-2xl font-bold mb-4 text-blue-400">Branches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.length > 0 ? (
          branches.map((branch) => (
            <div key={branch.branchId} className="border p-4 rounded-lg shadow-md bg-gray-800 text-white">
              <h3 className="font-semibold text-blue-300">{branch.branchName}</h3>
              <p className="text-gray-400">{branch.branchAddress}</p>
              <p className="text-gray-500">Facility: {branch.facilityName}</p>
              <button 
                onClick={() => handleEditClick(branch)} 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-3 hover:bg-blue-600"
              >Edit</button>
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
      {editingBranch && (
        <div
        className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={closeBranchModal}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-blue-400 mb-4">Edit Branch</h3>
            <label className="block text-gray-300 font-semibold mb-1">Branch Name</label>
            <input
              type="text"
              value={editedBranchName}
              onChange={(e) => setEditedBranchName(e.target.value)}
              className="border p-2 w-full rounded bg-gray-700 text-white"
            />

            <label className="block text-gray-300 font-semibold mb-1 mt-3">Branch Address</label>
            <input
              type="text"
              value={editedBranchAddress}
              onChange={(e) => setEditedBranchAddress(e.target.value)}
              className="border p-2 w-full rounded bg-gray-700 text-white"
            />
            {errors.length > 0 && (
              <div className="mb-4 p-3 rounded">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">{error}</p>
                ))}
              </div>
            )}
          {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}

            <div className="flex justify-between mt-4">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" 
                onClick={handleSave}>{loading ? "Saving..." : "Save Changes"}</button>
              <button 
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600" 
                onClick={closeBranchModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
