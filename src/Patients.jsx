import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { fetchBranches } from "../services/fetchBranches";
import PatientCard from "./PatientsCard";
import { errorHandler } from "../services/errorHandler";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    middleNames: "",
    lastName: "",
    dateOfBirth: "",
    diagnosis: "",
    allergies: "",
    physicianName: "",
    pcpOrDoctor: "",
    branch: "",
    room: "",
    cart: "",
    file: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 3;

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const displayedPatients = patients.slice(startIndex, endIndex);

  // Fetch patients when pageNumber or pageSize changes
  
  const getPatients =() =>{
    setLoading(true);
    fetchPatients(pageNumber, pageSize)
      .then((data) => {
        setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch patients.");
        setLoading(false);
      });
  }
  useEffect(() => {
    getPatients()
  }, [pageNumber, pageSize]);

  // Fetch branches only once
  useEffect(() => {
    fetchBranches(pageNumber, pageSize)
      .then((data) => {
        setBranches(Array.isArray(data.responseObject) ? data.responseObject : []);
      })
      .catch(() => setError("Failed to fetch branches."));
  }, []);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true); 
    setSuccessMessage("");
    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(
        "https://patient-care-server.onrender.com/api/v1/patients",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        }
      );
      const result = await response.json();
      if (!response.ok) setErrors(errorHandler(result?.responseObject?.errors));
      setPatients([...patients, result.responseObject]);
      setSuccessMessage("Resident added successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
      setFormData({
        firstName: "",
        middleNames: "",
        lastName: "",
        dateOfBirth: "",
        diagnosis: "",
        allergies: "",
        physicianName: "",
        pcpOrDoctor: "",
        branch: "",
        room: "",
        cart: "",
        file: null,
      });
    } catch (err) {
      setError(Array.isArray(err.message) ? err.message.join(", ") : err.message);
    } finally {
      setSubmitting(false); 
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6 text-blue-400">Manage Residents</h2>
      {error && <div className="bg-red-500 text-white p-3 mb-3 rounded">{error}</div>}
      {successMessage && <div className="bg-green-500 text-white p-3 mb-3 rounded">{successMessage}</div>}
      {loading && <div className="bg-yellow-500 text-white p-3 mb-3 rounded">Fetching data...</div>}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md grid gap-4">
        {Object.keys(formData).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm mb-1 capitalize" htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
            {key === "file" ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border p-2 rounded w-full bg-gray-700 text-white"
              />
            ) : key === "middleNames" ? (
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  placeholder={`Enter ${key}`}
                  className="border p-2 rounded w-full bg-gray-700 text-white"
                />
            ) : key === "branch" ? (
              <select
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
                className="border p-2 rounded w-full bg-gray-700 text-white"
                required
              >
                <option value="">Select a Branch</option>
                {branches.map((branch) => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            ) : key === "diagnosis" || key === "allergies" ? (
              <textarea
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
                rows="4"
                placeholder={`Enter ${key}`}
                className="border p-2 rounded w-full bg-gray-700 text-white"
              ></textarea>
            ) : (
              <input
                type={key === "dateOfBirth" ? "date" : "text"}
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
                placeholder={`Enter ${key}`}
                className="border p-2 rounded w-full bg-gray-700 text-white"
                required
              />
            )}
          </div>
        ))}
        <button type="submit" className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
        {errors.length > 0 && (
          <div className="mb-4 p-3 rounded">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
        )}
      </form>
      
      <div>
        <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {displayedPatients.length > 0 ? (
            displayedPatients.map((patient) => (
              <PatientCard key={patient.patientId} patient={patient} getPatients={getPatients} />
            ))
          ) : (
            <p className="text-gray-400">No residents found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-600 px-4 py-2 rounded text-white disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => (endIndex < patients.length ? prev + 1 : prev))}
            disabled={endIndex >= patients.length}
            className="bg-blue-500 px-4 py-2 rounded text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Patients;
