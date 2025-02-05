// PatientCard.js
import React from "react";
import { FaUserCircle } from "react-icons/fa";

const PatientCard = ({ patient }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {patient.avatar ? (
        <img src={patient.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
      ) : (
        <FaUserCircle className="w-16 h-16 text-gray-400" />
      )}
      <h3 className="font-bold text-lg">{patient.firstName} {patient.middleNames} {patient.lastName}</h3>
      <p className="text-gray-600">DOB: {patient.dateOfBirth}</p>
      <p className="text-gray-600">Diagnosis: {patient.diagnosis}</p>
      <p className="text-gray-600">Physician: {patient.physicianName}</p>
      <p className="text-gray-600">PCP/Doctor: {patient.pcpOrDoctor}</p>
      <p className="text-gray-600">Branch: {patient.branchName}</p>
      <p className="text-gray-600">Room: {patient.room}</p>
      <p className="text-gray-600">Cart: {patient.cart}</p>
    </div>
  );
};

export default PatientCard;