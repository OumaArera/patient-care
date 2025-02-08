import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getMedicationAdmininstration } from "../services/getMedicationAdministration";
import { updateMedAdmin } from "../services/updateMedAdmin";
import { errorHandler } from "../services/errorHandler";
import { Loader, MoreVertical } from "lucide-react";

const MedicationAdministration = () => {
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingMedAdmin, setLoadingMedAdmin] = useState(false);
    const [patients, setPatients] = useState([]);
    const [medAdmin, setMedAdmin] = useState([]);
    const [filteredMedAdmin, setFilteredMedAdmin] = useState([]);
    const [error, setError] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [actionOverlay, setActionOverlay] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState(null);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients()
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false);
            })
            .catch(() => {
                setError("Failed to fetch patients.");
                setTimeout(() => setError(""), 10000);
                setLoadingPatients(false);
            });
    }, []);

    const fetchMedAdmin = (patientId) => {
        setLoadingMedAdmin(true);
        setSelectedPatient(patientId);
        getMedicationAdmininstration(patientId)
            .then((data) => {
                setMedAdmin(data?.responseObject || []);
                setLoadingMedAdmin(false);
            })
            .catch(() => {
                setLoadingMedAdmin(false);
            });
    };

    useEffect(() => {
        if (selectedYear && selectedMonth) {
            const filtered = medAdmin.filter((entry) => {
                const date = new Date(entry.createdAt);
                return date.getFullYear().toString() === selectedYear && (date.getMonth() + 1).toString() === selectedMonth;
            });
            setFilteredMedAdmin(filtered);
        } else {
            setFilteredMedAdmin(medAdmin);
        }
    }, [selectedYear, selectedMonth, medAdmin]);


    const handleStatusUpdate = async (medicationAdministrationId, status) => {
        if (!status) {
            setErrors(["Please select a status before submitting."]);
            setTimeout(() => setErrors([]), 5000);
            return;
        }
        setUpdating(true);
        
        try {
            const response = await updateMedAdmin(
                medicationAdministrationId,
                status
            );
            if (response?.error) {
                setErrors(errorHandler(response.error));
                setTimeout(() => setErrors(null), 5000);
            } else {
                console.log("HEllo")
                setMessage("Medication Data updated successfully.");
                setTimeout(() => setMessage(null), 5000);
                fetchCharts(selectedPatient);
            }

            
        } catch (error) {
            setErrors(["Something went wrong. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
            
        } finally{
            setUpdating(false);
            setActionOverlay(null);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white">
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Medication Administration</h2>

            {error && <div className="bg-red-500 text-white p-3 mb-3 rounded">{error}</div>}
            {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-800 rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-white">
                            {error}
                        </p>
                    ))}
                </div>
            )}

            <div className="mb-4">
                {loadingPatients && (
                    <div className="flex items-center space-x-2">
                        <Loader className="animate-spin text-gray-500" size={20} />
                        <p className="text-gray-500">Loading patients...</p>
                    </div>
                )}
                <label className="font-semibold">Select Patient: </label>
                <select className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded" onChange={(e) => fetchMedAdmin(e.target.value)} value={selectedPatient || ""}>
                    <option value="">-- Select --</option>
                    {patients.map((p) => (
                        <option key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
                </select>
            </div>

            {loadingMedAdmin ? (
                <div className="flex items-center space-x-2 text-gray-500">
                    <Loader className="animate-spin" size={20} />
                    <p>Loading medication administration records...</p>
                </div>
            ) : (
                <>
                    <div className="mb-4 flex gap-4">
                        <select className="border px-4 py-2 bg-gray-700 text-white rounded" onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear}>
                            <option value="">Select Year</option>
                            {[...new Set(medAdmin.map((m) => new Date(m.createdAt).getFullYear()))].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <select className="border px-4 py-2 bg-gray-700 text-white rounded" onChange={(e) => setSelectedMonth(e.target.value)} value={selectedMonth}>
                            <option value="">Select Month</option>
                            {[...new Set(medAdmin.map((m) => (new Date(m.createdAt).getMonth() + 1).toString()))].map((month) => (
                                <option key={month} value={month}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        <button className="bg-blue-500 px-4 py-2 rounded text-white">Load Report</button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg overflow-auto">
                        <table className="w-full border-collapse border border-gray-700">
                            <thead>
                                <tr className="bg-gray-800 text-white">
                                    <th className="p-3 border-r border-gray-700">Patient</th>
                                    <th className="p-3 border-r border-gray-700">Date Administered</th>
                                    <th className="p-3 border-r border-gray-700">Time Administered</th>
                                    <th className="p-3 border-r border-gray-700">Care Giver</th>
                                    <th className="p-3 border-r border-gray-700">Reason Not Filled</th>
                                    <th className="p-3 border-r border-gray-700">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMedAdmin.map((entry, index) => (
                                    <tr key={entry.medicationAdministrationId} className="border-t border-gray-700">
                                        <td className="p-3">{index === 0 || entry.patientName !== filteredMedAdmin[index - 1]?.patientName ? entry.patientName : ""}</td>
                                        <td className="p-3 ">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
                                        <td className="p-3">{entry.timeAdministered}</td>
                                        <td className="p-3">{entry.careGiverName}</td>
                                        <td className="p-3">{entry.reasonNotFiled || ""}</td>
                                        <td className="p-3">{entry.status}</td>
                                        <td className="p-3 relative">
                                            <button onClick={() => setActionOverlay(entry.medicationAdministrationId)}>
                                                <MoreVertical className="text-white" />
                                            </button>
                                            {actionOverlay === entry.medicationAdministrationId && (
                                                <div
                                                    className="absolute bg-gray-800 p-4 shadow-md rounded-lg right-0 top-full mt-2 z-10"
                                                    ref={(ref) => {
                                                        if (ref) {
                                                            const handleClickOutside = (event) => {
                                                                if (!ref.contains(event.target)) {
                                                                    setActionOverlay(null);
                                                                }
                                                            };
                                                            document.addEventListener("mousedown", handleClickOutside);
                                                            return () => document.removeEventListener("mousedown", handleClickOutside);
                                                        }
                                                    }}
                                                >
                                                    <select
                                                        className="border px-4 py-2 bg-gray-700 text-white rounded"
                                                        onChange={(e) => setStatusUpdate(e.target.value)}
                                                    >
                                                        <option value="">Select Status</option> {/* Ensure there's a default empty value */}
                                                        <option value="approved">Approve</option>
                                                        <option value="declined">Decline</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleStatusUpdate(entry.medicationAdministrationId, statusUpdate)}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded mt-2 block w-full"
                                                        disabled={updating || !statusUpdate} 
                                                    >
                                                        {updating ? "Updating..." : "Submit"}
                                                    </button>
                                                    
                                                    {message && <p className="text-green-600">{message}</p>}
                                                </div>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default MedicationAdministration;
