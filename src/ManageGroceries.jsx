import React, { useEffect, useState } from "react";
import { getData } from "../services/updatedata";
import { updateData } from "../services/updatedata";  // Import update function
import { errorHandler } from "../services/errorHandler";

const GROCERIES_URL = "https://patient-care-server.onrender.com/api/v1/groceries";

const ManageGroceries = () => {
    const [groceries, setGroceries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterDate, setFilterDate] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        getGroceries();
    }, []);

    const getGroceries = () => {
        setLoading(true);
        getData(GROCERIES_URL)
            .then((data) => {
                setGroceries(data?.responseObject || []);
            })
            .catch(() => setGroceries([]))
            .finally(() => setLoading(false));
    };

    const handleStatusChange = (groceryId, newStatus) => {
        setGroceries(groceries.map(grocery =>
            grocery.groceryId === groceryId ? { ...grocery, status: newStatus } : grocery
        ));
        handleUpdate(groceryId, newStatus);
    };

    const handleUpdate = async (groceryId, newStatus) => {
        if (!newStatus) return;

        setIsSubmitting(true);
        const payload = { status: newStatus };
        const updatedURL = `${GROCERIES_URL}/${groceryId}`;

        try {
            const response = await updateData(updatedURL, payload);
            if (response?.error) {
                setErrors(errorHandler(response.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Status updated successfully");
                setTimeout(() => setMessage(""), 5000);
                getGroceries(); 
            }
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg w-full max-w-6xl mx-auto shadow-lg">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Manage Groceries</h2>

            <div className="flex flex-wrap gap-4 mb-4">
                <input
                    type="date"
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Filter by Branch"
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                />
                <select
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            {loading ? (
                <p className="text-center text-blue-400">Loading...</p>
            ) : (
                <table className="w-full border border-gray-700 text-left">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-2 border border-gray-700">Date</th>
                            <th className="p-2 border border-gray-700">Branch</th>
                            <th className="p-2 border border-gray-700">Items</th>
                            <th className="p-2 border border-gray-700">Feedback</th>
                            <th className="p-2 border border-gray-700">Status</th>
                            <th className="p-2 border border-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groceries.map((grocery) => (
                            <tr key={grocery.groceryId} className="border-gray-700">
                                <td className="p-2 border border-gray-700">
                                    {new Date(grocery.createdAt).toLocaleDateString("en-US")}
                                </td>
                                <td className="p-2 border border-gray-700">{grocery.branch}</td>
                                <td className="p-2 border border-gray-700">
                                    <ul>
                                        {grocery.details.map((detail, index) => (
                                            <li key={index}>{detail.item} ({detail.quantity})</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="p-2 border border-gray-700">{grocery.feedback || "-"}</td>
                                <td className="p-2 border border-gray-700">{grocery.status}</td>
                                <td className="p-2 border border-gray-700">
                                    {grocery.status !== "delivered" && (
                                        <select
                                            className="p-1 bg-gray-700 text-white rounded"
                                            onChange={(e) => handleStatusChange(grocery.groceryId, e.target.value)}
                                        >
                                            <option value="">Review</option>
                                            <option value="approved">Approved</option>
                                            <option value="declined">Declined</option>
                                            <option value="delivered">Delivered</option>
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {message && <p className="text-green-400 mt-4">{message}</p>}
            {errors.length > 0 && (
                <ul className="text-red-400 mt-4">
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageGroceries;
