import React, { useEffect, useState } from "react";
import { getData } from "../services/updatedata";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const URL = "https://patient-care-server.onrender.com/api/v1/leaves";

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState({});
    const [declineReasons, setDeclineReasons] = useState({});
    const [filterStatus, setFilterStatus] = useState("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    const getLeaves = () => {
        setLoading(true);
        getData(URL)
        .then((data) => {
            const sortedLeaves = (data?.responseObject || []).sort((a, b) => {
            const order = { pending: 1, approved: 2, declined: 3 };
            return order[a.status] - order[b.status];
            });
            setLeaves(sortedLeaves);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        getLeaves();
    }, []);

    const handleStatusChange = (leaveId, status) => {
        setAction({ ...action, [leaveId]: status });

        if (status !== "declined") {
        setDeclineReasons({ ...declineReasons, [leaveId]: "" });
        }
    };

    const handleDeclineReasonChange = (leaveId, reason) => {
        setDeclineReasons({ ...declineReasons, [leaveId]: reason });
    };

    const handleSubmit =async (leaveId) => {
        setIsSubmitting(true);
        const payload = {
        leaveId,
        status: action[leaveId],
        declineReason: action[leaveId] === "declined" ? declineReasons[leaveId] : null,
        };
        console.log("Data: ", payload);
        const updatedURL = `${URL}/${leaveId}`
        try {
            const response = await updateData(updatedURL, payload);
                
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Data updated successfully");
                setTimeout(() => getLeaves(), 5000);
                setTimeout(() => setMessage(""), 5000);
            }
            
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US");
    };

    // Filter leaves based on the selected status
    const filteredLeaves =
        filterStatus === "all"
        ? leaves
        : leaves.filter((leave) => leave.status === filterStatus);

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-blue-500 mb-4">Leave Management</h2>

        {/* Dropdown Filter */}
        <div className="mb-4">
            <label className="block text-gray-300 mb-2">Filter by Status:</label>
            <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded w-full"
            >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            </select>
        </div>

        {loading ? (
            <p className="text-gray-400">Loading...</p>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full border border-gray-700 text-left">
                <thead className="bg-gray-800">
                <tr>
                    <th className="p-2 border border-gray-700">Staff</th>
                    <th className="p-2 border border-gray-700">Start Date</th>
                    <th className="p-2 border border-gray-700">End Date</th>
                    <th className="p-2 border border-gray-700">Reason</th>
                    <th className="p-2 border border-gray-700">Status</th>
                    <th className="p-2 border border-gray-700">Decline Reason</th>
                    <th className="p-2 border border-gray-700">Action</th>
                </tr>
                </thead>
                <tbody>
                {filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => (
                    <tr key={leave.leaveId} className="border-gray-700">
                        <td className="p-2 border border-gray-700">{leave.staffName}</td>
                        <td className="p-2 border border-gray-700">{formatDate(leave.startDate)}</td>
                        <td className="p-2 border border-gray-700">{formatDate(leave.endDate)}</td>
                        <td className="p-2 border border-gray-700">{leave.reasonForLeave}</td>
                        <td className="p-2 border border-gray-700">{leave.status}</td>
                        <td className="p-2 border border-gray-700">{leave.declineReason || "-"}</td>
                        <td className="p-2 border border-gray-700">
                        {!action[leave.leaveId] ? (
                            <button
                            onClick={() => setAction({ ...action, [leave.leaveId]: "pending" })}
                            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                            >
                            Take Action
                            </button>
                        ) : (
                            <div className="space-y-2">
                            <select
                                value={action[leave.leaveId]}
                                onChange={(e) => handleStatusChange(leave.leaveId, e.target.value)}
                                className="bg-gray-800 text-white p-1 rounded w-full"
                            >
                                <option value="approved">Approve</option>
                                <option value="declined">Decline</option>
                            </select>

                            {action[leave.leaveId] === "declined" && (
                                <textarea
                                value={declineReasons[leave.leaveId] || ""}
                                onChange={(e) => handleDeclineReasonChange(leave.leaveId, e.target.value)}
                                placeholder="Enter decline reason..."
                                className="bg-gray-800 text-white p-1 rounded w-full h-16"
                                />
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
                                onClick={() => handleSubmit(leave.leaveId)}
                                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 w-full"
                            >
                                {isSubmitting? "Submitting": "Submit"}
                            </button>
                            </div>
                        )}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-400">
                        No records found.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
        </div>
    );
};

export default LeaveManagement;
