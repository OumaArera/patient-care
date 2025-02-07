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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const filteredCharts = charts.filter((chart) => {
    const chartDate = new Date(chart.dateTaken);
    return (
      chartDate.getFullYear() === selectedYear &&
      chartDate.getMonth() + 1 === selectedMonth
    );
  });

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

      <div className="flex space-x-4 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="border border-gray-300 p-2 rounded-md"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 p-2 rounded-md"
        >
          {[...Array(5)].map((_, i) => (
            <option key={i} value={new Date().getFullYear() - i}>
              {new Date().getFullYear() - i}
            </option>
          ))}
        </select>
      </div>

      {loadingCharts ? (
        <div className="text-center">
          <Loader className="animate-spin text-gray-500 mx-auto" size={20} />
          <p className="text-gray-500 mt-2">Loading charts...</p>
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-black">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Patient</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Reason Not Filed</th>
            </tr>
          </thead>
          <tbody>
            {filteredCharts.map((chart) => (
              <tr key={chart.chartId} className="text-center hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{chart.dateTaken}</td>
                <td className="border border-gray-300 px-4 py-2">{chart.patientName}</td>
                <td className="border border-gray-300 px-4 py-2">{chart.status}</td>
                <td className="border border-gray-300 px-4 py-2">{chart.reasonNotFiled || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Charts;
