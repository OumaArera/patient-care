import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getVitals } from "../services/getVitals";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader } from "lucide-react";
import { generateVitalsPDFReport } from "../services/generateVitals";
import ResubmitVitals from "./ResubmitVitals";
import UpdateVitals from "./UpdateVitals";

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
  const vitalsPerPage = 10;

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

  const filteredVitals = vitals.filter((v) => {
    const date = new Date(v.dateTaken);
    return date.getFullYear() === Number(year) && (date.getMonth() + 1) === Number(month);
  });

  const indexOfLastVital = currentPage * vitalsPerPage;
  const indexOfFirstVital = indexOfLastVital - vitalsPerPage;
  const currentVitals = filteredVitals.slice(indexOfFirstVital, indexOfLastVital);
  const totalPages = Math.ceil(filteredVitals.length / vitalsPerPage);

  const chartData = filteredVitals.map((v) => {
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
            <select
                className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
                onChange={handlePatientChange}
                value={selectedPatient || ""}
            >
                <option value="">Select a Resident</option>
                {[...patients]
                    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                    .map((p) => (
                        <option key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
            </select>
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
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 200]} tickCount={21} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" />
            <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic" />
            <Line type="monotone" dataKey="temperature" stroke="#ffc658" name="Temperature" />
            <Line type="monotone" dataKey="pulse" stroke="#ff7300" name="Pulse" />
            <Line type="monotone" dataKey="oxygenSaturation" stroke="#00C49F" name="Oxygen Saturation" />
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
                  <td className="p-2 border border-gray-700">
                  <button 
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    onClick={() =>{
                      setSelectedVital(v);
                      setShow(true);
                      setShowVitals(false);
                    }}
                  >
                  Edit
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
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
