import React, { useState } from "react";
import dayjs from "dayjs";

const MedAdmin = ({ meds, selectedPatient }) => {
    const today = dayjs().format("YYYY-MM-DD");
    const [adminData, setAdminData] = useState({});
    const [selectedDate, setSelectedDate] = useState(today);
    const [lateReasons, setLateReasons] = useState(""); // Now a string
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [selectedMedications, setSelectedMedications] = useState([]);
    const [selectedPatientIds, setSelectedPatientIds] = useState([]);

    const handleStatusChange = (medicationId, medicationTime, status) => {
        setAdminData((prev) => ({
            ...prev,
            [`${medicationId}-${medicationTime}`]: { medicationId, medicationTime, status },
        }));

        setSelectedTimes((prev) => [...new Set([...prev, medicationTime])]);

        if (!selectedMedications.includes(medicationId)) {
            setSelectedMedications((prev) => [...prev, medicationId]);
        }
    };

    const handleLateReasonChange = (reason) => {
        setLateReasons(reason); // Now directly updating as a string
    };

    const isFutureTime = (time) => {
        return dayjs(`${selectedDate} ${time}`).isAfter(dayjs());
    };

    const isAllPastTimesSelected = (medicationTimes, medicationId) => {
        return medicationTimes
            .filter((time) => !isFutureTime(time))
            .every((time) => adminData[`${medicationId}-${time}`]?.status);
    };

    const handleSubmit = (medicationId, patientId) => {
        const submission = Object.values(adminData).filter(
            (entry) => entry.medicationId === medicationId
        );

        if (!selectedPatientIds.includes(patientId)) {
            setSelectedPatientIds((prev) => [...prev, patientId]);
        }

        console.log("Submitting Data:");
        console.log("✅ Medication ID:", selectedMedications);
        console.log("✅ Selected Times:", selectedTimes);
        console.log("✅ Patient ID:", selectedPatient);
        console.log("✅ Late Reason:", lateReasons); // Now a simple string
        console.log("✅ Medication Status Data:", submission);
    };

    return (
        <div className="grid gap-4 p-4 bg-gray-900 text-white">
            <div>
                <label className="block font-semibold">Select Date:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 border border-gray-600 p-2 rounded bg-gray-800 text-white w-full"
                />
            </div>

            {dayjs(selectedDate).isBefore(today) && (
                <div>
                    <label className="block font-semibold">Reason for Late Filing:</label>
                    <input
                        type="text"
                        value={lateReasons || ""}
                        onChange={(e) => handleLateReasonChange(e.target.value)}
                        placeholder="Enter reason for late filing"
                        className="mt-1 border border-gray-600 p-2 rounded bg-gray-800 text-white w-full"
                    />
                </div>
            )}

            {meds.map((med) => (
                <div key={med.medicationId} className="border border-gray-700 rounded-lg p-4 shadow-md bg-gray-800">
                    <div className="mb-2">
                        <h2 className="text-lg font-semibold">{med.medicationName} ({med.medicationCode})</h2>
                        <p className="text-sm text-gray-400">Resident: {med.patientFirstName} {med.patientLastName}</p>
                    </div>
                    <div>
                        <p><strong>Instructions:</strong> {med.instructions}</p>
                        <p><strong>Quantity:</strong> {med.quantity}</p>
                        <p><strong>Diagnosis:</strong> {med.diagnosis}</p>
                    </div>

                    <div className="mt-2 space-y-2">
                        {med.medicationTime.map((time) => {
                            const key = `${med.medicationId}-${time}`;
                            return (
                                <div key={time} className="flex items-center gap-4">
                                    <p className="w-20">{time}</p>
                                    <select
                                        className="border border-gray-600 p-2 rounded bg-gray-700 text-white w-40"
                                        value={adminData[key]?.status || ""}
                                        onChange={(e) => handleStatusChange(med.medicationId, time, e.target.value)}
                                        disabled={isFutureTime(time)}
                                    >
                                        <option value="">Select status</option>
                                        <option value="administered">Administered</option>
                                        <option value="not-administered">Not Administered</option>
                                    </select>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-gray-500"
                        onClick={() => handleSubmit(med.medicationId, med.patientId)}
                        disabled={
                            med.medicationTime.some((time) => isFutureTime(time)) ||
                            !isAllPastTimesSelected(med.medicationTime, med.medicationId)
                        }
                    >
                        Submit
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MedAdmin;
