  // MedicationCard.jsx
  import React from "react";
  
  const MedicationCard = ({ medication }) => {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
        <h3 className="text-xl font-bold text-blue-400">{medication.medicationName}</h3>
        <p className="text-sm">Code: {medication.medicationCode}</p>
        <p className="text-sm">Equivalent To: {medication.equivalentTo}</p>
        <p className="text-sm">Instructions: {medication.instructions}</p>
        <p className="text-sm">Quantity: {medication.quantity}</p>
        <p className="text-sm">Diagnosis: {medication.diagnosis}</p>
        <p className="text-sm">Time: {medication.medicationTime}</p>
        <p className="text-sm">Time: {medication.medicationTime.map((time, index) => {
              const [hours, minutes] = time.split(":");
              const formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
              });
              return (
                  <span key={index} className="block">
                      {formattedTime}
                  </span>
              );
          })}
        </p>
        <p className="text-sm font-semibold text-green-400">
          Resident: {medication.patientFirstName} {medication.patientLastName}
        </p>
      </div>
    );
  };
  
  export default MedicationCard;