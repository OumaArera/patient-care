import React, { useState } from "react";

const Update = ({ patientId }) => {
  const [updateType, setUpdateType] = useState("weekly");
  const [date, setDate] = useState("");
  const [lateReason, setLateReason] = useState("");
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDate(e.target.value);
    setLateReason("");
    setError("");

    if (updateType === "monthly") {
      if (selectedDate > today) {
        setError("You cannot fill data for upcoming dates.");
        return;
      }
      const diffDays = (today - selectedDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 3) {
        setLateReason("Reason for late input");
      }
    }

    if (updateType === "weekly") {
      if (selectedDate > today) {
        setError("Weekly updates cannot be in the future.");
        return;
      }
      if (selectedDate.getDay() !== 5) {
        setError("Weekly updates must only be filled on Friday by 11:59 AM.");
        return;
      }
      const diffDays = (today - selectedDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 0) {
        setLateReason("Reason why this was not filled on Friday");
      }
    }
  };

  const handleWeightChange = (e) => {
    const weightValue = parseInt(e.target.value, 10);
    if (weightValue < 10) {
      setError("Weight cannot be less than 10 pounds.");
    } else {
      setWeight(weightValue);
      setError("");
    }
  };

  const handleSubmit = () => {
    if (error) return;
    const data = {
      patientId,
      updateType,
      date,
      notes,
      weight: updateType === "monthly" ? weight : undefined,
      lateReason: lateReason || undefined,
    };
    console.log("Submitted Data:", data);
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Update Patient Data</h2>
      <label className="block mb-2">Select Update Type:</label>
      <select
        value={updateType}
        onChange={(e) => setUpdateType(e.target.value)}
        className="mb-4 p-2 bg-gray-950 text-white border border-gray-700 rounded"
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <label className="block mb-2">Select Date:</label>
      <input
        type="date"
        value={date}
        onChange={handleDateChange}
        className="mb-4 p-2 border border-gray-700 rounded"
        required
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {lateReason && (
        <div>
          <label className="block mb-2">Reason why this was not filled on time:</label>
          <input
            type="text"
            value={lateReason}
            onChange={(e) => setLateReason(e.target.value)}
            placeholder="Enter reason for late input"
            className="mb-4 p-2 border border-gray-700 rounded"
          />
        </div>
      )}

      <label className="block mb-2">Notes:</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="mb-4 p-2 border border-gray-700 rounded w-full"
        required
      />

      {updateType === "monthly" && (
        <div>
          <label className="block mb-2">Weight (lbs):</label>
          <input
            type="number"
            value={weight}
            onChange={handleWeightChange}
            className="mb-4 p-2 border border-gray-700 rounded"
          />
        </div>
      )}

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default Update;
