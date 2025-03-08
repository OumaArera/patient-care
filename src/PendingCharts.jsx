import React, { useEffect, useState } from "react";
import { getCharts } from "../services/getCharts";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";

const URL = "https://patient-care-server.onrender.com/api/v1/charts";

const PendingCharts = ({ patient }) => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);

  
  const fetchCharts = () =>{
    setLoading(true);
    getCharts(patient)
      .then((data) => {
        const filteredCharts = data?.responseObject?.filter(chart => chart.status !== "approved") || [];
        setCharts(filteredCharts);
        setLoading(false);
      })
      .catch(() => {
        setCharts([]);
        setLoading(false);
      });
  }
  useEffect(() => {
    fetchCharts()
  }, [patient]);
  
  

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

  const handleBehaviorChange = (chartId, behaviorIndex) => {
    setEditedData((prevData) => {
      const updatedChart = { ...prevData[chartId] };
      updatedChart.behaviors[behaviorIndex].status =
        updatedChart.behaviors[behaviorIndex].status === "Yes" ? "No" : "Yes";
      return { ...prevData, [chartId]: updatedChart };
    });
  };

  const handleDescriptionChange = (chartId, index, value) => {
    setEditedData((prevData) => {
      const updatedChart = { ...prevData[chartId] };
      updatedChart.behaviorsDescription[index].response = value;
      return { ...prevData, [chartId]: updatedChart };
    });
  };

  const enableEditing = (chart) => {
    setEditedData((prevData) => ({
      ...prevData,
      [chart.chartId]: {
        chartId: chart.chartId,
        status: "pending",
        behaviors: chart.behaviors.map((b) => ({ ...b })),
        behaviorsDescription: chart.behaviorsDescription.map((bd) => ({ ...bd })),
      },
    }));
  };

  const handleSubmit = async (chartId) => {
    setIsSubmitting(true);
    const { behaviors, behaviorsDescription } = editedData[chartId];
    const payload = {
      chartId,
      status: "pending",
      behaviors,
      behaviorsDescription,
    }
    const updatedUrl = `${URL}/${chartId}`;
    try {
        const response = await updateData(updatedUrl, payload);
              
        if (response?.error) {
            setErrors(errorHandler(response?.error));
            setTimeout(() => setErrors([]), 5000);
        } else {
            setMessage("Data updated successfully");
            setReasonEdited("");
            setTimeout(() => fetchCharts(), 5000);
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
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Charts</h2>
      <>
      {loading ? (
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader className="animate-spin" size={20} />
          <p>Loading charts...</p>
        </div>
      ) : charts.length === 0 ? (
        <p className="text-gray-600">No pending charts available.</p>
      ) : (
        charts.map((chart) => (
          <div key={chart.chartId} className="border border-gray-300 rounded-lg p-4 my-4 bg-white shadow">
            <h3 className="text-lg font-semibold text-gray-800">{chart.patientName}</h3>
            <p className="text-sm text-gray-600">{chart.branchName}</p>
            <p className={`font-bold ${chart.status === "pending" ? "text-blue-500" : "text-red-500"}`}>
              Status: {chart.status}
            </p>

            {chart.status === "declined" && (
              <p className="text-red-600 mt-2">Decline Reason: {chart.declineReason || "N/A"}</p>
            )}

            <button
              onClick={() => toggleExpand(chart.chartId)}
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              {expandedChart === chart.chartId ? "Hide Details" : "View Details"}
            </button>

            {expandedChart === chart.chartId && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700">Behaviors</h4>
                <ul>
                  {(editedData[chart.chartId] || chart).behaviors.map((behavior, index) => (
                    <li key={index} className="flex items-center justify-between py-1">
                      <span className="text-gray-700">{behavior.behavior} ({behavior.category})</span>
                      {chart.status === "declined" ? (
                        <button
                          onClick={() => handleBehaviorChange(chart.chartId, index)}
                          className={`px-2 py-1 text-white rounded ${
                            behavior.status === "Yes" ? "bg-green-500" : "bg-red-500"
                          } hover:opacity-80`}
                        >
                          {behavior.status}
                        </button>
                      ) : (
                        <span className="text-gray-600">{behavior.status}</span>
                      )}
                    </li>
                  ))}
                </ul>

                <h4 className="font-semibold text-gray-700 mt-3">Behavior Descriptions</h4>
                <ul>
                  {(editedData[chart.chartId] || chart).behaviorsDescription.map((desc, index) => (
                    <li key={index} className="flex flex-col my-2">
                      <label className="text-gray-600 font-medium">{desc.descriptionType}</label>
                      {chart.status === "declined" ? (
                        desc.descriptionType === "Date" ? (
                          <input
                          type="date"
                          value={desc.response}
                          onChange={(e) => handleDescriptionChange(chart.chartId, index, e.target.value)}
                          className="border p-2 rounded mt-1 bg-white text-gray-800 focus:ring-2 focus:ring-blue-300"
                        />
                        ):(
                          <input
                          type="text"
                          value={desc.response}
                          onChange={(e) => handleDescriptionChange(chart.chartId, index, e.target.value)}
                          className="border p-2 rounded mt-1 bg-white text-gray-800 focus:ring-2 focus:ring-blue-300"
                        />
                        )
                        
                      ) : (
                        <p className="text-gray-600">{desc.response || "N/A"}</p>
                      )}
                    </li>
                  ))}
                </ul>
                {errors.length > 0 && (
                  <div className="mb-4 p-3 rounded">
                      {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                      ))}
                  </div>
                  )}
                {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
                {chart.status === "declined" && (
                  <button
                    onClick={() => handleSubmit(chart.chartId)}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    {isSubmitting? "Submitting..." : "Submit"}
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
      </>
    </div>
  );
};

export default PendingCharts;