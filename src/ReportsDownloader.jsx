import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCharts } from "../services/getCharts";
import { getVitals } from "../services/getVitals";
import { generatePDFReport } from "../services/generatePDFReport";
import { generateVitalsPDFReport } from "../services/generateVitals";
import { Loader } from "lucide-react";

const ReportsDownloader = () => {
  // State management
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [reportType, setReportType] = useState("charts"); 
  
  // Loading states
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  // Data states
  const [chartsData, setChartsData] = useState([]);
  const [vitalsData, setVitalsData] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  // Get branchId from localStorage and fetch patients on component mount
  useEffect(() => {
    const storedBranchId = localStorage.getItem("branch");
    
    setLoadingPatients(true);
    fetchPatients()
      .then((data) => {
        // Filter patients to only those matching the branchId from localStorage
        const allPatients = data?.responseObject || [];
        
        // Convert the branchId to the same type for comparison (both to numbers)
        const storedBranchIdNum = parseInt(storedBranchId);
        const filteredPatients = allPatients.filter(patient => {
          // Convert patient.branchId to number if it's not already
          const patientBranchId = typeof patient.branchId === 'string' ? 
            parseInt(patient.branchId) : patient.branchId;
          
          return patientBranchId === storedBranchIdNum;
        });
        
        setPatients(filteredPatients);
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
      })
      .finally(() => setLoadingPatients(false));
  }, []);

  // Handle patient selection
  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    setSelectedPatient(patientId);
    setDataReady(false);
    
    if (patientId) {
      if (reportType === "charts") {
        fetchChartsData(patientId);
      } else {
        fetchVitalsData(patientId);
      }
    }
  };

  // Handle report type change
  const handleReportTypeChange = (e) => {
    const type = e.target.value;
    setReportType(type);
    setDataReady(false);
    
    if (selectedPatient) {
      if (type === "charts") {
        fetchChartsData(selectedPatient);
      } else {
        fetchVitalsData(selectedPatient);
      }
    }
  };

  // Fetch charts data
  const fetchChartsData = (patientId) => {
    setLoadingData(true);
    getCharts(patientId)
      .then((data) => {
        const charts = data?.responseObject || [];
        setChartsData(charts);
        setDataReady(charts.length > 0);
      })
      .catch((error) => {
        console.error("Error fetching charts:", error);
      })
      .finally(() => setLoadingData(false));
  };

  // Fetch vitals data
  const fetchVitalsData = (patientId) => {
    setLoadingData(true);
    getVitals(patientId)
      .then((data) => {
        const vitals = data || [];
        setVitalsData(vitals);
        setDataReady(vitals.length > 0);
      })
      .catch((error) => {
        console.error("Error fetching vitals:", error);
      })
      .finally(() => setLoadingData(false));
  };

  // Filter data by year and month
  const getFilteredData = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    
    if (reportType === "charts") {
      return chartsData.filter(chart => {
        const date = new Date(chart.dateTaken);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
    } else {
      return vitalsData.filter(vital => {
        const date = new Date(vital.dateTaken);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
    }
  };

  // Generate and download report
  const downloadReport = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      alert("No data available for the selected month and year");
      return;
    }
    
    if (reportType === "charts") {
      generatePDFReport(filteredData, selectedYear, selectedMonth);
    } else {
      generateVitalsPDFReport(filteredData, selectedYear, selectedMonth);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-400">Reports Downloader</h2>
      
      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Report Type Selection */}
        <div className="mb-4">
          <label className="block text-blue-300 mb-2">Report Type:</label>
          <select
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
            value={reportType}
            onChange={handleReportTypeChange}
          >
            <option value="charts">Behavior Charts</option>
            <option value="vitals">Resident Vitals</option>
          </select>
        </div>

        {/* Patient Selection */}
        <div className="mb-4">
          <label className="block text-blue-300 mb-2">
            Resident {patients.length ? `(${patients.length})` : ""}:
          </label>
          {loadingPatients ? (
            <div className="flex items-center space-x-2">
              <Loader className="animate-spin text-blue-400" size={20} />
              <p className="text-gray-400">Loading residents...</p>
            </div>
          ) : patients.length > 0 ? (
            <select
              className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
              value={selectedPatient || ""}
              onChange={handlePatientChange}
            >
              <option value="">-- Select Resident --</option>
              {patients
                .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                .map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
            </select>
          ) : (
            <div className="p-2 bg-gray-800 text-gray-400 border border-gray-700 rounded">
              No residents found for your branch
            </div>
          )}
        </div>
      </div>

      {/* Month/Year Selection */}
      <div className="mb-6">
        <label className="block text-blue-300 mb-2">Report Period:</label>
        <div className="flex space-x-2">
          <select
            className="w-1/2 p-2 bg-gray-800 text-white border border-gray-700 rounded"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={!selectedPatient}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m.toString().padStart(2, "0")}>
                {new Date(0, m - 1).toLocaleString("en-US", { month: "long" })}
              </option>
            ))}
          </select>
          
          <select
            className="w-1/2 p-2 bg-gray-800 text-white border border-gray-700 rounded"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!selectedPatient}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading indicator */}
      {loadingData && (
        <div className="flex justify-center items-center mb-6">
          <Loader className="animate-spin text-blue-400" size={24} />
          <p className="text-gray-400 ml-2">Loading data...</p>
        </div>
      )}

      {/* Download button */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
          onClick={downloadReport}
          disabled={!dataReady || loadingData}
        >
          {reportType === "charts" ? "Download Behavior Charts" : "Download Vitals Report"}
        </button>
      </div>

      {/* Data status */}
      {selectedPatient && !loadingData && (
        <div className="mt-6 text-center text-gray-400">
          {dataReady ? (
            <p>
              {getFilteredData().length > 0 
                ? `${getFilteredData().length} records available for ${new Date(0, parseInt(selectedMonth) - 1).toLocaleString("en-US", { month: "long" })} ${selectedYear}`
                : `No ${reportType} data available for the selected month and year`}
            </p>
          ) : (
            <p>No data available for this resident</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsDownloader;