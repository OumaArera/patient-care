import React, { useState } from "react";
import dayjs from "dayjs";
import { postMedications } from "../services/postMedications";
import { errorHandler } from "../services/errorHandler";

const MedAdmin = ({ meds, selectedPatient }) => {
    const [loading, setLoading] = useState(null);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState("");

    const isTimeWithinRange = (time, instructions) => {
        if (instructions === "PRN") return true;
        const now = dayjs();
        const scheduledTime = dayjs().hour(time.split(":")[0]).minute(time.split(":")[1]);
        return now.isAfter(scheduledTime.subtract(1, "hour")) && now.isBefore(scheduledTime.add(1, "hour"));
    };

    const handleSubmit = async (medicationId) => {
        setLoading(medicationId);
        const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
        const payload = {
            medication: medicationId,
            patient: selectedPatient,
            timeAdministered: time,
        };
        try {
            const response = await postMedications(payload);
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 10000);
            } else {
                setMessage("Medication administered successfully.");
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (error) {
            setErrors(["Failed to submit medication."]);
            setTimeout(() => setErrors([]), 10000);
        } finally {
            setLoading(null); 
        }
    };
    

    const filteredMeds = meds.filter(med => med.status !== "removed");

    return (
        <div className="grid gap-4 p-4 bg-gray-900 text-white">
            {errors.length > 0 && (
                <div className="mb-4 p-3 bg-white rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                </div>
            )}
            {message && <p className="text-green-600">{message}</p>}
            {filteredMeds.map((med) => (
                <div key={med.medicationId} className="border border-gray-700 rounded-lg p-4 shadow-md bg-gray-800">
                    
                    <div className="mb-2">
                        <h2 className="text-lg font-semibold">{med.medicationName} ({med.medicationCode})</h2>
                        <p className="text-sm text-gray-400">Resident: {med.patientFirstName} {med.patientLastName}</p>
                    </div>
                    <div>
                        <p><strong>Instructions:</strong> {med.instructions}</p>
                        <p><strong>Quantity:</strong> {med.quantity}</p>
                        <p><strong>Diagnosis:</strong> {med.diagnosis}</p>
                        <p className="text-sm font-semibold mt-2">
                            Status:{" "}
                            <span
                                className={`px-2 py-1 rounded text-xs font-bold 
                                    ${med.status === "active" ? "bg-green-500 text-white" : ""} 
                                    ${med.status === "paused" ? "bg-yellow-500 text-gray-900" : ""} 
                                    ${med.status === "removed" ? "bg-red-500 text-white" : ""}`}
                                >
                                {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
                            </span>
                        </p>
                    </div>
                    <div className="mt-2 space-y-2">
                        {med.instructions === "PRN" ? (
                            <button
                                className="px-4 py-2 rounded w-40 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleSubmit(med.medicationId)}
                                disabled={loading === med.medicationId}
                            >
                                {loading === med.medicationId ? "Submitting..." : "Administer"}
                            </button>
                        ) : (
                            med.medicationTime.map((time) => (
                                <div key={time} className="flex items-center gap-4">
                                    <p className="w-20">{time}</p>
                                    {med.status === "active" && (
                                        <div>
                                        {message && <p className="text-green-600">{message}</p>}
                                        <button
                                            className={`px-4 py-2 rounded w-40 ${
                                                isTimeWithinRange(time, med.instructions)
                                                    ? "bg-blue-600 hover:bg-blue-700"
                                                    : "bg-gray-500 cursor-not-allowed"
                                            }`}
                                            onClick={() => handleSubmit(med.medicationId, time)}
                                            disabled={!isTimeWithinRange(time, med.instructions) || loading === med.medicationId}
                                        >
                                            {loading === med.medicationId ? "Submitting..." : "Administer"}
                                        </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MedAdmin;
