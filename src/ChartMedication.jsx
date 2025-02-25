import React, { useState, useEffect } from "react";
import { getpatientManagers } from "../services/getPatientManagers";
import { getMedications } from "../services/getMedications";
import { FaUserCircle } from "react-icons/fa";
import { Loader } from "lucide-react";
import MedAdmin from "./MedAdmin";

const ChartMedication = () => {
  const [patientManagers, setPatientManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [medications, setMedications] = useState([]);
  const [show, setShow] = useState(false);

  const fetchAllMedicationData = async (patientId) => {
    
    setLoadingMedications(true);
    setSelectedPatientId(patientId);
    setShow(false);
    setMedications([]);
  
    try {
      const meds = await getMedications(patientId);
      setMedications(meds);
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoadingMedications(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    setLoading(true);
    getpatientManagers(userId)
      .then((data) => {
        setPatientManagers(data?.responseObject || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);


  const closeMedicationModal = () => {
    setShow(false);
    setSelectedPatientId(null);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Residents</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {patientManagers.map(({ patient }) => (
            <div key={patient.patientId} className="bg-gray-800 p-4 rounded-lg shadow-lg text-left">
              <FaUserCircle size={50} className="mx-auto text-blue-400 mb-3" />
              <h3 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h3>
              <p className="text-sm font-bold text-gray-400">DOB: {patient.dateOfBirth}</p>
              <p className="text-sm font-bold text-gray-400">Diagnosis: {patient.diagnosis}</p>
              <p className="text-sm font-bold text-gray-400">Allergies: {patient.allergies}</p>
              <p className="text-sm font-bold text-gray-400">Physician: {patient.physicianName}</p>
              <p className="text-sm font-bold text-gray-400">Facility: {patient.facilityName}</p>
              <p className="text-sm font-bold text-gray-400">Branch: {patient.branchName}</p>
              <p className="text-sm font-bold text-gray-400">Room: {patient.room} | Cart: {patient.cart}</p>
              
              <div className="flex justify-between mt-4">
                {loadingMedications && selectedPatientId === patient.patientId ? (
                  <p className="text-sm text-gray-300">Loading medications...</p>
                ) : medications.length > 0 && selectedPatientId === patient.patientId ? (
                  <button
                    className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100"
                    onClick={() => setShow(true)
                    }
                  >
                    View Medications
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100"
                    onClick={() => fetchAllMedicationData(patient.patientId)}
                  >
                    Medications
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {show && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center overflow-y-auto items-center"
          onClick={closeMedicationModal}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <MedAdmin meds={medications} selectedPatient={selectedPatientId} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={closeMedicationModal}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartMedication;
