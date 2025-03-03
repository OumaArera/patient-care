import React, { useState, useEffect, useRef } from "react";
import { getpatientManagers } from "../services/getPatientManagers";
import { getCharts } from "../services/getCharts";
import { fetchChartData } from "../services/fetchChartData";
import { FaUserCircle } from "react-icons/fa";
import { Loader } from "lucide-react";
import NewCharts from "./NewCharts";


const ChartPatient = () => {
  const [patientManagers, setPatientManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [charts, setCharts] = useState([]);
  const [showNewCharts, setShowNewCharts] = useState(false);
  const overlayRef = useRef(null);

  const fetchAllChartData = async (patientId) => {
    setLoadingCharts(true);
    setSelectedPatientId(patientId);
    try {
      const [chartsResponse, chartsDataResponse] = await Promise.all([
        getCharts(patientId),
        fetchChartData(),
      ]);
      setCharts(chartsResponse?.responseObject || []);
      setChartData(chartsDataResponse?.responseObject || []);
    } catch (error) {
      console.error("Error fetching charts:", error);
    } finally {
      setLoadingCharts(false);
    }
  };
  

  const patientsPerPage = 300;

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setShowNewCharts(false);
      }
    };

    if (showNewCharts) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNewCharts]);

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patientManagers.slice(indexOfFirstPatient, indexOfLastPatient);

  const closChartModal =()=>{
    setShowNewCharts(false)
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Residents</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
        </div>
      ) : (
        <>
          {/* Patient Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {currentPatients.map(({ patient }) => (
              <div key={patient.patientId} className="bg-gray-800 p-4 rounded-lg shadow-lg text-left relative">
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
                  {loadingCharts && selectedPatientId === patient.patientId ? (
                    <p className="text-sm text-gray-300">Loading charts...</p>
                  ) : chartData.length > 0 && selectedPatientId === patient.patientId ? (
                    <button
                      className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100"
                      onClick={() => setShowNewCharts(true)}
                    >
                      View Charts
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100"
                      onClick={() => {
                        fetchAllChartData(patient.patientId)
                        setSelectedPatient(patient)
                    }}
                    >
                      Charts
                    </button>
                  )}
                </div>

                {/* Overlay for NewCharts */}
                {showNewCharts && selectedPatient && selectedPatientId === patient.patientId && chartData.length > 0 && (
                  <div
                    className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
                    onClick={closChartModal}
                >
                    <div
                    className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                    >
                      
                      <NewCharts charts={selectedPatient} chartsData={chartData} />
                      <button
                        className="absolute top-2 right-2 text-white hover:text-gray-400"
                        onClick={closChartModal}
                      >
                        ✖
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChartPatient;