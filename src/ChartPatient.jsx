import React, { useState, useEffect, useRef } from "react";
import { getpatientManagers } from "../services/getPatientManagers";
import { getCharts } from "../services/getCharts";
import { getChartsData } from "../services/getChartData";
import { FaUserCircle } from "react-icons/fa";
import { Loader } from "lucide-react";
import NewCharts from "./NewCharts";

const ChartPatient = () => {
  const [patientManagers, setPatientManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [charts, setCharts] = useState([]);
  const [showNewCharts, setShowNewCharts] = useState(false);
  const overlayRef = useRef(null);

  const fetchAllChartData = async (patientId) => {
    setLoadingCharts(true);
    try {
      const [chartsResponse, chartsDataResponse] = await Promise.all([
        getCharts(patientId),
        getChartsData(patientId),
      ]);
      setCharts(chartsResponse?.responseObject || []);
      setChartData(chartsDataResponse?.responseObject || []);
    } catch (error) {
      console.error("Error fetching charts:", error);
    } finally {
      setLoadingCharts(false);
    }
  };

  const patientsPerPage = 3;

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

  const handleChartsClick = (patientId) => {
    fetchAllChartData(patientId);
    setShowNewCharts(true);
  };

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
                    <button
                      className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100"
                      onClick={() => handleChartsClick(patient.patientId)}
                    >
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
              >
                Previous
              </button>

              <button
                onClick={nextPage}
                disabled={indexOfLastPatient >= patientManagers.length}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Overlay for NewCharts */}
      {showNewCharts && charts.length > 0 && chartData.length > 0 && (
        <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 pt-20">
          <div ref={overlayRef} className="bg-gray-900 p-6 rounded-lg w-11/12 max-w-4xl relative">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-400"
              onClick={() => setShowNewCharts(false)}
            >
              ✖
            </button>

            {loadingCharts ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="animate-spin" size={32} />
                <p className="ml-2">Loading charts...</p>
              </div>
            ) : (
              <NewCharts charts={charts} chartsData={chartData} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartPatient;
