import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCharts } from "../services/getCharts";
import ChartCard from "./ChartCard";
import { Loader, MoreVertical } from "lucide-react";
import ResubmitChart from "./ResubmitChart";
import UpdateCharts from "./UpdateCharts";
import LateSubmission from "./LateSubmission";
import ReviewChart from "./ReviewChart";

const Charts = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [charts, setCharts] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [showChartCard, setShowChartCard] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [show, setShow] = useState(false);
  const [showEdits, setShowEdits] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [allowLate, setAllowLate] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const type = "charts";
  
  // New state for month selection
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  });

  const handleReviewChart = () => {
    setShowReview(false);
  };

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

  // Get days for the selected month
  const getDaysInMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysArray = [];
    
    const currentDate = new Date();
    const isCurrentMonth = 
      currentDate.getFullYear() === year && 
      currentDate.getMonth() === month - 1;
    
    const maxDay = isCurrentMonth 
      ? currentDate.getDate() 
      : lastDay.getDate();
    
    for (let day = 1; day <= maxDay; day++) {
      const date = new Date(year, month - 1, day);
      daysArray.push(date.toISOString().split("T")[0]);
    }
    
    return daysArray.reverse(); // Show most recent dates first
  };

  // Get list of available months (current month and previous 11 months)
  const getAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      months.push({ value: monthStr, label: monthName });
    }
    
    return months;
  };

  const editChart = () =>{
    setShowEdits(false);
  }

  const lateSubmission = () =>{
    setAllowLate(false);
  }
  
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Get days of the selected month
  const daysInSelectedMonth = getDaysInMonth();

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-400">Resident Charts</h2>

      {loadingPatients ? (
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-gray-400" size={20} />
          <p className="text-gray-400">Loading residents...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 gap-4">
          <div className="w-full max-w-md">
            <label className="block mb-2 text-lg">Select Branch:</label>
            <select
              onChange={(e) => setSelectedBranch(e.target.value)}
              value={selectedBranch}
              className="border px-4 py-2 w-full bg-gray-700 text-white rounded"
            >
              <option value="">All Branches</option>
              {[...new Set(patients.map((p) => p.branchName))].map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full max-w-md">
            <label className="block mb-2 text-lg">Select Resident:</label>
            <select
              onChange={handleSelectPatient}
              value={selectedPatient ? selectedPatient.patientId : ""}
              className="border px-4 py-2 w-full bg-gray-700 text-white rounded"
            >
              <option value="" disabled>Select Resident</option>
              {patients
                .filter((p) => !selectedBranch || p.branchName === selectedBranch)
                .sort((a, b) =>
                  `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                )
                .map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
            </select>
          </div>

          {/* Month selection dropdown */}
          <div className="w-full max-w-md">
            <label className="block mb-2 text-lg">Select Month:</label>
            <select
              onChange={handleMonthChange}
              value={selectedMonth}
              className="border px-4 py-2 w-full bg-gray-700 text-white rounded"
            >
              {getAvailableMonths().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
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
                    <th className="p-3 border border-gray-600 w-48">Chart Status</th>
                    <th className="p-3 border border-gray-600 w-48">Reason Filled Late</th>
                    <th className="p-3 border border-gray-600">View</th>
                    <th className="p-3 border border-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {daysInSelectedMonth.map((date) => {
                    const chart = charts.find((c) => {
                      const chartDate = new Date(c.dateTaken);
                      chartDate.setDate(chartDate.getDate() - 1);
                      return chartDate.toISOString().split("T")[0] === date;
                    });
                    
                    const currentDate = new Date();
                    const dateObj = new Date(date);
                    const isPastDate = dateObj < new Date(currentDate.setHours(0, 0, 0, 0));
                    
                    return (
                      <tr key={date} className="bg-gray-900 text-gray-300">
                        <td className="p-2 border border-gray-700">{date}</td>
                        <td className="p-2 border border-gray-700">
                          {chart ? chart.patientName : "Missing"}
                        </td>
                        <td className="p-2 border border-gray-700">{chart ? chart.status : null}</td>
                        <td className="p-2 border border-gray-700">{chart ? chart.reasonFilledLate : "-"}</td>
                        <td className="p-2 border border-gray-700">
                          {chart ? (
                            <button
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                              onClick={() => {
                                setShowChartCard(true);
                                setAllowLate(false);
                                setSelectedChart(chart);
                              }}
                            >
                              View
                            </button>
                          ) : isPastDate ? ( 
                            <button
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                              onClick={() => {
                                setAllowLate(true);
                                setShowChartCard(false);
                              }}
                            >
                              Approve Late
                            </button>
                          ) : (
                            "Pending" 
                          )}
                        </td>
                        <td className="p-2 border border-gray-700">
                          {!chart ? (
                            <button 
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                              onClick={() =>{
                                setShow(true);
                                setShowEdits(false);
                              }}
                            >
                            Chart
                            </button>
                          ):(
                            <button
                              className="text-white hover:text-gray-400"
                              onClick={() => {
                                setSelectedChart(chart);
                                setShowOptions(true);
                              }}
                            >
                              <MoreVertical size={20} />
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
      
      {showOptions && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={() => setShowOptions(false)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[40vw] max-h-[50vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
              onClick={() => {
                setShowEdits(true);
                setShowOptions(false);
              }}
            >
              Edit Chart
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={() => {
                setShowReview(true);
                setShowOptions(false);
              }}
            >
              Review Chart
            </button>
          </div>
        </div>
      )}
      
      {showChartCard && selectedChart && !allowLate && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={closePastChartsModal}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[60vw] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ChartCard chart={selectedChart} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={closePastChartsModal}
            >
              ✖
            </button>
          </div>
        </div>
      )}
      
      {show && !showEdits &&(
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={closeChartModal}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[80vw] max-h-[80vh] overflow-y-auto"
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
      
      {showReview && selectedChart && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={handleReviewChart}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[80vw] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ReviewChart chart={selectedChart} handleGetCharts={fetchCharts} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={handleReviewChart}
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {showEdits && !show && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={editChart}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[80vw] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <UpdateCharts chart={selectedChart} handleGetCharts={fetchCharts} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={editChart}
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {allowLate && !showChartCard && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={lateSubmission}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[80vw] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <LateSubmission patient={selectedPatient} type={type} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={lateSubmission}
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