import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const URL = `${BASE_URL}/patients`;

const PatientCard = ({ patient, getPatients }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState({ ...patient });
  const [removeResident, setRemoveResident] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient({ ...editedPatient, [name]: value });
  };

  const handleCheckboxChange = () => {
    setRemoveResident(!removeResident);
  };

  const handleSubmit = async () => {
    const updatedData = { patientId: patient.patientId };
  
    Object.keys(editedPatient).forEach((key) => {
      if (editedPatient[key] !== patient[key]) {
        updatedData[key] = editedPatient[key];
      }
    });
  
    if (removeResident) {
      updatedData.active = false;
    }
    setLoading(true);
    const updateURL = `${URL}/${updatedData.patientId}`;

    try {
      const response = await updateData(updateURL, updatedData);
      
      if (response?.error) {
        setErrors(errorHandler(response?.error));
        setTimeout(() => setErrors([]), 5000);
      } else {
        setMessage("Data updated successfully");
        setTimeout(() => setMessage(""), 7000);
        getPatients()
      }
    } catch (error) {
      setErrors(["An error occurred. Please try again."]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  const closeResidentModal = () => {
    setIsEditing(false);
  };



  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center space-y-4 transition-transform transform hover:scale-105 relative">
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-700">
        <FaUserCircle className="w-16 h-16 text-gray-500" />
      </div>

      <div className="text-center">
        <h3 className="font-bold text-xl text-blue-400">{patient.firstName} {patient.middleNames} {patient.lastName}</h3>
        <p className="text-gray-400 text-sm">
          DOB: {new Date(patient.dateOfBirth + "T00:00:00").toLocaleDateString("en-US")}</p>
      </div>

      <div className="w-full bg-gray-700 p-4 rounded-lg text-sm space-y-2">
        <div>
          
          <p className="text-blue-300">
            <span className="text-gray-400 font-semibold">Diagnosis: </span>
            {patient.diagnosis}
          </p>
        </div>
        <div>
          <p className="text-blue-300">
            <span className="text-gray-400 font-semibold">Physician: </span>
            {patient.physicianName}
            </p>
        </div>
        <div>
          <p className="text-blue-300">
            <span className="text-gray-400 font-semibold">PCP/Doctor: </span>
            {patient.pcpOrDoctor}
            </p>
        </div>
        <div>
          <p className="text-blue-300">
            <span className="text-gray-400 font-semibold">Branch: </span>
            {patient.branchName}
          </p>
        </div>
      </div>

      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-3 hover:bg-blue-600"
        onClick={() => setIsEditing(true)}
      >
        Update
      </button>

      {isEditing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeResidentModal}
          >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()} 
          >
            <h3 className="text-xl font-bold text-blue-400 mb-4">Edit Resident Details</h3>

              <div className="max-h-96 overflow-y-auto p-2">
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
                  <span className="text-gray-300">Date of Birth:</span>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={editedPatient.dateOfBirth} 
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

                <label className="flex items-center space-x-2 mt-2">
                  <input 
                    type="checkbox" 
                    checked={removeResident} 
                    onChange={handleCheckboxChange}
                    className="h-5 w-5"
                  />
                  <span className="text-red-500 font-bold">Remove Resident</span>
                </label>
                {errors.length > 0 && (
                  <div className="mb-4 p-3 rounded">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                )}
                {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
                <div className="flex justify-between mt-4">
                  <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    onClick={handleSubmit}
                  >
                    {loading? "Updating..." : "Save Changes"}
                  </button>
                  <button 
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    onClick={closeResidentModal}
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
