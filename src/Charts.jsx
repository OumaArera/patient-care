import React, { useRef, useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCharts } from "../services/getCharts";
import ChartCard from "./ChartCard";
import { Loader } from "lucide-react";
import ResubmitChart from "./ResubmitChart";

const Charts = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [charts, setCharts] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [showChartCard, setShowChartCard] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [show, setShow] = useState(false);


  useEffect(() => {
    setLoadingPatients(true);
    fetchPatients()
      .then((data) => {
        console.log("Patients D: ", data?.responseObject);
        setPatients(data?.responseObject || []);
        setLoadingPatients(false);
      })
      .catch(() => setLoadingPatients(false));
  }, []);

  const handleSelectPatient = (e) => {
    const patientId = Number(e.target.value);
    const patient = patients.find((p) => p.patientId === patientId);
    if (!patient) return;
    setSelectedPatient(patient);
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

  const closePastChartsModal = () =>{
     setShowChartCard(false);

  }

  const closeChartModal = () => {
    setShow(false);
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
          <br />
        </>
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
                          {!chart &&(
                            <button 
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                              onClick={() =>{
                                setShow(true)
                              }}
                            >
                            Chart
                            </button>
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

      {/* {showChartCard && selectedChart && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-6 rounded-lg shadow-lg"
        >
          <ChartCard chart={selectedChart} onClose={() => setShowChartCard(false)} />
        </div>
      )} */}
      {showChartCard && selectedChart && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={closePastChartsModal}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[60vw] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ChartCard chart={selectedChart} onClose={() => setShowChartCard(false)} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={closePastChartsModal}
            >
              ✖
            </button>
          </div>
        </div>
      )}
      {show && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={closeChartModal}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[60vw] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ResubmitChart patient={selectedPatient} handleGetCharts={fetchCharts} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={closeChartModal}
            >
              ✖
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Charts;
