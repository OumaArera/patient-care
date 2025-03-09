import React, { useState } from "react";

const ReviewVitals = ({ vital, handleVitals }) => {
    const [status, setStatus] = useState("");
    const [declineReason, setDeclineReason] = useState("");

    const handleSubmit = () => {
        const payload = {
            vitalId: vital.vitalId,
            status,
            declineReason: status === "declined" ? declineReason : null,
        };
        console.log("Submitting Payload:", payload);
        handleVitals(vital.patientId);
    };

    return (
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-4">Review Vitals</h2>
            <p><strong>Resident:</strong> {vital.patientName}</p>
            <p><strong>Blood Pressure:</strong> {vital.bloodPressure}</p>
            <p><strong>Temperature:</strong> {vital.temperature}</p>
            <p><strong>Pulse:</strong> {vital.pulse}</p>
            <p><strong>Oxygen Saturation:</strong> {vital.oxygenSaturation}</p>
            <p><strong>Pain:</strong> {vital.pain}</p>
            <p><strong>Status:</strong> {vital.status}</p>

            <label className="block mt-4">Select Status:</label>
            <select
                className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="">Select</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
            </select>

            {status === "declined" && (
                <div className="mt-4">
                    <label className="block">Reason for Declining:</label>
                    <input
                        type="text"
                        className="w-full p-2 mt-1 bg-gray-700 text-white rounded"
                        value={declineReason}
                        placeholder="Typereason for decline..."
                        onChange={(e) => setDeclineReason(e.target.value)}
                    />
                </div>
            )}

            <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                onClick={handleSubmit}
                disabled={!status || (status === "declined" && !declineReason)}
            >
                Submit
            </button>
        </div>
    );
};

export default ReviewVitals;
