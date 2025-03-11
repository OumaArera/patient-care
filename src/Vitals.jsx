import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getVitals } from "../services/getVitals";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader, MoreVertical } from "lucide-react";
import { generateVitalsPDFReport } from "../services/generateVitals";
import ResubmitVitals from "./ResubmitVitals";
import UpdateVitals from "./UpdateVitals";
import ReviewVitals from "./ReviewVitals";
import LateSubmission from "./LateSubmission";

const Vitals = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [currentPage, setCurrentPage] = useState(1);
  const [showVitals, setShowVitals] = useState(false);
  const [selectedVital, setSelectedVital] = useState(null);
  const [show, setShow] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const branchNames = [...new Set(patients.map((p) => p.branchName))];
  const [showOptions, setShowOptions] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [allowLate, setAllowLate] = useState(false);
  const vitalsPerPage = 10;
  const type = "vital";


  const closVitalsModal =()=>{
    setShowVitals(false)
  }

  useEffect(() => {
    setLoadingPatients(true);
    fetchPatients()
      .then((data) => {
        setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
      })
      .catch(() => {})
      .finally(() => setLoadingPatients(false));
  }, []);

  const fetchVitals = (patientId) => {
    setLoadingVitals(true);
    getVitals(patientId)
      .then((data) => {
        setVitals(data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingVitals(false));
  };

  const handlePatientChange = (event) => {
    const patientId = event.target.value;
    setSelectedPatient(patientId);
    fetchVitals(patientId);
  };

  const filteredVitals = vitals
    .filter((v) => {
      const date = new Date(v.dateTaken);
      return date.getFullYear() === Number(year) && date.getMonth() + 1 === Number(month);
    })
    .sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken));

  const indexOfLastVital = currentPage * vitalsPerPage;
  const indexOfFirstVital = indexOfLastVital - vitalsPerPage;
  const currentVitals = filteredVitals.slice(indexOfFirstVital, indexOfLastVital);
  const totalPages = Math.ceil(filteredVitals.length / vitalsPerPage);

  const chartData = [...filteredVitals]
  .sort((a, b) => new Date(a.dateTaken) - new Date(b.dateTaken))
  .map((v) => {
    const [systolic, diastolic] = v.bloodPressure.split("/").map(Number);
    return {
      date: new Date(v.dateTaken).toLocaleDateString("en-US"),
      systolic,
      diastolic,
      temperature: v.temperature,
      pulse: v.pulse,
      oxygenSaturation: v.oxygenSaturation,
    };
  });

  const handleUpdateVitals =() =>{
    setShow(false);
  }

  const handleReviewVitals = () => {
    setShowReview(false);
  };

  const lateSubmission = () =>{
    setAllowLate(false);
}

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Resident Vitals</h2>

      <div className="flex space-x-4 mb-4">
        {loadingPatients ? (
            <div className="flex justify-center items-center">
                <Loader className="animate-spin text-blue-400" size={24} />
                <p className="text-gray-400">Loading residents...</p>
            </div>
        ) : (
            <>
            <select
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
              onChange={(e) => setSelectedBranch(e.target.value)}
              value={selectedBranch}
            >
              <option value="">All Branches</option>
              {branchNames.map((branch, index) => (
                <option key={index} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

            <select
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
              onChange={handlePatientChange}
              value={selectedPatient || ""}
            >
              <option value="">Select a Resident</option>
              {[...patients]
                .filter((p) => !selectedBranch || p.branchName === selectedBranch)
                .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                .map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
            </select>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              onClick={() => {
                  setAllowLate(true)
              }}
              >
              Allow
          </button>
            </>
        )}
        <select className="p-2 bg-gray-800 text-white border border-gray-700 rounded" onChange={(e) => setYear(e.target.value)} value={year}>
          {[...Array(10)].map((_, i) => (
            <option key={i} value={new Date().getFullYear() - i}>
              {new Date().getFullYear() - i}
            </option>
          ))}
        </select>
        <select className="p-2 bg-gray-800 text-white border border-gray-700 rounded" onChange={(e) => setMonth(e.target.value)} value={month}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m.toString().padStart(2, "0")}>{
              new Date(0, m - 1).toLocaleString("en-US", { month: "long" })
            }</option>
          ))}
        </select>
      </div>
      

      {loadingVitals ? (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin text-blue-400" size={24} />
          <p className="text-gray-400 ml-2">Loading vitals...</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 40, right: 30, left: 20, bottom: 10 }} // Increase top margin for legend space
              style={{ backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "10px" }}
            >
              <Legend layout="horizontal" verticalAlign="top" align="center" />  {/* Moves legend to top */}
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#333" />
              <YAxis domain={[0, 200]} tickCount={21} stroke="#333" />
              <Tooltip wrapperStyle={{ backgroundColor: "#fff", border: "1px solid #ddd" }} />
              
              {/* Lines with improved visibility */}
              <Line type="monotone" dataKey="systolic" stroke="#4B0082" strokeWidth={3} name="Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#008000" strokeWidth={3} name="Diastolic" />
              <Line type="monotone" dataKey="temperature" stroke="#FFA500" strokeWidth={3} name="Temperature" />
              <Line type="monotone" dataKey="pulse" stroke="#DC143C" strokeWidth={3} name="Pulse" />
              <Line type="monotone" dataKey="oxygenSaturation" stroke="#007FFF" strokeWidth={3} name="Oxygen Saturation" />
            </LineChart>
          </ResponsiveContainer>


          <div className="flex justify-center space-x-4 mt-4">
            {vitals.length > 0 && (
                <button 
                    className="mb-4 mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => generateVitalsPDFReport(vitals, year, month)}
                >
                    Download Vitals
                </button>
            )}
            {selectedPatient && (<button
                className="mb-4 mt-2 border-blue-500 bg-blue-100 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded"
                onClick={() => {
                  setShowVitals(true);
                  setShow(false);
                }}
            >
                New Vitals
            </button>)}
        </div>

          <table className="w-full border-collapse border border-gray-700 mt-4">
            <thead>
              <tr className="bg-gray-800 text-blue-400">
                <th className="p-2 border border-gray-700">Date</th>
                <th className="p-2 border border-gray-700">Blood Pressure</th>
                <th className="p-2 border border-gray-700">Temperature</th>
                <th className="p-2 border border-gray-700">Pulse</th>
                <th className="p-2 border border-gray-700">Oxygen Saturation</th>
                <th className="p-2 border border-gray-700">Pain</th>
                <th className="p-2 border border-gray-700">Reason Declined</th>
                <th className="p-2 border border-gray-700">Vital Status</th>
                <th className="p-2 border border-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentVitals.map((v) => (
                <tr key={v.vitalId} className="bg-gray-900 text-gray-300">
                  <td className="p-2 border border-gray-700">{new Date(v.dateTaken).toLocaleDateString()}</td>
                  <td className="p-2 border border-gray-700">{v.bloodPressure}</td>
                  <td className="p-2 border border-gray-700">{v.temperature}°F</td>
                  <td className="p-2 border border-gray-700">{v.pulse}</td>
                  <td className="p-2 border border-gray-700">{v.oxygenSaturation}%</td>
                  <td className="p-2 border border-gray-700">
                    {["N/A", "NO", "No", "no", "No Pain", "no pain", "No pain", null].includes(v.pain) ? "-" : v.pain}
                  </td>
                  <td className="p-2 border border-gray-700">{v.declineReason || ""}</td>
                  <td className="p-2 border border-gray-700">{v.status}</td>
                  <td className="p-2 border border-gray-700">
                    <button
                      className="text-white hover:text-gray-400"
                      onClick={() => {
                        setSelectedVital(v);
                        setShowOptions(true);
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4 space-x-2">
            <button
              className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-600" : "bg-blue-500 hover:bg-blue-700"} text-white`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white bg-gray-800 rounded">Page {currentPage} of {totalPages}</span>
            <button
              className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-600" : "bg-blue-500 hover:bg-blue-700"} text-white`}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
      {allowLate &&  (
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
      {showReview && selectedVital && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={handleReviewVitals}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-[80vw] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ReviewVitals vital={selectedVital} handleVitals={fetchVitals} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={handleReviewVitals}
            >
              ✖
            </button>
          </div>
        </div>
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
              // className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
              onClick={() =>{
                setShow(true);
                setShowVitals(false);
              }}
            >
            Edit Vitals
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={() => {
                setShowReview(true);
                setShowOptions(false);
              }}
            >
              Review Vitals
            </button>
          </div>
        </div>
      )}
      {showVitals && !show &&(
        <div
        className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
        onClick={closVitalsModal}
    >
        <div
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        >
          
          <ResubmitVitals patient={selectedPatient} fetchVitals={fetchVitals} />
          <button
            className="absolute top-2 right-2 text-white hover:text-gray-400"
            onClick={closVitalsModal}
          >
            ✖
          </button>
        </div>
      </div>
      )}
      {show && !showVitals && (
        <div
        className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
        onClick={handleUpdateVitals}
    >
        <div
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        >
          
          <UpdateVitals vital={selectedVital} fetchVitals={fetchVitals} />
          <button
            className="absolute top-2 right-2 text-white hover:text-gray-400"
            onClick={handleUpdateVitals}
          >
            ✖
          </button>
        </div>
      </div>
      )}
      
    </div>
  );
};

export default Vitals;
