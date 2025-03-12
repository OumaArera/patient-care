import { useState } from "react";
import { updateData } from "../services/updatedata";

const URL = "https://patient-care-server.onrender.com/api/v1/updates";

const ReviewUpdate = ({ update }) => {
    const [status, setStatus] = useState("");
    const [declineReason, setDeclineReason] = useState("");

    const handleSubmit = () => {
        console.log({
            updateId: update.updateId,
            status,
            declineReason: status === "declined" ? declineReason : undefined,
        });
    };

    return (
        <div className="p-4 border rounded-lg shadow-md w-96">
            <h2 className="text-lg font-semibold">Review Update</h2>
            <p><strong>Patient:</strong> {update.patientName}</p>
            <p><strong>Notes:</strong> {update.notes}</p>
            
            <label className="block mt-2 font-medium">Status:</label>
            <select
                className="w-full p-2 border rounded"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="">Select Status</option>
                <option value="approved">Approve</option>
                <option value="declined">Decline</option>
            </select>

            {status === "declined" && (
                <div className="mt-2">
                    <label className="block font-medium">Reason for Decline:</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows="3"
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                    ></textarea>
                </div>
            )}

            <button
                className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                onClick={handleSubmit}
            >
                Submit
            </button>
        </div>
    );
};

export default ReviewUpdate;
