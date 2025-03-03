import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BehaviorDescriptions from "./BehaviorDescription"; // Assuming this component is imported

const UpdateCharts = ({ chart, handleGetCharts }) => {
  const [behaviors, setBehaviors] = useState(chart.behaviors);
  const [behaviorStatuses, setBehaviorStatuses] = useState(
    chart.behaviors.map((behavior) => behavior.status)
  );
  const [behaviorsDescription, setBehaviorsDescription] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date(chart.dateTaken));
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    setBehaviors(chart.behaviors);
    setBehaviorStatuses(chart.behaviors.map((behavior) => behavior.status));
    setBehaviorsDescription(chart.behaviorsDescription);
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

  const handleChangeBehaviorDescription = (index, value) => {
    setBehaviorsDescription((prevDescriptions) => {
      const updatedDescriptions = [...prevDescriptions];
      updatedDescriptions[index].response = value;
      return updatedDescriptions;
    });
  };

  const handleSubmit = () => {
    setLoadingSubmit(true);

    const updatedData = {
      chartId: chart.chartId,
      categories: chart.categories, // Including categories in the payload
      behaviors: behaviors.map((behavior, index) => ({
        ...behavior,
        status: behaviorStatuses[index], // Ensure all behaviors remain in the payload
      })),
      behaviorsDescription: behaviorsDescription.filter(
        (description, index) =>
          description.response !== chart.behaviorsDescription[index].response
      ), // Only include updated descriptions
    };

    console.log("Updated Chart Data:", updatedData);
    handleGetCharts();

    // Simulate a submit request (e.g., to a server)
    setTimeout(() => {
      setLoadingSubmit(false);
      alert("Chart data updated!");
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-900 text-white">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
          <p>Loading chart data...</p>
        </div>
      ) : (
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

          {/* Behaviors Table */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-blue-400 mb-3">Behaviors</h3>
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 border border-gray-700">Behavior</th>
                  <th className="p-3 border border-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {behaviors.map((behavior, index) => (
                  <tr key={index} className="border border-gray-700">
                    <td className="p-3 border border-gray-700">{behavior.behavior}</td>
                    <td className="p-3 border border-gray-700">
                      <select
                        value={behaviorStatuses[index] || ""}
                        onChange={(e) => handleStatusChange(index, e.target.value)}
                        className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Behaviors Description Table */}
          <div className="mt-4">
            <BehaviorDescriptions
              behaviorDescription={behaviorsDescription}
              handleChangeBehaviorDescription={handleChangeBehaviorDescription}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSubmit}
              className={`px-6 py-3 rounded-lg flex items-center justify-center ${
                loadingSubmit || behaviorStatuses.includes("")
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              disabled={loadingSubmit || behaviorStatuses.includes("")}
            >
              {loadingSubmit ? <Loader className="animate-spin mr-2" size={20} /> : "Submit Updates"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UpdateCharts;
