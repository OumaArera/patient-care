import React, { useState } from "react";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const URL = "https://patient-care-server.onrender.com/api/v1/vitals"


const UpdateVitals = ({ vital, fetchVitals }) => {
    const [updatedVitals, setUpdatedVitals] = useState({});
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reasonEdited, setReasonEdited] = useState("");

  const handleChange = (field, value) => {
    setUpdatedVitals((prev) => ({ ...prev, [field]: value }));
  };

  const validateBloodPressure = (value) => {
    const regex = /^([2-9]\d{1,2})\/(\d{2,3})$/; 
    return regex.test(value);
  };

  const handleSubmit =async () => {
    if (Object.keys(updatedVitals).length > 0) {
      const payload = { vitalId: vital.vitalId, ...updatedVitals, ...reasonEdited, };
      setLoading(true)
      const updatedUrl = `${URL}/${payload.vitalId}`
      
      try {
        const response = await updateData(updatedUrl, payload);
            
        if (response?.error) {
          setErrors(errorHandler(response?.error));
          setTimeout(() => setErrors([]), 5000);
        } else {
          setMessage("Data updated successfully");
          setReasonEdited("");
          setTimeout(() => fetchVitals(vital.patientId), 5000);
          setTimeout(() => setMessage(""), 5000);
        }
          
      } catch (error) {
        setErrors(["An error occurred. Please try again."]);
        setTimeout(() => setErrors([]), 5000);
      } finally {
        setLoading(false);
      }
      
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">
        Update Vitals for {vital.patientName}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-blue-400">Blood Pressure (Systolic/Diastolic)</label>
          <input
            type="text"
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
            defaultValue={vital.bloodPressure}
            onChange={(e) => handleChange("bloodPressure", e.target.value)}
          />
          {!validateBloodPressure(updatedVitals.bloodPressure || vital.bloodPressure) && (
            <p className="text-red-500 text-sm">Invalid format (e.g., 120/80)</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-blue-400">Temperature (°F)</label>
          <input
            type="number"
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
            defaultValue={vital.temperature}
            min="1"
            onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm text-blue-400">Pulse</label>
          <input
            type="number"
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
            defaultValue={vital.pulse}
            min="1"
            onChange={(e) => handleChange("pulse", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm text-blue-400">Oxygen Saturation (%)</label>
          <input
            type="number"
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
            defaultValue={vital.oxygenSaturation}
            min="1"
            onChange={(e) => handleChange("oxygenSaturation", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm text-blue-400">Pain Description</label>
          <textarea
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
            defaultValue={vital.pain || ""}
            onChange={(e) => handleChange("pain", e.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-lg text-blue-400">Reason for Editing:</label>
          <textarea
            value={reasonEdited}
            onChange={(e) => setReasonEdited(e.target.value)}
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
            placeholder="Enter reason for editing..."
            required
          />
          </div>
        {errors.length > 0 && (
          <div className="mb-4 p-3 rounded">
            {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
          )}
        {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
        <button
          onClick={handleSubmit}
          className={`px-6 py-3 rounded-lg flex items-center justify-center w-full mt-4
            ${Object.keys(updatedVitals).length === 0 || !reasonEdited ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}
          `}
          disabled={Object.keys(updatedVitals).length === 0 || !reasonEdited}
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default UpdateVitals;