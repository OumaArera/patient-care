import React, { useState } from "react";
import { postUpdates } from "../services/postUpdates";
import { errorHandler } from "../services/errorHandler";

const ResubmitUpdate = ({ patientId }) => {
  const [updateType, setUpdateType] = useState("weekly");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");

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
    if (error || !date) return;
    setLoading(true);
    const data = {
      patient: patientId,
      type: updateType,
      dateTaken: date,
      notes,
      ...(updateType === "monthly" && weight ? { weight: weight } : {}),
    };
    try {
      const response = await postUpdates(data);
      if (response?.error) {
        setErrors(errorHandler(response.error));
        setTimeout(() => setErrors([]), 5000);
      } else {
        setUpdateType("weekly");
        setNotes("");
        setDate("");
        setWeight("");
        setMessage("Update successfully registered.");
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setErrors([`Errors: ${error}`]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Resubmit Resident Data</h2>

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
        onChange={(e) => setDate(e.target.value)}
        className="mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white w-full"
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

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
            onBlur={validateWeight}
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
        className={`px-4 py-2 rounded-md ${date ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 cursor-not-allowed"}`}
        onClick={handleSubmit}
        disabled={!date || loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
};

export default ResubmitUpdate;
