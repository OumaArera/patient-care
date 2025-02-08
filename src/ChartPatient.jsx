import React, { useState, useEffect } from "react";
import { getpatientManagers } from "../services/getPatientManagers";
import { getCharts } from "../services/getCharts";
import { getChartsData } from "../services/getChartData";
import { FaUserCircle } from "react-icons/fa";
import { Loader } from "lucide-react";

const ChartPatient = () => {
  const [patientManagers, setPatientManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
//   const [loadingCharts, setLoadingCharts] = useState(false);
//   const [errors, setErrors] = useState([]);
//   const [chartData, setChartData] = useState([]);
//   const [charts, setCharts] = useState([]);


    // const fetchCharts = (patientId) => {
    //     setLoadingCharts(true);
    //     getCharts(patientId)
    //     .then((data) => {
    //         setCharts(data?.responseObject || []);
    //         setLoadingCharts(false);
    //     })
    //     .catch(() => setLoadingCharts(false));
    // };

    // const fetchChartsData = (patientId) => {
    //     setLoadingCharts(true);
    //     getChartsData(patientId)
    //     .then((data) => {
    //         setChartData(data?.responseObject || []);
    //         setLoadingCharts(false);
    //     })
    //     .catch(() => setLoadingCharts(false));
    // };
  
  const patientsPerPage = 3;

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    setLoading(true);
    getpatientManagers(userId)
      .then((data) => {
        setPatientManagers(data?.responseObject || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patientManagers.slice(indexOfFirstPatient, indexOfLastPatient);

  const nextPage = () => {
    if (indexOfLastPatient < patientManagers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Patient Managers</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
        </div>
      ) : (
        <>
          {/* Patient Selection Dropdown */}
          <div className="mb-4">
            <label className="block mb-2 text-gray-400">Select Patient</label>
            <select 
              className="p-2 bg-gray-800 border border-gray-700 rounded w-full"
              onChange={(e) => setSelectedPatientId(e.target.value)}
              value={selectedPatientId || ""}
            >
              <option value="">All Patients</option>
              {patientManagers.map(({ patient }) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {currentPatients
              .filter(({ patient }) => !selectedPatientId || patient.patientId === Number(selectedPatientId))
              .map(({ patient }) => (
                <div key={patient.patientId} className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
                  <FaUserCircle size={50} className="mx-auto text-blue-400 mb-3" />
                  <h3 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h3>
                  <p className="text-sm text-gray-400">DOB: {patient.dateOfBirth}</p>
                  <p className="text-sm text-gray-400">Diagnosis: {patient.diagnosis}</p>
                  <p className="text-sm text-gray-400">Allergies: {patient.allergies}</p>
                  <p className="text-sm text-gray-400">Physician: {patient.physicianName}</p>
                  <p className="text-sm text-gray-400">Facility: {patient.facilityName}</p>
                  <p className="text-sm text-gray-400">Branch: {patient.branchName}</p>
                  <p className="text-sm text-gray-400">Room: {patient.room} | Cart: {patient.cart}</p>
                  <div className="flex justify-between mt-4">
                    <button className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100">
                        Charts
                    </button>
                    <button className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-md hover:bg-yellow-100">
                        Updates
                    </button>
                    <button className="px-4 py-2 border border-green-500 text-green-600 rounded-md hover:bg-green-100">
                        Medications
                    </button>
                </div>

                </div>
              ))}
          </div>

          {/* Pagination Controls */}
          {patientManagers.length > patientsPerPage && (
            <div className="flex justify-between mt-6">
                <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
                >Previous
                </button>
                
                <button 
                    onClick={nextPage} 
                    disabled={indexOfLastPatient >= patientManagers.length} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
                >Next
            </button>
          </div>
          
          )}
        </>
      )}
    </div>
  );
};

export default ChartPatient;








const [patientManagers, setPatientManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  
  

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    setLoadingManagers(true);
    getpatientManagers(userId)
      .then((data) => {
        setPatientManagers(data?.responseObject || []);
        setLoadingManagers(false);
      })
      .catch(() => setLoadingManagers(false));
  }, []);


    
