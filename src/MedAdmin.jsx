import React, { useState } from "react";
import dayjs from "dayjs";
import { postMedications } from "../services/postMedications";
import { errorHandler } from "../services/errorHandler";

const MedAdmin = ({ meds, selectedPatient }) => {
    const [loading, setLoading] = useState(null);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState("");

    const isTimeWithinRange = (time) => {
        const now = dayjs();
        const scheduledTime = dayjs().hour(time.split(":")[0]).minute(time.split(":")[1]);
        return now.isAfter(scheduledTime.subtract(1, 'hour')) && now.isBefore(scheduledTime.add(1, 'hour'));
    };

    const handleSubmit = async (medicationId, medicationTime) => {
        setLoading(medicationTime);
        const payload = {
            medication: medicationId,
            patient: selectedPatient,
            timeAdministered: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };
        try {
            const response = await postMedications(payload);
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Medication administered successfully.");
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (error) {
            setErrors(["Failed to submit medication."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="grid gap-4 p-4 bg-gray-900 text-white">
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
                        {med.medicationTime.map((time) => (
                            <div key={time} className="flex items-center gap-4">
                                <p className="w-20">{time}</p>
                                <button
                                    className={`px-4 py-2 rounded w-40 ${isTimeWithinRange(time) ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 cursor-not-allowed"}`}
                                    onClick={() => handleSubmit(med.medicationId, time)}
                                    disabled={!isTimeWithinRange(time) || loading === time}
                                >
                                    {loading === time ? "Submitting..." : "Administer"}
                                </button>
                            </div>
                        ))}
                    </div>
                    {errors.length > 0 && (
                        <div className="mb-4 p-3 bg-white rounded">
                            {errors.map((error, index) => (
                                <p key={index} className="text-sm text-red-600">{error}</p>
                            ))}
                        </div>
                    )}
                    {message && <p className="text-green-600">{message}</p>}
                </div>
            ))}
        </div>
    );
};

export default MedAdmin;
