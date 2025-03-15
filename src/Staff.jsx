import React, { useEffect, useState } from "react";
import { getData } from "../services/updatedata";
import { createData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const URL = "https://patient-care-server.onrender.com/api/v1/leaves";

const Staff = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reasonForLeave, setReasonForLeave] = useState("");
    const [filter, setFilter] = useState({ pending: true, approved: true, declined: true });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    
    const getLeaves =()=>{
        setLoading(true);
        const staff = localStorage.getItem("userId");
        const queryParams = new URLSearchParams({ staff }).toString();

        getData(`${URL}?${queryParams}`)
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
        getLeaves()
    }, []);

    const handleSubmit =async () => {
        if (new Date(endDate) < new Date(startDate)) {
            setErrors(["End date cannot be before start date."]);
        return;
        }
        setIsSubmitting(true);
        const payload ={ startDate, endDate, reasonForLeave }
        console.log(payload);
        try {
            
            const response = await createData(URL, payload);
                
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Data created successfully");
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

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-blue-500 mb-4">Request Leave</h2>
        
        <div className="space-y-4">
            <div>
            <label className="block text-gray-300">Start Date</label>
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
            />
            </div>

            <div>
            <label className="block text-gray-300">End Date</label>
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
            />
            </div>

            <div>
            <label className="block text-gray-300">Reason for Leave</label>
            <textarea
                value={reasonForLeave}
                onChange={(e) => setReasonForLeave(e.target.value)}
                placeholder="Enter the reason for leave..."
                className="w-full p-2 rounded bg-gray-800 text-white h-24"
                required
            />
            </div>
            {errors.length > 0 && (
                <div className="mb-4 p-3 rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                </div>
            )}

            {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}

            <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
            {isSubmitting ? "Submitting...": "Submit"}
            </button>
        </div>

        <h2 className="text-xl font-bold text-blue-500 mt-6">Leave Records</h2>

        {/* Filters */}
        <div className="flex gap-4 mt-3">
            {["pending", "approved", "declined"].map((status) => (
            <label key={status} className="flex items-center space-x-2 text-gray-300">
                <input
                type="checkbox"
                checked={filter[status]}
                onChange={() => setFilter({ ...filter, [status]: !filter[status] })}
                className="accent-blue-500"
                />
                <span className="capitalize">{status}</span>
            </label>
            ))}
        </div>

        {/* Leave List */}
        {loading ? (
            <p className="text-gray-400 mt-4">Loading...</p>
        ) : (
            <div className="mt-4 space-y-4">
            {leaves
                .filter((leave) => filter[leave.status])
                .map((leave) => (
                <div key={leave.leaveId} className="bg-gray-800 p-4 rounded-lg shadow">
                    <p><strong>Name:</strong> {leave.staffName}</p>
                    <p><strong>Reason:</strong> {leave.reasonForLeave}</p>
                    <p><strong>Start Date:</strong> {formatDate(leave.startDate)}</p>
                    <p><strong>End Date:</strong> {formatDate(leave.endDate)}</p>
                    <p className={`font-bold ${leave.status === "pending" ? "text-yellow-400" : leave.status === "approved" ? "text-green-400" : "text-red-400"}`}>
                    {leave.status.toUpperCase()}
                    </p>
                </div>
                ))}
            </div>
        )}
        </div>
    );
};

export default Staff;
