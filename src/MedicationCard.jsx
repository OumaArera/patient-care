import React, { useState } from "react";

const MedicationCard = ({ medication }) => {
  const [status, setStatus] = useState("");

  const handleSubmit = () => {
    console.log(`Medication ID: ${medication.medicationId}, New Status: ${status}`);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
      <h3 className="text-xl font-bold text-blue-400">{medication.medicationName}</h3>
      <p className="text-sm">Code: {medication.medicationCode}</p>
      <p className="text-sm">Equivalent To: {medication.equivalentTo}</p>
      <p className="text-sm">Instructions: {medication.instructions}</p>
      <p className="text-sm">Quantity: {medication.quantity}</p>
      <p className="text-sm">Diagnosis: {medication.diagnosis}</p>

      <div className="mt-2">
        <p className="text-sm font-semibold">Times:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {medication.medicationTime.map((time, index) => {
            const [hours, minutes] = time.split(":");
            const formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            return (
              <div
                key={index}
                className="bg-gray-700 text-white px-3 py-1 rounded-md text-xs shadow"
              >
                {formattedTime}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm font-semibold text-green-400 mt-2">
        Resident: {medication.patientFirstName} {medication.patientLastName}
      </p>

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
          Submit
        </button>
      </div>
    </div>
  );
};

export default MedicationCard;
