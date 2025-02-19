import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getMedicationAdmininstration } from "../services/getMedicationAdministration";
import { Loader } from "lucide-react";
import moment from "moment-timezone";
import ResubmitMedAdmin from "./ResubmitMedAdmin";

const MedAdministration = () => {
    const [patients, setPatients] = useState([]);
    const [medAdmins, setMedAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [error, setError] = useState("");
    const [showResubmit, setShowResubmit] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchPatients()
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch residents.");
                setTimeout(() => setError(""), 10000);
                setLoading(false);
            });
    }, []);

    const fetchMedAdmin = (patientId) => {
        setLoading(true);
        setSelectedPatient(patientId);
        getMedicationAdmininstration(patientId)
            .then((data) => {
                setMedAdmins(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const openResubmitModal = (patientId, medicationId) => {
        setSelectedData({ patientId, medicationId });
        setShowResubmit(true);
    };

    const closeResubmitModal = () => {
        setShowResubmit(false);
        setSelectedData(null);
    };
    

    const groupedMedications = medAdmins.reduce((acc, admin) => {
        const { medication, timeAdministered } = admin;
        const dateAdministered = moment.utc(timeAdministered).tz("Africa/Nairobi").format("D");
        const timeGiven = moment.utc(timeAdministered).tz("Africa/Nairobi");

        if (!acc[medication.medicationId]) {
            acc[medication.medicationId] = {
                name: medication.medicationName,
                medicationId: medication.medicationId,
                times: medication.medicationTimes,
                records: {},
            };
        }

        medication.medicationTimes.forEach((medTime) => {
            const scheduledTime = moment.tz(medTime, "HH:mm", "Africa/Nairobi");
            const startTime = scheduledTime.clone().subtract(1, "hour");
            const endTime = scheduledTime.clone().add(1, "hour");

            if (timeGiven.isBetween(startTime, endTime)) {
                if (!acc[medication.medicationId].records[dateAdministered]) {
                    acc[medication.medicationId].records[dateAdministered] = {};
                }
                acc[medication.medicationId].records[dateAdministered][medTime] = timeGiven.format("HH:mm");
            }
        });

        return acc;
    }, {});

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Medication Administration</h2>

            {error && <div className="bg-red-500 text-white p-3 mb-3 rounded">{error}</div>}

            <div className="mb-4 w-full max-w-[90vw]">
                {loading && (
                    <div className="flex items-center space-x-2">
                        <Loader className="animate-spin text-gray-500" size={20} />
                        <p className="text-gray-500">Loading...</p>
                    </div>
                )}
                <label className="font-semibold">Select Resident: </label>
                <select
                    className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded"
                    onChange={(e) => fetchMedAdmin(e.target.value)}
                    value={selectedPatient || ""}
                >
                    <option value="">-- Select --</option>
                    {patients.map((p) => (
                        <option key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-4 max-w-[78vw] w-full">
                <div className="overflow-auto max-h-[500px] w-full">
                    <table className="table-auto border-collapse border border-gray-700 w-full text-sm">
                        <thead className="sticky top-0 bg-gray-800">
                            <tr>
                                <th className="border border-gray-700 px-4 py-2">Medication Name</th>
                                <th className="border border-gray-700 px-4 py-2">Times</th>
                                {[...Array(31)].map((_, i) => (
                                    <th key={i} className="border border-gray-700 px-2 py-1 text-center">{i + 1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(groupedMedications).map((med, index) => (
                                <React.Fragment key={index}>
                                    {med.times.map((time, i) => (
                                        <tr key={`${med.name}-${i}`} className="text-center">
                                            {i === 0 && (
                                                <td rowSpan={med.times.length} className="border border-gray-700 px-4 py-2 font-bold bg-gray-800">
                                                    {med.name}
                                                </td>
                                            )}
                                            <td className="border border-gray-700 px-4 py-2 bg-gray-700">{time}</td>
                                            {[...Array(31)].map((_, day) => {
                                                const administeredTime = med.records[day + 1]?.[time];
                                                return (
                                                    <td key={day} className="border border-gray-700 px-2 py-1">
                                                        {administeredTime ? (
                                                            <span className="text-green-400">Administered at {administeredTime}</span>
                                                        ) : (
                                                            <button
                                                                className="bg-red-800 text-white px-2 py-1 rounded"
                                                                onClick={() => {
                                                                    setShowResubmit(true);
                                                                    setSelectedData({ patientId: selectedPatient, medicationId: med.medicationId });
                                                                }}
                                                            >
                                                                Pending
                                                            </button>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Resubmit Overlay */}
            {showResubmit && selectedData && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    onClick={closeResubmitModal}
                >
                    <div
                        className="bg-gray-800 p-6 rounded-lg shadow-lg"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Resubmit Medication</h3>
                        <ResubmitMedAdmin patient={selectedData.patientId} medication={selectedData.medicationId} />
                        <button
                            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
                            onClick={closeResubmitModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MedAdministration;
