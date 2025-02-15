import React, { useState } from "react";
import dayjs from "dayjs";

const MedAdmin = ({ meds, onClose }) => {
    const today = dayjs().format("YYYY-MM-DD");
    const [adminData, setAdminData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);
    const [lateReason, setLateReason] = useState("");

    const handleStatusChange = (medicationId, medicationTime, status) => {
        setAdminData((prev) => {
            const updatedData = prev.filter(
                (entry) => !(entry.medicationId === medicationId && entry.medicationTime === medicationTime)
            );
            return [...updatedData, { medicationId, medicationTime, status }];
        });
    };

    const isFutureTime = (time) => {
        return dayjs(`${selectedDate} ${time}`).isAfter(dayjs());
    };

    const handleSubmit = (medicationId) => {
        const submission = adminData.filter((entry) => entry.medicationId === medicationId);
        console.log("Submitting data:", submission);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 text-white w-11/12 max-w-3xl p-6 rounded-lg shadow-lg relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <button 
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div className="grid gap-4">
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
                                value={lateReason}
                                onChange={(e) => setLateReason(e.target.value)}
                                placeholder="Enter reason for late filing"
                                className="mt-1 border border-gray-600 p-2 rounded bg-gray-800 text-white w-full"
                            />
                        </div>
                    )}

                    {meds.map((med) => (
                        <div key={med.medicationId} className="border border-gray-700 rounded-lg p-4 shadow-md bg-gray-800">
                            <div className="mb-2">
                                <h2 className="text-lg font-semibold">{med.medicationName} ({med.medicationCode})</h2>
                                <p className="text-sm text-gray-400">Patient: {med.patientFirstName} {med.patientLastName}</p>
                            </div>
                            <div>
                                <p><strong>Instructions:</strong> {med.instructions}</p>
                                <p><strong>Quantity:</strong> {med.quantity}</p>
                                <p><strong>Diagnosis:</strong> {med.diagnosis}</p>
                            </div>
                            <div className="mt-2 space-y-2">
                                {med.medicationTime.map((time) => (
                                    <div key={time} className="flex items-center gap-4">
                                        <p className="w-20">{time}</p>
                                        <select
                                            className="border border-gray-600 p-2 rounded bg-gray-700 text-white w-40"
                                            value={adminData.find(entry => entry.medicationId === med.medicationId && entry.medicationTime === time)?.status || ""}
                                            onChange={(e) => handleStatusChange(med.medicationId, time, e.target.value)}
                                            disabled={isFutureTime(time)}
                                        >
                                            <option value="">Select status</option>
                                            <option value="administered">Administered</option>
                                            <option value="not-administered">Not Administered</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-gray-500"
                                onClick={() => handleSubmit(med.medicationId)}
                                disabled={med.medicationTime.some((time) => isFutureTime(time))}
                            >
                                Submit
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MedAdmin;
