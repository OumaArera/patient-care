import React, { useEffect, useState } from "react";
import { getCharts } from "../services/getCharts";
import { Loader } from "lucide-react";

const PendingCharts = ({ patient }) => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    setLoading(true);
    getCharts(patient)
      .then((data) => {
        const filteredCharts = data?.responseObject?.filter(chart => chart.status !== "approved") || [];
        setCharts(filteredCharts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patient]);

  // Toggles expanded view for a chart
  const toggleExpand = (chartId) => {
    if (expandedChart === chartId) {
      setExpandedChart(null);
    } else {
      setExpandedChart(chartId);
      const chart = charts.find((c) => c.chartId === chartId);
      if (chart?.status === "declined") {
        enableEditing(chart);
      }
    }
  };
  

  // Handles behavior status toggle (No <-> Yes)
  const handleBehaviorChange = (chartId, behaviorIndex) => {
    setEditedData((prevData) => {
      const updatedChart = { ...prevData[chartId] };
      updatedChart.behaviors[behaviorIndex].status =
        updatedChart.behaviors[behaviorIndex].status === "Yes" ? "No" : "Yes";
      return { ...prevData, [chartId]: updatedChart };
    });
  };

  // Handles updating behavior descriptions
  const handleDescriptionChange = (chartId, index, value) => {
    setEditedData((prevData) => {
      const updatedChart = { ...prevData[chartId] };
      updatedChart.behaviorsDescription[index].response = value;
      return { ...prevData, [chartId]: updatedChart };
    });
  };

  // Loads chart data into edit mode
  const enableEditing = (chart) => {
    setEditedData((prevData) => ({
      ...prevData,
      [chart.chartId]: {
        ...chart,
        status: "pending",
        behaviors: chart.behaviors.map((b) => ({ ...b })), // Deep copy to allow edits
        behaviorsDescription: chart.behaviorsDescription.map((bd) => ({ ...bd })),
      },
    }));
  };

  // Submits updated data (Mock function for now)
  const handleSubmit = (chartId) => {
    console.log("Submitting Updated Data:", editedData[chartId]);
    // You would replace this with an API call to update the data in the backend
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Pending Charts</h2>

      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-gray-400" size={20} />
          <p className="text-gray-400">Loading charts...</p>
        </div>
      ) : (
        charts.map((chart) => (
          <div key={chart.chartId} className="border rounded-lg p-4 my-4 shadow-md bg-white">
            <h3 className="text-lg font-semibold">{chart.patientName}</h3>
            <p className="text-sm text-gray-500">{chart.branchName}</p>
            <p className={`font-bold ${chart.status === "pending" ? "text-yellow-500" : "text-red-500"}`}>
              Status: {chart.status}
            </p>

            {chart.status === "declined" && (
              <p className="text-red-600 mt-2">Decline Reason: {chart.declineReason || "N/A"}</p>
            )}

            <button
              onClick={() => toggleExpand(chart.chartId)}
              className="mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              {expandedChart === chart.chartId ? "Hide Details" : "View Details"}
            </button>

            {expandedChart === chart.chartId && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">Behaviors</h4>
                <ul>
                  {(editedData[chart.chartId] || chart).behaviors.map((behavior, index) => (
                    <li key={index} className="flex items-center justify-between py-1">
                      <span>{behavior.behavior} ({behavior.category})</span>
                      {chart.status === "declined" ? (
                        <button
                          onClick={() => handleBehaviorChange(chart.chartId, index)}
                          className={`px-2 py-1 text-white rounded ${
                            behavior.status === "Yes" ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {behavior.status}
                        </button>
                      ) : (
                        <span className="text-gray-600">{behavior.status}</span>
                      )}
                    </li>
                  ))}
                </ul>

                <h4 className="font-semibold mt-3">Behavior Descriptions</h4>
                <ul>
                  {(editedData[chart.chartId] || chart).behaviorsDescription.map((desc, index) => (
                    <li key={index} className="flex flex-col my-2">
                      <label className="text-gray-700">{desc.descriptionType}</label>
                      {chart.status === "declined" ? (
                        <input
                          type="text"
                          value={desc.response}
                          onChange={(e) => handleDescriptionChange(chart.chartId, index, e.target.value)}
                          className="border p-2 rounded mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{desc.response || "N/A"}</p>
                      )}
                    </li>
                  ))}
                </ul>

                {chart.status === "declined" && (
                  <button
                    onClick={() => handleSubmit(chart.chartId)}
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Submit Updates
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PendingCharts;
