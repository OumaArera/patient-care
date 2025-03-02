import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getVitals } from "../services/getVitals";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader } from "lucide-react";
import { generateVitalsPDFReport } from "../services/generateVitals";

const Vitals = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [currentPage, setCurrentPage] = useState(1);
  const vitalsPerPage = 10;

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
            {vitals.length > 0 && (
                <button 
                    className="mb-4 mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => generateVitalsPDFReport(vitals, year, month)}
                >
                    Download Vitals
                </button>
            )}

          <table className="w-full border-collapse border border-gray-700 mt-4">
            <thead>
              <tr className="bg-gray-800 text-blue-400">
                <th className="p-2">Date</th>
                <th className="p-2">Blood Pressure</th>
                <th className="p-2">Temperature</th>
                <th className="p-2">Pulse</th>
                <th className="p-2">Oxygen Saturation</th>
                <th className="p-2">Pain</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Vitals;
