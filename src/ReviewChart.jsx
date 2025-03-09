import React, { useState } from "react";

const ReviewChart = ({ chart, fetchCharts }) => {
  const [status, setStatus] = useState("");

  const handleSubmit = () => {
    const payload = {
      status,
      chartId: chart.chartId,
    };
    console.log("Submitting: ", payload);
    fetchCharts(chart.patientId)
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

      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        onClick={handleSubmit}
        disabled={!status}
      >
        Submit
      </button>
    </div>
  );
};

export default ReviewChart;