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
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const type = "charts";

  // Initialize with current month and year when component mounts
  useEffect(() => {
    const now = new Date();
    setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0')); // Add 1 because getMonth() returns 0-11
    setSelectedYear(String(now.getFullYear()));
  }, []);

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

  const closePastChartsModal = () => {
    setShowChartCard(false);
  }

  const closeChartModal = () => {
    setShow(false);
  };

  // Get days for the selected month
  const getDaysInMonth = () => {
    if (!selectedMonth || !selectedYear) return [];
    
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth) - 1;
    
    // First day of selected month
    const firstDay = new Date(year, month, 1);
    
    // Last day of selected month
    const lastDay = new Date(year, month + 1, 0);
    
    const daysArray = [];
    const currentDate = new Date();
    
    // Generate array of dates for the selected month
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      // Only add days up to current date if viewing current month/year
      if (d <= currentDate || year < currentDate.getFullYear() || 
          (year === currentDate.getFullYear() && month < currentDate.getMonth())) {
        daysArray.push(new Date(d).toISOString().split("T")[0]);
      }
    }
    
    // Sort in descending order (newest first)
    return daysArray.sort((a, b) => new Date(b) - new Date(a));
  };

  const monthDays = getDaysInMonth();

  const editChart = () => {
    setShowEdits(false);
  }

  const lateSubmission = () => {
    setAllowLate(false);
  }

  // Generate years for dropdown (current year and 5 years back)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

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

          <div className="flex w-full max-w-md gap-4">
            <div className="w-1/2">
              <label className="block mb-2 text-lg">Month:</label>
              <select
                onChange={(e) => setSelectedMonth(e.target.value)}
                value={selectedMonth}
                className="border px-4 py-2 w-full bg-gray-700 text-white rounded"
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block mb-2 text-lg">Year:</label>
              <select
                onChange={(e) => setSelectedYear(e.target.value)}
                value={selectedYear}
                className="border px-4 py-2 w-full bg-gray-700 text-white rounded"
              >
                {getYearOptions().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
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
                  {monthDays.map((date) => {
                    const chart = charts.find((c) => {
                      const chartDate = new Date(c.dateTaken);
                      chartDate.setDate(chartDate.getDate() - 1);
                      return chartDate.toISOString().split("T")[0] === date;
                    });
                    
                    const isPastDate = new Date(date) < new Date().setHours(0, 0, 0, 0);
                    
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
                              onClick={() => {
                                setShow(true);
                                setShowEdits(false);
                              }}
                            >
                              Chart
                            </button>
                          ) : (
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
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md max-h-[50vh] overflow-y-auto"
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
      {show && !showEdits && (
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