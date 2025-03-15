import React, { useEffect, useState } from "react";
import { getData } from "../services/updatedata";

const URL = "https://patient-care-server.onrender.com/api/v1/leaves";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState({});
  const [declineReasons, setDeclineReasons] = useState({});

  
    const getLeaves =()=>{
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
    }
    useEffect(() => {
        getLeaves()
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

  const handleSubmit = (leaveId) => {
    const payload = {
        leaveId,
        status: action[leaveId],
        declineReason: action[leaveId] === "declined" ? declineReasons[leaveId] : null,
      }
    console.log(payload);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US");
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-blue-500 mb-4">Leave Management</h2>

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
                <th className="p-2 border border-gray-700">Decline Reason</th>
                <th className="p-2 border border-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.leaveId} className="border border-gray-700">
                  <td className="p-2">{leave.staffName}</td>
                  <td className="p-2">{formatDate(leave.startDate)}</td>
                  <td className="p-2">{formatDate(leave.endDate)}</td>
                  <td className="p-2">{leave.reasonForLeave}</td>
                  <td className="p-2">{leave.declineReason || "-"}</td>
                  <td className="p-2">
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

                        <button
                          onClick={() => handleSubmit(leave.leaveId)}
                          className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 w-full"
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
