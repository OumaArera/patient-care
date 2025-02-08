import React, { useState, useEffect } from "react";
import { postCharts } from "../services/postCharts";
import { Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NewCharts = ({ charts, chartsData, onClose }) => {
  if (!chartsData.length) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg text-center text-red-500">
        The patient has not been assigned charts data.
      </div>
    );
  }

  const chart = charts[0];

  const [behaviors, setBehaviors] = useState(chart.behaviors);
  const [behaviorsDescription, setBehaviorsDescription] = useState(chart.behaviorsDescription);
  const [dateTaken, setDateTaken] = useState(new Date());
  const [reasonNotFiled, setReasonNotFiled] = useState(null);
  const [missingDays, setMissingDays] = useState([]);

  useEffect(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    
    const recordedDates = new Set(charts.map(entry => new Date(entry.dateTaken).toDateString()));
    const missing = [];

    for (let d = startOfMonth; d < new Date(); d.setDate(d.getDate() + 1)) {
      if (!recordedDates.has(d.toDateString())) {
        missing.push(new Date(d));
      }
    }

    setMissingDays(missing);
    if (missing.length > 0) {
      setDateTaken(missing[0]);
    }
  }, [charts]);

  const toggleBehaviorStatus = (index) => {
    setBehaviors((prev) =>
      prev.map((b, i) => (i === index ? { ...b, status: b.status === "Yes" ? "No" : "Yes" } : b))
    );
  };

  const updateBehaviorDescription = (index, field, value) => {
    setBehaviorsDescription((prev) =>
      prev.map((desc, i) => (i === index ? { ...desc, response: value } : desc))
    );
  };

  const handleSubmit = () => {
    const payload = { behaviors, behaviorsDescription, dateTaken, reasonNotFiled };
    postCharts(payload);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-11/12 max-w-5xl h-[85vh] overflow-y-auto shadow-lg relative">
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-400"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">Charts for {chart.patientName}</h2>

        {/* Missing Date Selection */}
        {missingDays.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2">Select Date:</label>
            <DatePicker
              selected={dateTaken}
              onChange={(date) => setDateTaken(date)}
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
            />
            <label className="block mt-3">Reason Not Filed:</label>
            <input
              type="text"
              placeholder="Enter reason"
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
              required
              onChange={(e) => setReasonNotFiled(e.target.value)}
            />
          </div>
        )}

        {/* Behaviors Table */}
        <div className="bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
          <h3 className="text-lg font-bold text-blue-400 mb-3">Behaviors</h3>
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="p-3 border border-gray-700">Category</th>
                <th className="p-3 border border-gray-700">Log</th>
                <th className="p-3 border border-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {behaviors.reduce((acc, behavior, index, arr) => {
                const isNewCategory = index === 0 || behavior.category !== arr[index - 1].category;
                const rowspan = arr.filter((b) => b.category === behavior.category).length;

                acc.push(
                  <tr key={index} className="border border-gray-700">
                    {isNewCategory && (
                      <td className="p-3 border border-gray-700 text-center align-middle" rowSpan={rowspan}>
                        {behavior.category}
                      </td>
                    )}
                    <td className="p-3 border border-gray-700">{behavior.behavior}</td>
                    <td className="p-3 border border-gray-700 text-center">
                      <button
                        onClick={() => toggleBehaviorStatus(index)}
                        className={`px-4 py-2 rounded-md text-white ${
                          behavior.status === "Yes" ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {behavior.status}
                      </button>
                    </td>
                  </tr>
                );

                return acc;
              }, [])}
            </tbody>
          </table>
        </div>

        {/* Behaviors Description Table */}
        <div className="bg-gray-800 p-4 rounded-lg mt-6">
          <h3 className="text-lg font-bold text-blue-400 mb-3">Behavior Descriptions</h3>
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="p-3 border border-gray-700">Date</th>
                <th className="p-3 border border-gray-700">Outcome</th>
                <th className="p-3 border border-gray-700">Triggers</th>
                <th className="p-3 border border-gray-700">Behavior Description</th>
                <th className="p-3 border border-gray-700">Care Giver Intervention</th>
                <th className="p-3 border border-gray-700">Reported Provider & Care Team</th>
              </tr>
            </thead>
            <tbody>
              {Array(3)
                .fill({})
                .map((_, rowIndex) => (
                  <tr key={rowIndex} className="border border-gray-700">
                    <td className="p-3 border border-gray-700">
                      <DatePicker
                        selected={dateTaken}
                        onChange={(date) => setDateTaken(date)}
                        className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                      />
                    </td>
                    {["Outcome", "Trigger", "Behavior_Description", "Care_Giver_Intervention", "Reported_Provider_And_Careteam"].map(
                      (field, index) => (
                        <td key={index} className="p-3 border border-gray-700">
                          <textarea
                            placeholder={`Enter ${field.replace(/_/g, " ")}`}
                            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full resize-none"
                            onChange={(e) => updateBehaviorDescription(rowIndex, field, e.target.value)}
                          />
                        </td>
                      )
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Submit Charts
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCharts;
