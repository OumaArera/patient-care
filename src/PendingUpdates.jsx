import React, { useEffect, useState } from "react";
import { getUpdates } from "../services/getUpdates";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";

const PendingUpdates = ({ patient }) => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editedNotes, setEditedNotes] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        fetchUpdates();
    }, [patient]);

    const fetchUpdates = () => {
        setLoading(true);
        getUpdates(patient)
            .then((data) => {
                const filteredUpdates = data?.responseObject?.filter(update => update.status !== "approved") || [];
                setUpdates(filteredUpdates);
            })
            .catch(() => {
                setUpdates([]);
            })
            .finally(() => setLoading(false));
    };

    const handleEditChange = (updateId, value) => {
        setEditedNotes((prev) => ({ ...prev, [updateId]: value }));
    };

    const handleUpdate = (updateId) => {
        const updatedNote = editedNotes[updateId];
        if (!updatedNote) return;

        const payload = {
            updateId,
            notes: updatedNote
        };

        setIsSubmitting(true);
        updateData(payload)
            .then(() => {
                setMessage("Update successful.");
                fetchUpdates();
            })
            .catch((err) => {
                setErrors(errorHandler(err));
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">Pending Updates</h2>
            {loading ? (
                <Loader className="animate-spin" />
            ) : updates.length === 0 ? (
                <p>No pending updates.</p>
            ) : (
                <div className="space-y-4">
                    {updates.map((update) => (
                        <div key={update.updateId} className="border p-4 rounded-md shadow">
                            <p><strong>Resident:</strong> {update.patientName}</p>
                            <p><strong>Type:</strong> {update.type}</p>
                            <p><strong>Branch:</strong> {update.branchName}</p>
                            <p><strong>Notes:</strong></p>
                            {update.status === "declined" ? (
                                <textarea
                                    className="w-full border p-2 rounded"
                                    value={editedNotes[update.updateId] || update.notes}
                                    onChange={(e) => handleEditChange(update.updateId, e.target.value)}
                                />
                            ) : (
                                <p className="bg-gray-100 text-black p-2 rounded">{update.notes}</p>
                            )}
                            {update.status === "declined" && (
                                <button
                                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={() => handleUpdate(update.updateId)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Updating..." : "Submit Update"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {message && <p className="text-green-500">{message}</p>}
            {errors.length > 0 && <p className="text-red-500">{errors.join(", ")}</p>}
        </div>
    );
};

export default PendingUpdates;
