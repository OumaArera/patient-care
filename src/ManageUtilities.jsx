import React, { useEffect, useState } from "react";
import { getData, updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const URL = "https://patient-care-server.onrender.com/api/v1/utilities";

const ManageUtilities = () => {
    const [utilities, setUtilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        fetchUtilities();
    }, []);

    const fetchUtilities = () => {
        setLoading(true);
        getData(URL)
            .then((data) => setUtilities(data))
            .catch(() => setErrors(["Failed to fetch utilities"]))
            .finally(() => setLoading(false));
    };

    const handleStatusChange = (utilityId, status) => {
        setAction({ ...action, [utilityId]: status });
    };

    const handleSubmit = async (utilityId) => {
        setIsSubmitting(true);
        const payload = { utilityId, status: action[utilityId] };
        const updatedURL = `${URL}/${utilityId}`;

        try {
            const response = await updateData(updatedURL, payload);
            if (response?.error) {
                setErrors(errorHandler(response.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Status updated successfully");
                setTimeout(() => fetchUtilities(), 5000);
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
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Manage Utilities</h2>
            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : (
                <table className="w-full border border-gray-700 text-left">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-2 border border-gray-700">Staff Name</th>
                            <th className="p-2 border border-gray-700">Item</th>
                            <th className="p-2 border border-gray-700">Details</th>
                            <th className="p-2 border border-gray-700">Status</th>
                            <th className="p-2 border border-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {utilities.length > 0 ? (
                            utilities.map((utility) => (
                                <tr key={utility.utilityId} className="border-gray-700">
                                    <td className="p-2 border border-gray-700">{utility.staffName}</td>
                                    <td className="p-2 border border-gray-700">{utility.item}</td>
                                    <td className="p-2 border border-gray-700">{utility.details}</td>
                                    <td className="p-2 border border-gray-700">{utility.status}</td>
                                    <td className="p-2 border border-gray-700">
                                        <select
                                            value={action[utility.utilityId] || ""}
                                            onChange={(e) => handleStatusChange(utility.utilityId, e.target.value)}
                                            className="bg-gray-800 text-white p-1 rounded w-full"
                                        >
                                            <option value="" disabled>Select Status</option>
                                            <option value="review">Review</option>
                                            <option value="addressed">Addressed</option>
                                        </select>
                                        <button
                                            onClick={() => handleSubmit(utility.utilityId)}
                                            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 w-full"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-400">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            {errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-600 text-white rounded">
                    {errors.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            )}
            {message && <p className="mt-4 text-blue-400">{message}</p>}
        </div>
    );
};

export default ManageUtilities;
