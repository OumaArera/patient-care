import React, { useState } from "react";
import { errorHandler } from "../services/errorHandler";
import UpdateMedication from "./UpdateMedication";
const URL ="https://patient-care-server.onrender.com/api/v1/medications";


const MedicationCard = ({ medication, handleMedication }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [showResubmit, setShowResubmit] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    if (!token || !status) return;
    setLoading(true);

    try {
      const response = await fetch(`${URL}/${medication.medicationId}`, {
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({status})
      })

      const data = await response.json();

      if (!response.ok){
        setErrors(errorHandler(data?.responseObject?.errors));
        setTimeout(() => setErrors([]), 10000);
      }else{
        setMessage("Status changed successfully");
        setTimeout(() => setMessage(""), 2000);
        handleMedication()
      }
      
    } catch (error) {
      setErrors(errorHandler(`An error occured. Please try again`));
      setTimeout(() => setErrors([]), 10000);
    } finally{
      setLoading(false);
    }
  };

  const closeResubmitModal = () => {
    setShowResubmit(false);
};

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
      <h3 className="text-xl font-bold text-blue-400">{medication.medicationName}</h3>
      <p className="text-sm">Code: {medication.medicationCode}</p>
      <p className="text-sm">Equivalent To: {medication.equivalentTo}</p>
      <p className="text-sm">Instructions: {medication.instructions}</p>
      <p className="text-sm">Quantity: {medication.quantity}</p>
      <p className="text-sm">Diagnosis: {medication.diagnosis}</p>
      
      <p className="text-sm font-semibold mt-2">
        Status: <span className={`px-2 py-1 rounded text-xs font-bold ${
          medication.status === "active" ? "bg-green-500 text-white" :
          medication.status === "paused" ? "bg-yellow-500 text-gray-900" :
          medication.status === "removed" ? "bg-red-500 text-white" : ""
        }`}>
          {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
        </span>
      </p>

      <div className="mt-2">
        <p className="text-sm font-semibold">Times:</p>
        {medication.instructions === "PRN" ? (
          <p className="text-sm text-gray-300">As Instructed</p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-1">
            {medication.medicationTime.map((time, index) => {
              const [hours, minutes] = time.split(":");
              const formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              return (
                <div key={index} className="bg-gray-700 text-white px-3 py-1 rounded-md text-xs shadow">
                  {formattedTime}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-sm font-semibold text-green-400 mt-2">
        Resident: {medication.patientFirstName} {medication.patientLastName}
      </p>
      <button
        onClick={() => setShowResubmit(true)}
        className="mt-2 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Update
      </button>

      {/* Modify Medication Status */}
      <div className="mt-4">
        <label className="text-sm font-semibold">Modify Medication Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-gray-700 text-white p-2 rounded mt-1"
        >
          <option value="">Select status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="removed">Removed</option>
        </select>
        <button
          onClick={handleSubmit}
          className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!status}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-white rounded">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
        )}
        {message && <p className="text-green-600">{message}</p>}
      </div>
      {showResubmit && (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            onClick={closeResubmitModal}
        >
            <div
                className="bg-gray-800 p-6 rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-white mb-4">Update Medication</h3>
                <UpdateMedication
                    medication={medication}
                    onUpdate={handleMedication}
                />
                <button
                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
                    onClick={closeResubmitModal}
                >
                    Close
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MedicationCard;
