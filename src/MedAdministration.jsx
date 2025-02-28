import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getMedicationAdmininstration } from "../services/getMedicationAdministration";
import { Loader } from "lucide-react";
import moment from "moment-timezone";
import ResubmitMedAdmin from "./ResubmitMedAdmin";
import { generateMedicationPDFReport } from "../services/generateMedReport";
import { fetchMedications } from "../services/fetchMedications";

const MedAdministration = () => {
    const [patients, setPatients] = useState([]);
    const [medAdmins, setMedAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [error, setError] = useState("");
    const [showResubmit, setShowResubmit] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [medications, setMedications] = useState([]);
    const [showMedicationModal, setShowMedicationModal] = useState(false);
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
        
        // Fetch medication administration data
        getMedicationAdmininstration(patientId)
            .then((data) => {
                setMedAdmins(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

        // Fetch available medications for the patient
        fetchMedications(1, 366, patientId)
            .then((data) => {
                setMedications(data.responseObject || []);
            })
            .catch(() => setMedications([]));
    };
    const closeResubmitModal = () => {
        setShowResubmit(false);
        setSelectedData(null);
    };

    const dailyTimeline = medAdmins.reduce((acc, admin) => {
        const { medication, timeAdministered } = admin;
        const administeredMoment = moment.utc(timeAdministered).tz("Africa/Nairobi");
        const administeredDay = administeredMoment.format("YYYY-MM-DD");

        if (!acc[administeredDay]) {
            acc[administeredDay] = {};
        }

        if (!acc[administeredDay][medication.medicationId]) {
            acc[administeredDay][medication.medicationId] = {
                details: { ...medication },
                timesAdministered: [],
            };
        }

        acc[administeredDay][medication.medicationId].timesAdministered.push(administeredMoment.format("HH:mm"));

        return acc;
    }, {});

    const days = Object.entries(dailyTimeline).sort((a, b) => moment(b[0]).diff(moment(a[0])));
    const itemsPerPage = 2;
    const pageCount = Math.ceil(days.length / itemsPerPage);
    const displayedDays = days.slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage);

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
            {medications &&(
                <>
                <h3 className="text-xl font-bold text-white mb-4">Select Medication</h3>
                <select
                    className="w-full p-2 bg-gray-700 text-white rounded"
                    onChange={(e) => setSelectedData(e.target.value)}
                >
                    <option value="">-- Select Medication --</option>
                    {medications.map((med) => (
                        <option key={med.medicationId} value={med.medicationId}>
                            {med.medicationName} - {med.instructions}
                        </option>
                    ))}
                </select>
                </>
            )}
            {selectedPatient && medications.length > 0 && selectedData && (
                <button 
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                        setSelectedData({ patientId: selectedPatient, medicationId: selectedData });
                        setShowResubmit(true);
                    }}
                >
                    ➕ Add Medication
                </button>
            )}
            {medAdmins && selectedPatient &&(
                <button 
                className="mb-4 mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => generateMedicationPDFReport(medAdmins)}
            >
                Download Medications
            </button>
            )}

            <div className="bg-gray-800 rounded-lg shadow-lg p-4 max-w-[78vw] w-full">
                <div className="overflow-auto max-h-[500px] w-full">
                    {displayedDays.map(([day, medications]) => (
                        <div key={day} className="mb-6 border-b border-gray-700 pb-4">
                            <h3 className="text-xl font-bold text-blue-300 mb-3">📅 {moment(day).format("MMMM D, YYYY")}</h3>
                            <div className="space-y-4">
                                {Object.values(medications).map((med, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-4 items-start p-3 bg-gray-700 rounded-lg shadow">
                                        <div>
                                            <p className="font-bold text-white">{med.details.medicationName}</p>
                                            <p className="text-gray-400">Code: {med.details.medicationCode}</p>
                                            <p className="text-gray-400">Equivalent to: {med.details.equivalentTo}</p>
                                            <p className="text-gray-400">Instructions: {med.details.instructions}</p>
                                            <p className="text-gray-400">Quantity: {med.details.quantity}</p>
                                            <p className="text-gray-400">Diagnosis: {med.details.diagnosis}</p>
                                            <div className="bg-gray-600 p-2 rounded-lg mt-2">
                                                <h4 className="font-bold text-white mb-1">Medication Times:</h4>
                                                {med.details.medicationTimes.map((time, i) => (
                                                    <p key={i} className="text-gray-300">{time}</p>
                                                ))}
                                            </div>
                                            
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white mb-2">Time Administered</h4>
                                            <div className="space-y-1">
                                                {med.timesAdministered.map((time, idx) => (
                                                    <div key={idx} className="text-gray-300">✅ {time}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                        className={`px-4 py-2 rounded ${currentPage === 0 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1))}
                        disabled={currentPage === pageCount - 1}
                        className={`px-4 py-2 rounded ${currentPage === pageCount - 1 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                    >
                        Next
                    </button>
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
                        <h3 className="text-xl font-bold text-white mb-4">Submit Medication</h3>
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