import React, { useState, useEffect } from "react";
import PatientCard from "./PatientCard";
import { fetchPatients } from "./fetchPatients";
import { fetchBranches } from "./fetchBranches";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients(pageNumber, pageSize).then((data) =>
      setPatients(data.responseObject || [])
    );
  }, [pageNumber]);

  useEffect(() => {
    fetchBranches(pageNumber, pageSize).then((data) =>
      setBranches(data.responseObject || [])
    );
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold mb-4">Manage Patients</h2>
      {error && <div className="bg-red-200 text-red-800 p-3 mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(formData).map((key) =>
          key === "file" ? (
            <input
              key={key}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border p-2 rounded w-full"
              required
            />
          ) : key === "branch" ? (
            <select
              key={key}
              name={key}
              value={formData[key]}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select a Branch</option>
              {branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={key}
              type={key === "dateOfBirth" ? "date" : "text"}
              name={key}
              value={formData[key]}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
          )
        )}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit
        </button>
      </form>
      <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <PatientCard key={patient.patientId} patient={patient} />
        ))}
      </div>
    </div>
  );
};

export default Patients;