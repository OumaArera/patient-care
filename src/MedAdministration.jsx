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

    const closeResubmitModal = () => {
        setShowResubmit(false);
        setSelectedData(null);
    };

    const dailyTimeline = medAdmins.reduce((acc, admin) => {
        const { medication, timeAdministered } = admin;
        const administeredMoment = moment.utc(timeAdministered).tz("Africa/Nairobi");
        const administeredDay = administeredMoment.format("YYYY-MM-DD");
        const time = administeredMoment.format("HH:mm");

        if (!acc[administeredDay]) {
            acc[administeredDay] = [];
        }

        acc[administeredDay].push({
            name: medication.medicationName,
            timeScheduled: medication.medicationTimes,
            timeAdministered: time,
            medicationId: medication.medicationId,
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
                    {Object.entries(dailyTimeline).map(([day, medications]) => (
                        <div key={day} className="mb-6 border-b border-gray-700 pb-4">
                            <h3 className="text-xl font-bold text-blue-300 mb-3">📅 {moment(day).format("MMMM D, YYYY")}</h3>
                            <div className="space-y-2">
                                {medications.map((med, index) => (
                                    med.timeScheduled.map((time, idx) => (
                                        <div
                                            key={`${index}-${idx}`}
                                            className="flex justify-between items-center p-3 bg-gray-700 rounded-lg shadow"
                                        >
                                            <div className="flex-1">
                                                <p className="font-bold text-white">{med.name}</p>
                                                <p className="text-gray-400">Scheduled: {time}</p>
                                            </div>
                                            {med.timeAdministered === time ? (
                                                <span className="text-green-400">✅ Administered at {med.timeAdministered}</span>
                                            ) : (
                                                <button
                                                    className="bg-red-800 text-white px-3 py-1 rounded"
                                                    onClick={() => {
                                                        setShowResubmit(true);
                                                        setSelectedData({
                                                            patientId: selectedPatient,
                                                            medicationId: med.medicationId,
                                                        });
                                                    }}
                                                >
                                                    ❌ Missed (Resubmit)
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
                        <ResubmitMedAdmin
                            patient={selectedData.patientId}
                            medication={selectedData.medicationId}
                            fetchMedAdmin={fetchMedAdmin}
                        />
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