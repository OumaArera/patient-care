import React, { useRef, useState, useEffect } from "react";
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
  const statusMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setStatusMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const last20Days = [...Array(31)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  return (
    <div className=" bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-400">Resident Charts</h2>

      {loadingPatients ? (
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-gray-400" size={20} />
          <p className="text-gray-400">Loading residents...</p>
        </div>
      ) : (
        <>
          <label className="block mb-2 text-lg">Select Resident:</label>
          <select
            onChange={handleSelectPatient}
            value={selectedPatient || ""}
            className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded"
          >
            <option value="">Select Resident</option>
            {patients.map((patient) => (
              <option key={patient.patientId} value={patient.patientId}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </>
      )}

      {message && (
        <p className="text-green-600">
          {message}
        </p>
      )}
      {errors.length > 0 && (
        <div className="p-3 rounded-md mb-4">
          {errors.map((error, index) => (
            <p key={index} className="text-red-700 text-sm">{error}</p>
          ))}
        </div>
      )}

      {selectedPatient && (
        <>
          {loadingCharts ? (
            <div className="text-center">
              <Loader className="animate-spin text-gray-400 mx-auto" size={20} />
              <p className="text-gray-400 mt-2">Loading charts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full border-collapse border border-gray-700 text-white">
                <thead className="">
                  <tr className="bg-gray-700">
                    <th className="p-3 border border-gray-600">Date</th>
                    <th className="p-3 border border-gray-600">Resident</th>
                    <th className="p-3 border border-gray-600">Status</th>
                    <th className="p-3 border border-gray-600">Reason Not Filed</th>
                    <th className="p-3 border border-gray-600">View</th>
                    <th className="p-3 border border-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {last20Days.map((date) => {
                    const chart = charts.find((c) => c.dateTaken.startsWith(date));
                    return (
                      <tr key={date} className="bg-gray-900 text-gray-300">
                        <td className="p-2 border border-gray-700">{date}</td>
                        <td className="p-2 border border-gray-700">
                          {chart ? chart.patientName : "Missing"}
                        </td>
                        <td className="p-2 border border-gray-700">
                          {chart ? chart.status : "Missing"}
                        </td>
                        <td className="p-2 border border-gray-700">
                          {chart?.reasonNotFiled || "—"}
                        </td>
                        <td className="p-2 border border-gray-700">
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
                        <td className="p-2 border border-gray-700">
                        {chart && (
                          <>
                            <button
                              className="text-gray-100 hover:text-gray-200"
                              onClick={() => setStatusMenu(chart.chartId)}
                            >
                              ⋮
                            </button>
                            {statusMenu === chart.chartId && (
                              <div
                                ref={statusMenuRef} // Attach ref here
                                className="absolute bg-white shadow-md rounded-md p-2"
                              >
                                <select
                                  value={selectedStatus[chart.chartId] || ""}
                                  onChange={(e) =>
                                    setSelectedStatus({
                                      ...selectedStatus,
                                      [chart.chartId]: e.target.value,
                                    })
                                  }
                                  className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded"
                                >
                                  <option value="">Select</option>
                                  {chart.status !== "approved" && <option value="approved">Approve</option>}
                                  <option value="declined">Decline</option>
                                </select>
                                <button
                                  className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
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
        <div className="p-6 bg-gray-900 text-white min-h-screen">
          <ChartCard chart={selectedChart} onClose={() => setShowChartCard(false)} />
        </div>
      )}
    </div>
  );
};

export default Charts;
