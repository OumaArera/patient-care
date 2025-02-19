import React, { useState } from "react";
import { postMedications } from "../services/postMedications";
import { errorHandler } from "../services/errorHandler";

const ResubmitMedAdmin = ({ patient, medication, fetchMedAdmin}) => {
    const [administeredTime, setAdministeredTime] = useState("");
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!patient || !medication || administeredTime) return;
        setLoading(true);
        const resubmissionData = {
            patient,
            medication,
            administeredTime,
        };
        console.log("Resubmission Data:", resubmissionData);
        try {
            const response = await postMedications(resubmissionData);
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 10000);
            } else {
                setMessage("Medication administered successfully.");
                setTimeout(() => fetchMedAdmin(patient), 5000);
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (error) {
            setErrors(["Failed to submit medication."]);
            setTimeout(() => setErrors([]), 10000);
        } finally {
            setLoading(false);
        }
        
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Resubmit Medication Administration</h2>

            <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">

                <div className="mb-4">
                    <label className="block font-semibold mb-2">Date & Time Administered:</label>
                    <input
                        type="datetime-local"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={administeredTime}
                        onChange={(e) => setAdministeredTime(e.target.value)}
                    />
                </div>

                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
                    onClick={handleSubmit}
                >
                    {loading? "Submitting...": "Submit"}
                </button>
                {errors.length > 0 && (
                    <div className="mb-4 p-3 bg-white rounded">
                        {errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-600">{error}</p>
                        ))}
                    </div>
                )}
                {message && <p className="text-green-600">{message}</p>}
            </div>
        </div>
    );
};

export default ResubmitMedAdmin;
