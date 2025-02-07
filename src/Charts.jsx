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

  const last20Days = [...Array(20)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
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

      {message && (
        <p className="text-green-600 bg-green-100 p-2 rounded-md text-center mb-4">
          {message}
        </p>
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
                  {last20Days.map((date) => {
                    const chart = charts.find((c) => c.dateTaken.startsWith(date));
                    return (
                      <tr key={date} className="text-center hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-2">{date}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {chart ? chart.patientName : "Missing"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {chart ? chart.status : "Missing"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-gray-600">
                          {chart?.reasonNotFiled || "—"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {chart && (
                            <button
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                              onClick={() => {
                                setShowChartCard(true);
                                setSelectedChart(chart);
                              }}
                            >
                              View
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {chart && (
                            <>
                              <button
                                className="text-gray-600 hover:text-gray-800"
                                onClick={() => setStatusMenu(chart.chartId)}
                              >
                                ⋮
                              </button>
                              {statusMenu === chart.chartId && (
                                <div className="absolute bg-white shadow-md rounded-md p-2">
                                  <select
                                    value={selectedStatus[chart.chartId] || ""}
                                    onChange={(e) =>
                                      setSelectedStatus({
                                        ...selectedStatus,
                                        [chart.chartId]: e.target.value,
                                      })
                                    }
                                    className="border border-gray-300 p-2 rounded-md"
                                  >
                                    <option value="">Select</option>
                                    {chart.status !== "approved" && (
                                      <option value="approved">Approve</option>
                                    )}
                                    <option value="declined">Decline</option>
                                  </select>
                                  <button
                                    className="ml-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                                    onClick={() => handleChartUpdate(chart.chartId)}
                                    disabled={submitting || !selectedStatus[chart.chartId]}
                                  >
                                    {submitting ? "Submitting..." : "Submit"}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showChartCard && selectedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <ChartCard chart={selectedChart} onClose={() => setShowChartCard(false)} />
        </div>
      )}
    </div>
  );
};

export default Charts;
