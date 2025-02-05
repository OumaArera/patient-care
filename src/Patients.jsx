import React, { useState, useEffect } from "react";
import { fetchPatients } from "./fetchPatients";
import { fetchBranches } from "./fetchBranches";
import PatientCard from "./PatientsCard";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [error, setError] = useState("");
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

  useEffect(() => {
    fetchPatients(pageNumber, pageSize).then((data) => {
      setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
    }).catch(() => setError("Failed to fetch patients."));
  }, [pageNumber]);

  useEffect(() => {
    fetchBranches(pageNumber, pageSize).then((data) => {
      setBranches(Array.isArray(data.responseObject) ? data.responseObject : []);
    }).catch(() => setError("Failed to fetch branches."));
  }, [pageNumber]);

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
    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
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
      if (!result.successful) throw new Error(result.responseObject.errors);
      setPatients([...patients, result.responseObject]);
    } catch (err) {
      setError(Array.isArray(err.message) ? err.message.join(", ") : err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6 text-blue-400">Manage Patients</h2>
      {error && <div className="bg-red-500 text-white p-3 mb-3 rounded">{error}</div>}
      
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
                required
              />
            ):key === "middleNames" ? (
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
                required
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
        <button type="submit" className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 w-full">
          Submit
        </button>
      </form>
      
      <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {patients.length > 0 ? (
          patients.map((patient) => <PatientCard key={patient.patientId} patient={patient} />)
        ) : (
          <p className="text-gray-400">No patients found.</p>
        )}
      </div>
    </div>
  );
};

export default Patients;
