import React, { useState } from "react";
import { postUpdates } from "../services/postUpdates";
import { errorHandler } from "../services/errorHandler";

const Update = ({ patientId }) => {
  const [updateType, setUpdateType] = useState("weekly");
  const [date, setDate] = useState("");
  const [lateReason, setLateReason] = useState("");
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [showLateReason, setShowLateReason] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState([]);


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
        setShowLateReason(false);
        return;
      }
      const diffDays = (today - selectedDate) / (1000 * 60 * 60 * 24);
      setShowLateReason(diffDays > 3);
    }

    if (updateType === "weekly") {
      if (selectedDate > today) {
        setError("Weekly updates cannot be in the future.");
        setShowLateReason(false);
        return;
      }
      if (selectedDate.getDay() !== 5) {
        setError("Weekly updates must only be filled on Friday by 11:59 AM.");
        setShowLateReason(false);
        return;
      }
      const diffDays = (today - selectedDate) / (1000 * 60 * 60 * 24);
      setShowLateReason(diffDays > 0);
    }
  };

  const handleWeightChange = (e) => {
    setWeight(e.target.value);
    setError("");
  };

  const validateWeight = () => {
    if (weight && parseInt(weight, 10) < 10) {
      setError("Weight cannot be less than 10 pounds.");
    }
  };

  const handleSubmit = async () => {
    if (error) return;
    setLoading(true);
    const data = {
        patient: patientId,
        type: updateType,
        dateTaken: date,
        notes,
        ...(updateType === "monthly" && weight ? { weight: weight } : {}),
        ...(showLateReason && lateReason ? { reasonNotFilled: lateReason } : {}),
    };
    try {
        const response = await postUpdates(data);
        if (response?.error){
            setErrors(errorHandler(response.error));
            setTimeout(() => setErrors([]), 5000);
        }else{
            setUpdateType("weekly");
            setUpdateType("");
            setNotes("");
            setDate("");
            setLateReason("");
            setWeight("");
            setMessage(["Appointment marked successfully."]);
            setTimeout(() => setMessage(""), 5000);
        }
    } catch (error) {
        setErrors([`Errors: ${error}`]);
        setTimeout(() => setErrors([]), 5000);
    } finally{
        setLoading(false);
    }
    
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Update Resident Data</h2>

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

      {showLateReason && (
        <div>
          <label className="block mb-2">Reason why this was not filled on time:</label>
          <input
            type="text"
            value={lateReason}
            onChange={(e) => setLateReason(e.target.value)}
            placeholder="Enter reason for late input"
            className="mb-4 p-2 border border-gray-700 rounded w-full"
          />
        </div>
      )}

      <label className="block mb-2">Notes:</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter notes here..."
        className="mb-4 p-2 border border-gray-700 rounded w-full"
        required
      />

      {updateType === "monthly" && (
        <div>
          <label className="block mb-2">Weight (lbs):</label>
          <input
            type="number"
            value={weight}
            placeholder="Enter weight in pounds"
            onChange={handleWeightChange}
            onBlur={validateWeight} // Validate onBlur instead of while typing
            className="mb-4 p-2 border border-gray-700 rounded w-full"
          />
        </div>
      )}
        {message && <p className="text-green-600">{message}</p>}
        {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-800 rounded">
            {errors.map((error, index) => (
                <p key={index} className="text-sm text-white">{error}</p>
            ))}
            </div>
        )}

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleSubmit}
      >
        {loading? "Submitting...": "Submit"}
      </button>
    </div>
  );
};

export default Update;
