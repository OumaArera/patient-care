import { useState } from "react";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const URL = "https://patient-care-server.onrender.com/api/v1/updates";

const ReviewUpdate = ({ update, fetchUpdates }) => {
    const [status, setStatus] = useState("");
    const [declineReason, setDeclineReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    const handleSubmit =async () => {
        setIsSubmitting(true);
        const payload ={
            updateId: update.updateId,
            status,
            declineReason: status === "declined" ? declineReason : null,
        }

        const updatedUrl = `${URL}/${update.updateId}`;
        try {
            setIsSubmitting(true);
            const response = await updateData(updatedUrl, payload);
                
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Data updated successfully");
                setDeclineReason("");
                setTimeout(() => fetchUpdates(update.patientId), 5000);
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
        <div className="p-4 border rounded-lg shadow-md w-96">
            <h2 className="text-lg font-semibold">Review Update</h2>
            <p><strong>Resident:</strong> {update.patientName}</p>
            <p><strong>Notes:</strong> {update.notes}</p>
            
            <label className="block mt-2 font-medium">Status:</label>
            <select
                className="w-full bg-gray-900 text-white p-2 border rounded"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="">Select Status</option>
                <option value="approved">Approve</option>
                <option value="declined">Decline</option>
            </select>

            {status === "declined" && (
                <div className="mt-2">
                    <label className="block font-medium">Reason for Decline(Required):</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows="3"
                        placeholder="Enter reason for declining..."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                    ></textarea>
                </div>
            )}

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
                disabled={!status || (status === "declined" && !declineReason.trim())}
            >
                {isSubmitting ? "Submitting..." : "Submit"}
            </button>
        </div>
    );
};

export default ReviewUpdate;
