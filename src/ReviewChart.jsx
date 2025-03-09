import React, { useState } from "react";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const URL = "https://patient-care-server.onrender.com/api/v1/charts";

const ReviewChart = ({ chart, handleGetCharts }) => {
    const [status, setStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    const handleSubmit = async () => {
        const payload = {
        status,
        chartId: chart.chartId,
        };

        const updatedUrl = `${URL}/${chart.chartId}`;
        try {
            const response = await updateData(updatedUrl, payload);
                
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Data updated successfully");
                setReasonEdited("");
                setTimeout(() => handleGetCharts(chart.patientId), 5000);
                setTimeout(() => setMessage(""), 5000);
            }
            
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-4">Review Chart</h2>
        <p><strong>Patient:</strong> {chart.patientName}</p>
        <p><strong>Caregiver:</strong> {chart.careGiver}</p>
        <p><strong>Branch:</strong> {chart.branchName}</p>
        <p><strong>Status:</strong> {chart.status}</p>

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
        {errors.length > 0 && (
            <div className="mb-4 p-3 rounded">
                {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
                ))}
            </div>
            )}
        {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
        <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            onClick={handleSubmit}
            disabled={!status}
        >
            {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        </div>
    );
};

export default ReviewChart;