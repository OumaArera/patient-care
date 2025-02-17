import React, { useState, useEffect, useRef } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getMedicationAdmininstration } from "../services/getMedicationAdministration";
import { updateMedAdmin } from "../services/updateMedAdmin";
import { errorHandler } from "../services/errorHandler";
import { generateMedicationPDFReport } from "../services/generateMedicationReport";
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
    const overlayRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (overlayRef.current && !overlayRef.current.contains(event.target)) {
                setActionOverlay(null); 
            }
        };
    
        if (actionOverlay !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [actionOverlay]);
    

    const fetchMedAdmin = (patientId) => {
        setLoadingMedAdmin(true);
        setSelectedPatient(patientId);
        getMedicationAdmininstration(patientId)
            .then((data) => {
                setMedAdmin(data);
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
            const response = await updateMedAdmin(medicationAdministrationId, status);
            if (response?.error) {
                setErrors(errorHandler(response.error));
                setTimeout(() => setErrors(null), 5000);
            } else {
                setMessage("Medication Data updated successfully.");
                setTimeout(() => setMessage(null), 5000);
                fetchMedAdmin(selectedPatient); 
            }
        } catch (error) {
            setErrors(["Something went wrong. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setUpdating(false);
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
                        <p className="text-gray-500">Loading residents...</p>
                    </div>
                )}
                <label className="font-semibold">Select Resident: </label>
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
                        <div className="mb-4 min-h-[40px] flex items-center">
                            {filteredMedAdmin.length > 0 && selectedYear && selectedMonth && (
                                <button 
                                    className="bg-blue-500 text-white px-4 py-2 rounded" 
                                    onClick={() => generateMedicationPDFReport(
                                        filteredMedAdmin, 
                                        selectedYear, 
                                        selectedMonth
                                    )}
                                >
                                    Load Report
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg overflow-auto">
                        <table className="w-full border-collapse border border-gray-700">
                            <thead>
                                <tr className="bg-gray-800 text-white">
                                    <th className="p-3 border-r border-gray-700">Resident</th>
                                    <th className="p-3 border-r border-gray-700">Date Administered</th>
                                    <th className="p-3 border-r border-gray-700">Time Administered</th>
                                    <th className="p-3 border-r border-gray-700">Care Giver</th>
                                    <th className="p-3 border-r border-gray-700">Reason Not Filled</th>
                                    <th className="p-3 border-r border-gray-700">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                                <tbody>
                                    {filteredMedAdmin.reduce((acc, entry, index, arr) => {
                                        const isNewPatient = index === 0 || entry.patientName !== arr[index - 1]?.patientName;
                                        const rowspan = arr.filter((e) => e.patientName === entry.patientName).length;

                                        acc.push(
                                            <tr key={entry.medicationAdministrationId} className="border border-gray-700">
                                                {isNewPatient && (
                                                    <td
                                                        className="p-3 border border-gray-700 text-center align-middle"
                                                        rowSpan={rowspan} 
                                                    >
                                                        {entry.patientName}
                                                    </td>
                                                )}
                                                <td className="p-3 border border-gray-700">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
                                                <td className="p-3 border border-gray-700">
                                                    {entry.timeAdministered.map((time, index) => {
                                                        const [hours, minutes] = time.split(":");
                                                        const formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        });
                                                        return (
                                                            <span key={index} className="block">
                                                                {formattedTime}
                                                            </span>
                                                        );
                                                    })}
                                                </td>
                                                <td className="p-3 border border-gray-700">{entry.careGiverName}</td>
                                                <td className="p-3 border border-gray-700">{entry.reasonNotFiled || ""}</td>
                                                <td className="p-3 border border-gray-700">{entry.status}</td>
                                                <td className="p-3 border border-gray-700 relative">
                                                    <button onClick={() => setActionOverlay(entry.medicationAdministrationId)}>
                                                        <MoreVertical className="text-white" />
                                                    </button>
                                                    {actionOverlay === entry.medicationAdministrationId && (
                                                        <div
                                                            ref={overlayRef} // Attach the ref
                                                            className="absolute bg-gray-800 p-4 shadow-md rounded-lg right-0 top-10 mt-1 z-50"
                                                        >
                                                            <select
                                                                className="border px-4 py-2 bg-gray-700 text-white rounded"
                                                                onChange={(e) => setStatusUpdate(e.target.value)}
                                                            >
                                                                <option value="">Select Status</option>
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
                                        );
                                        return acc;
                                    }, [])}
                                </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default MedicationAdministration;
