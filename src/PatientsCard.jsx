import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const PatientCard = ({ patient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState({ ...patient });
  const [removeResident, setRemoveResident] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient({ ...editedPatient, [name]: value });
  };

  const handleCheckboxChange = () => {
    setRemoveResident(!removeResident);
  };

  const handleSubmit = () => {
    const updatedData = { ...editedPatient, status: removeResident ? true : false };
    console.log("Payload", updatedData);
    // setIsEditing(false);
  };



  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center space-y-4 transition-transform transform hover:scale-105 relative">
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-700">
        <FaUserCircle className="w-16 h-16 text-gray-500" />
      </div>

      <div className="text-center">
        <h3 className="font-bold text-xl text-blue-400">{patient.firstName} {patient.middleNames} {patient.lastName}</h3>
        <p className="text-gray-400 text-sm">DOB: {patient.dateOfBirth}</p>
      </div>

      <div className="w-full bg-gray-700 p-4 rounded-lg text-sm space-y-2">
        <div>
          <span className="text-gray-400 font-semibold">Diagnosis:</span>
          <p className="text-blue-300 text-right">{patient.diagnosis}</p>
        </div>
        <div>
          <span className="text-gray-400 font-semibold">Physician:</span>
          <p className="text-blue-300 text-right">{patient.physicianName}</p>
        </div>
        <div>
          <span className="text-gray-400 font-semibold">PCP/Doctor:</span>
          <p className="text-blue-300 text-right">{patient.pcpOrDoctor}</p>
        </div>
        <div>
          <span className="text-gray-400 font-semibold">Branch:</span>
          <p className="text-blue-300 text-right">{patient.branchName}</p>
        </div>
      </div>

      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-3 hover:bg-blue-600"
        onClick={() => setIsEditing(true)}
      >
        Edit
      </button>

      {/* Overlay Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Edit Patient</h3>

            <div className="grid gap-3">
              <label className="block">
                <span className="text-gray-300">First Name:</span>
                <input 
                  type="text" 
                  name="firstName" 
                  value={editedPatient.firstName} 
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </label>

              <label className="block">
                <span className="text-gray-300">Middle Name:</span>
                <input 
                  type="text" 
                  name="middleNames" 
                  value={editedPatient.middleNames} 
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </label>

              <label className="block">
                <span className="text-gray-300">Last Name:</span>
                <input 
                  type="text" 
                  name="lastName" 
                  value={editedPatient.lastName} 
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </label>

              <label className="block">
                <span className="text-gray-300">Diagnosis:</span>
                <input 
                  type="text" 
                  name="diagnosis" 
                  value={editedPatient.diagnosis} 
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </label>

              <label className="block">
                <span className="text-gray-300">Physician:</span>
                <input 
                  type="text" 
                  name="physicianName" 
                  value={editedPatient.physicianName} 
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </label>

              <label className="block">
                <span className="text-gray-300">PCP/Doctor:</span>
                <input 
                  type="text" 
                  name="pcpOrDoctor" 
                  value={editedPatient.pcpOrDoctor} 
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </label>

              <label className="block">
                <span className="text-gray-300">Branch:</span>
                <input 
                  type="text" 
                  name="branchName" 
                  value={editedPatient.branchName} 
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </label>

              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={removeResident} 
                  onChange={handleCheckboxChange}
                  className="h-5 w-5"
                />
                <span className="text-red-500 font-bold">Remove Resident</span>
              </label>

              <div className="flex justify-between mt-4">
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  onClick={handleSubmit}
                >
                  Save Changes
                </button>
                <button 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCard;
