import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getMedicationAdmininstration } from "../services/getMedicationAdministration";
import { Loader } from "lucide-react";
import moment from "moment-timezone";
import ResubmitMedAdmin from "./ResubmitMedAdmin";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const MedAdministration = () => {
    const [patients, setPatients] = useState([]);
    const [medAdmins, setMedAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [error, setError] = useState("");
    const [showResubmit, setShowResubmit] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

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

    const filteredMedications = selectedMedication
        ? medAdmins.filter(admin => admin.medication.medicationId === selectedMedication)
        : [];

    const groupedByDate = filteredMedications.reduce((acc, admin) => {
        const administeredMoment = moment.utc(admin.timeAdministered).tz("Africa/Nairobi");
        const dateKey = administeredMoment.format("YYYY-MM-DD");

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(admin);

        return acc;
    }, {});

    const tileClassName = ({ date }) => {
        const dateKey = moment(date).format("YYYY-MM-DD");
        return groupedByDate[dateKey] ? "bg-green-600 text-white" : "bg-red-600 text-white";
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Medication Administration</h2>
            {error && <div className="bg-red-500 text-white p-3 mb-3 rounded">{error}</div>}

            <div className="mb-4 w-full max-w-[90vw]">
                {loading && <Loader className="animate-spin text-gray-500" size={20} />}
                <label className="font-semibold">Select Resident: </label>
                <select
                    className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded"
                    onChange={(e) => fetchMedAdmin(e.target.value)}
                    value={selectedPatient || ""}
                >
                    <option value="">-- Select --</option>
                    {patients.map((p) => (
                        <option key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="font-semibold">Select Medication: </label>
                <select
                    className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded"
                    onChange={(e) => setSelectedMedication(e.target.value)}
                    value={selectedMedication || ""}
                >
                    <option value="">-- Select --</option>
                    {[...new Set(medAdmins.map(admin => admin.medication.medicationId))].map(medId => {
                        const med = medAdmins.find(admin => admin.medication.medicationId === medId);
                        return <option key={medId} value={medId}>{med.medication.medicationName}</option>;
                    })}
                </select>
            </div>

            {selectedMedication && filteredMedications.length > 0 && (
                <div className="mb-6 w-full max-w-[90vw] bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-blue-300 mb-3">Medication Details</h3>
                    <p><strong>Name:</strong> {filteredMedications[0].medication.medicationName}</p>
                    <p><strong>Instructions:</strong> {filteredMedications[0].medication.instructions}</p>
                    <p><strong>Diagnosis:</strong> {filteredMedications[0].medication.diagnosis}</p>
                    <p><strong>Scheduled Times:</strong> {filteredMedications[0].medication.medicationTimes.join(", ")}</p>
                </div>
            )}

            <div className="mb-6">
                <Calendar 
                    className="bg-gray-800 text-white text-xl w-full max-w-[60vw] h-[500px] rounded-lg overflow-hidden shadow-lg"
                    onClickDay={(date) => {
                        const dateKey = moment(date).format("YYYY-MM-DD");
                        setSelectedDate(dateKey);
                        if (groupedByDate[dateKey]) {
                            alert(groupedByDate[dateKey].map(admin => `Administered at ${moment(admin.timeAdministered).format('HH:mm')} by ${admin.careGiverName}`).join("\n"));
                        } else {
                            setShowResubmit(true);
                            setSelectedData({ patientId: selectedPatient, medicationId: selectedMedication });
                        }
                    }}
                    tileClassName={tileClassName}
                />
            </div>

            {showResubmit && selectedData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={closeResubmitModal}>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Resubmit Medication</h3>
                        <ResubmitMedAdmin 
                            patient={selectedData.patientId} 
                            medication={selectedData.medicationId} 
                            fetchMedAdmin={fetchMedAdmin}
                        />
                        <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600" onClick={closeResubmitModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedAdministration;
