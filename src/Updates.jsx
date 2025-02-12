import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getUpdates } from "../services/getUpdates";
import { Loader } from "lucide-react";

const Updates = () => {
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingUpdates, setLoadingUpdates] = useState(false);
    const [patients, setPatients] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients()
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false);
            })
            .catch(() => {
                setLoadingPatients(false);
            });
    }, []);

    const fetchUpdates = (patientId) => {
        setLoadingUpdates(true);
        getUpdates(patientId)
            .then((data) => {
                setUpdates(data?.responseObject || []);
                setLoadingUpdates(false);
            })
            .catch(() => setLoadingUpdates(false));
    };

    const handlePatientChange = (event) => {
        const patientId = event.target.value;
        setSelectedPatient(patientId);
        fetchUpdates(patientId);
    };

    const filteredUpdates = updates.filter((update) => {
        const updateDate = new Date(update.dateTaken);
        return (
            (!selectedYear || updateDate.getFullYear().toString() === selectedYear) &&
            (!selectedMonth || (updateDate.getMonth() + 1).toString() === selectedMonth)
        );
    });

    // Count occurrences of each patientName
    const patientNameCounts = {};
    filteredUpdates.forEach((update) => {
        patientNameCounts[update.patientName] = (patientNameCounts[update.patientName] || 0) + 1;
    });

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Resident Updates</h2>
            <div className="mb-4 flex space-x-4">
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
                        {patients.map((patient) => (
                            <option key={patient.patientId} value={patient.patientId}>
                                {`${patient.firstName} ${patient.lastName}`}
                            </option>
                        ))}
                    </select>
                )}

                {patients.length > 0 && (
                    <>
                        <select
                            className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="">Select Year</option>
                            {[...new Set(updates.map((u) => new Date(u.dateTaken).getFullYear()))].map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <select
                            className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="">Select Month</option>
                            {[...Array(12).keys()].map((month) => (
                                <option key={month + 1} value={month + 1}>{new Date(0, month).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            {loadingUpdates ? (
                <div className="flex justify-center items-center">
                    <Loader className="animate-spin text-blue-400" size={24} />
                </div>
            ) : (
                <table className="w-full border-collapse border border-gray-700 text-white">
                    <thead>
                        <tr className="bg-gray-800 text-blue-400">
                            <th className="border border-gray-700 p-2">Patient Name</th>
                            <th className="border border-gray-700 p-2">Date Taken</th>
                            <th className="border border-gray-700 p-2">Notes</th>
                            <th className="border border-gray-700 p-2">Care Giver</th>
                            <th className="border border-gray-700 p-2">Facility Name</th>
                            <th className="border border-gray-700 p-2">Branch Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUpdates.map((update, index) => {
                            const isFirstOccurrence = patientNameCounts[update.patientName] !== 0;
                            const rowSpan = isFirstOccurrence ? patientNameCounts[update.patientName] : 1;
                            if (isFirstOccurrence) {
                                patientNameCounts[update.patientName] = 0;
                            }

                            return (
                                <tr key={update.updateId} className="odd:bg-gray-800 even:bg-gray-700">
                                    {isFirstOccurrence && (
                                        <td className="border border-gray-700 p-2 text-center" rowSpan={rowSpan}>
                                            {update.patientName}
                                        </td>
                                    )}
                                    <td className="border border-gray-700 p-2 text-center">{update.dateTaken}</td>
                                    <td className="border border-gray-700 p-2">{update.notes}</td>
                                    <td className="border border-gray-700 p-2">{update.careGiverName}</td>
                                    <td className="border border-gray-700 p-2">{update.facilityName}</td>
                                    <td className="border border-gray-700 p-2">{update.branchName}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Updates;
