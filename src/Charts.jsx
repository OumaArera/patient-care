import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCharts } from "../services/getCharts";
import { updateChartStatus } from "../services/updateCharts";
import { errorHandler } from "../services/errorHandler";
import ChartCard from "./ChartCard";
import { Loader } from "lucide-react";

const Charts = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [charts, setCharts] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [showChartCard, setShowChartCard] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [statusMenu, setStatusMenu] = useState(null);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    setLoadingPatients(true);
    fetchPatients()
      .then((data) => {
        setPatients(data?.responseObject || []);
        setLoadingPatients(false);
      })
      .catch(() => setLoadingPatients(false));
  }, []);

  const handleSelectPatient = (e) => {
    const patientId = e.target.value;
    if (!patientId) return;
    setSelectedPatient(patientId);
    fetchCharts(patientId);
  };

  const fetchCharts = (patientId) => {
    setLoadingCharts(true);
    getCharts(patientId)
      .then((data) => {
        setCharts(data?.responseObject || []);
        setLoadingCharts(false);
      })
      .catch(() => setLoadingCharts(false));
  };

  const handleChartUpdate = async (chartId) => {
    if (!selectedStatus[chartId]) return;
    setSubmitting(true);
    try {
      const response = await updateChartStatus(chartId, selectedStatus[chartId]);
      if (response?.error) {
        setErrors(errorHandler(response.error));
        setTimeout(() => setErrors(null), 5000);
      } else {
        setMessage("Chart data updated successfully.");
        setTimeout(() => setMessage(null), 5000);
        fetchCharts(selectedPatient);
      }
    } catch (err) {
      setErrors(["Something went wrong. Please try again."]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCharts = charts.filter((chart) => chart.dateTaken.startsWith(selectedMonth));

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-black">Patient Charts</h2>

      {loadingPatients ? (
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-gray-500" size={20} />
          <p className="text-gray-500">Loading patients...</p>
        </div>
      ) : (
        <select
          onChange={handleSelectPatient}
          value={selectedPatient || ""}
          className="w-full border border-gray-300 p-2 rounded-md mb-4 bg-white text-gray-700"
        >
          <option value="">Select Patient</option>
          {patients.map((patient) => (
            <option key={patient.patientId} value={patient.patientId}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
      )}

      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md mb-4 bg-gray-100 text-gray-700"
      />

      {message && (
        <p className="text-green-600 bg-green-100 p-2 rounded-md text-center mb-4">{message}</p>
      )}
      {errors.length > 0 && (
        <div className="bg-red-100 p-3 rounded-md mb-4">
          {errors.map((error, index) => (
            <p key={index} className="text-red-700 text-sm">{error}</p>
          ))}
        </div>
      )}

      {selectedPatient && (
        <>
          {loadingCharts ? (
            <div className="text-center">
              <Loader className="animate-spin text-gray-500 mx-auto" size={20} />
              <p className="text-gray-500 mt-2">Loading charts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full border-collapse border border-gray-300 text-black">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Date</th>
                    <th className="border border-gray-300 px-4 py-2">Patient</th>
                    <th className="border border-gray-300 px-4 py-2">Status</th>
                    <th className="border border-gray-300 px-4 py-2">Reason Not Filed</th>
                    <th className="border border-gray-300 px-4 py-2">View</th>
                    <th className="border border-gray-300 px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharts.map((chart) => (
                    <tr key={chart.dateTaken} className="text-center hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{chart.dateTaken}</td>
                      <td className="border border-gray-300 px-4 py-2">{chart.patientName}</td>
                      <td className="border border-gray-300 px-4 py-2">{chart.status}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-600">{chart.reasonNotFiled || "—"}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                          onClick={() => {
                            setShowChartCard(true);
                            setSelectedChart(chart);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Charts;
