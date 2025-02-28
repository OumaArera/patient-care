import React, { useState } from "react";
import { errorHandler } from "../services/errorHandler";

const UpdateMedication = ({ medication, onUpdate }) => {
  const [formData, setFormData] = useState({
    medicationName: medication.medicationName,
    medicationCode: medication.medicationCode,
    equivalentTo: medication.equivalentTo,
    quantity: medication.quantity,
    diagnosis: medication.diagnosis,
    medicationTime: medication.medicationTime,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const token = localStorage.getItem("token");
  const URL = `http://127.0.0.1:8000/api/v1/medications/${medication.medicationId}`;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle time input changes
  const handleTimeChange = (index, value) => {
    const updatedTimes = [...formData.medicationTime];
    updatedTimes[index] = value;
    setFormData((prev) => ({ ...prev, medicationTime: updatedTimes }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);
    setMessage("");

    try {
      const response = await fetch(URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(errorHandler(data?.responseObject?.errors || "Update failed"));
        setTimeout(() => setErrors([]), 10000);
      } else {
        setMessage("Medication updated successfully!");
        setTimeout(() => setMessage(""), 2000);
        onUpdate();
      }
    } catch (error) {
      setErrors(["An error occurred. Please try again."]);
      setTimeout(() => setErrors([]), 10000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-blue-400 mb-4">Update Medication</h2>

      <label className="block text-sm font-semibold">Medication Name</label>
      <input
        type="text"
        name="medicationName"
        value={formData.medicationName}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white p-2 rounded mt-1 mb-3"
      />

      <label className="block text-sm font-semibold">Medication Code</label>
      <input
        type="text"
        name="medicationCode"
        value={formData.medicationCode}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white p-2 rounded mt-1 mb-3"
      />

      <label className="block text-sm font-semibold">Equivalent To</label>
      <input
        type="text"
        name="equivalentTo"
        value={formData.equivalentTo}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white p-2 rounded mt-1 mb-3"
      />

      <label className="block text-sm font-semibold">Quantity</label>
      <input
        type="text"
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white p-2 rounded mt-1 mb-3"
      />

      <label className="block text-sm font-semibold">Diagnosis</label>
      <textarea
        name="diagnosis"
        value={formData.diagnosis}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white p-2 rounded mt-1 mb-3"
      />

      <label className="block text-sm font-semibold">Medication Times</label>
      <div className="flex flex-col gap-2 mt-1 mb-3">
        {formData.medicationTime.map((time, index) => (
          <input
            key={index}
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(index, e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        ))}
      </div>

      <p className="text-sm font-semibold text-green-400 mt-2">
        Resident: {medication.patientFirstName} {medication.patientLastName}
      </p>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? "Updating..." : "Submit"}
      </button>

      {/* Error & Success Messages */}
      {errors.length > 0 && (
        <div className="mt-3 p-3 bg-white rounded">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}
      {message && <p className="mt-3 text-green-500">{message}</p>}
    </div>
  );
};

export default UpdateMedication;
