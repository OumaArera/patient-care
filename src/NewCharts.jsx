import React, { useState, useEffect } from "react";
import { postCharts } from "../services/postCharts";
import { Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import { errorHandler } from "../services/errorHandler";
import "react-datepicker/dist/react-datepicker.css";

const NewCharts = ({ charts, chartsData }) => {
  if (!chartsData.length) {
    return <p className="text-red-500 text-center p-4">The resident has not been assigned charts data.</p>;
  }

  // Pick the first chart entry
  const chart = charts[0];
  const chart_ = chartsData[0].behaviorsDescription
  
  console.log("Chart Data: ", chart_);


  // Extract behaviors and behavior descriptions
  const [behaviors, setBehaviors] = useState(chart.behaviors);
  const [behaviorDescription, setBehaviorDescription] = useState({
    Behavior_Description: "",
    Trigger: "",
    Care_Giver_Intervention: "",
    Reported_Provider_And_Careteam: "",
    Outcome: "",
  });
  
  const [dateTaken, setDateTaken] = useState(new Date());
  const [reasonNotFiled, setReasonNotFiled] = useState(null);
  const [missingDays, setMissingDays] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);
  const [behaviorStatuses, setBehaviorStatuses] = useState(
    behaviors.map(() => null) 
  );
  
  const handleStatusChange = (index, value) => {
    // Update the behavior status
    setBehaviorStatuses((prevStatuses) => {
      const updatedStatuses = [...prevStatuses];
      updatedStatuses[index] = value;
      return updatedStatuses;
    });
  
    setBehaviors((prev) =>
      prev.map((b, i) => (i === index ? { ...b, status: value } : b))
    );
  };
  

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

  
  
  const updateBehaviorDescription = (field, value) => {
    setBehaviorDescription((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Check if all fields in any row are filled before submission
  const isSubmitDisabled = behaviorDescription.some((desc) =>
    ["Behavior_Description", "Trigger", "Care_Giver_Intervention", "Reported_Provider_And_Careteam", "Outcome"].some(
      (field) => !desc[field]
    )
  );

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      setErrors(["Please complete all required fields before submitting."]);
      return;
    }

    setLoadingSubmit(true);
    setErrors([]);

    // const cleanedBehaviorsDescription = behaviorsDescription.map(desc => ({
    //   ...desc,
    //   response: desc.response?.trim() ? desc.response : null
    // }));
    
    const payload = {
      patient: chart.patientId,
      behaviors,
      behaviorsDescription: behaviorDescription,
      dateTaken: dateTaken.toISOString(),
      reasonNotFiled
    };
    console.log("Payload", payload);

    try {
      const response = await postCharts(payload);
      if (response?.error) {
        setErrors(errorHandler(response.error));
      } else {
        setMessage(["Chart data posted successfully."]);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error submitting charts:", error);
      setErrors([`Errors: ${error}`]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoadingSubmit(false);
    }
  };


  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">Charts for {chart.patientName}</h2>

      {/* Missing Date Selection */}
      {missingDays.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2">Select Date & Time:</label>
          <DatePicker
            selected={dateTaken}
            onChange={(date) => setDateTaken(date)}
            showTimeSelect
            dateFormat="Pp" // Ensures date + time format
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
            required
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
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-blue-400 mb-3">Behaviors</h3>
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-white">
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
                  <td className="p-3 border border-gray-700">
                    <select
                      value={behaviorStatuses[index]} // Uses the new state
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
              );

              return acc;
            }, [])}
          </tbody>
        </table>
      </div>

      {/* Behaviors Description Table */}
      <div className="bg-gray-900 p-4 rounded-lg mt-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">Behavior Descriptions</h3>
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 border border-gray-700">Date</th>
              <th className="p-3 border border-gray-700">Behavior Description</th>
              <th className="p-3 border border-gray-700">Triggers</th>
              <th className="p-3 border border-gray-700">Caregiver Intervention</th>
              <th className="p-3 border border-gray-700">Reported to Provider & Care Team</th>
              <th className="p-3 border border-gray-700">Outcome</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border border-gray-700">
              <td className="p-3 border border-gray-700">
                <DatePicker
                  selected={dateTaken}
                  onChange={(date) => setDateTaken(date)}
                  className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                />
              </td>
              {["Behavior_Description", "Trigger", "Care_Giver_Intervention", "Reported_Provider_And_Careteam", "Outcome"].map(
                (field, index) => (
                  <td key={index} className="p-3 border border-gray-700">
                    <input
                      type="text"
                      placeholder={`Enter ${field.replace(/_/g, " ")}`}
                      className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                      value={behaviorDescription[field]}
                      onChange={(e) => updateBehaviorDescription(field, e.target.value)}
                    />
                  </td>
                )
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="mt-6 text-center">
      <button
          onClick={handleSubmit}
          className={`px-6 py-3 rounded-lg flex items-center justify-center ${
            isSubmitDisabled || loadingSubmit
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          disabled={isSubmitDisabled || loadingSubmit}
        >
          {loadingSubmit ? <Loader className="animate-spin mr-2" size={20} /> : "Submit Charts"}
        </button>
        {message && <p className="text-green-600">{message}</p>}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-800 rounded">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-white">{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewCharts;
