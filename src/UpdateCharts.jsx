import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const URL = `${BASE_URL}/charts`;

const UpdateCharts = ({ chart, handleGetCharts }) => {
  const [behaviors, setBehaviors] = useState(chart.behaviors);
  const [behaviorStatuses, setBehaviorStatuses] = useState(
    chart.behaviors.map((behavior) => behavior.status)
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date(chart.dateTaken);
    date.setDate(date.getDate() - 1);
    return date;
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reasonEdited, setReasonEdited] = useState("");

  useEffect(() => {
    setBehaviors(chart.behaviors);
    setBehaviorStatuses(chart.behaviors.map((behavior) => behavior.status));
  }, [chart]);

  const handleStatusChange = (index, value) => {
    setBehaviorStatuses((prevStatuses) => {
      const updatedStatuses = [...prevStatuses];
      updatedStatuses[index] = value;
      return updatedStatuses;
    });

    setBehaviors((prevBehaviors) =>
      prevBehaviors.map((b, i) => (i === index ? { ...b, status: value } : b))
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    const updatedData = {
      chartId: chart.chartId,
      behaviors: behaviors.map((behavior, index) => ({
        ...behavior,
        status: behaviorStatuses[index],
      })),
      reasonEdited,
    };

    const updatedUrl = `${URL}/${updatedData.chartId}`

    try {
        const response = await updateData(updatedUrl, updatedData);
              
        if (response?.error) {
            setErrors(errorHandler(response?.error));
            setTimeout(() => setErrors([]), 5000);
        } else {
            setMessage("Data updated successfully");
            setReasonEdited("");
            setTimeout(() => handleGetCharts(chart.patientId), 7000);
            setTimeout(() => setMessage(""), 7000);
        }
        
    } catch (error) {
        setErrors(["An error occurred. Please try again."]);
        setTimeout(() => setErrors([]), 5000);
    } finally {
        setLoading(false);
    }
  };

  // Function to merge behaviors by category
  const groupBehaviorsByCategory = (behaviors) => {
    return behaviors.reduce((acc, behavior) => {
      if (!acc[behavior.category]) {
        acc[behavior.category] = [];
      }
      acc[behavior.category].push(behavior);
      return acc;
    }, {});
  };

  const groupedBehaviors = groupBehaviorsByCategory(behaviors);

  return (
    <div className="p-6 bg-gray-900 text-white">
        <>
          <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">
            Update Chart for {chart.patientName}
          </h2>
          <div className="mb-4 text-center">
            <label className="block text-lg text-blue-400">Select Date & Time:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full text-center"
            />
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-blue-400 mb-3">Behaviors</h3>
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 border border-gray-700">Category</th>
                  <th className="p-3 border border-gray-700">Behavior</th>
                  <th className="p-3 border border-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedBehaviors).map(([category, behaviorList]) =>
                  behaviorList.map((behavior, index) => {
                    const originalIndex = behaviors.findIndex((b) => b === behavior);
                    return (
                      <tr key={behavior.id} className="border border-gray-700">
                        {index === 0 && (
                          <td
                            className="p-3 border border-gray-700 font-bold"
                            rowSpan={behaviorList.length}
                          >
                            {category}
                          </td>
                        )}
                        <td className="p-3 border border-gray-700">{behavior.behavior}</td>
                        <td className="p-3 border border-gray-700">
                          <select
                            value={behaviorStatuses[originalIndex] || ""}
                            onChange={(e) => handleStatusChange(originalIndex, e.target.value)}
                            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                            required
                          >
                            <option value="">Select Status</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mb-4">
            <label className="block text-lg text-blue-400">Reason for Editing:</label>
            <textarea
              value={reasonEdited}
              onChange={(e) => setReasonEdited(e.target.value)}
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
              placeholder="Enter reason for editing..."
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

          <div className="mt-6 text-center">
            <button
              onClick={handleSubmit}
              className={`px-6 py-3 rounded-lg flex items-center justify-center ${
                loading || behaviorStatuses.includes("") || !reasonEdited
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              disabled={loading || behaviorStatuses.includes("") || !reasonEdited}
            >
              {loading ? <Loader className="animate-spin mr-2" size={20} />  : "Submit Updates"}
            </button>
          </div>
        </>
      
    </div>
  );
};

export default UpdateCharts;
