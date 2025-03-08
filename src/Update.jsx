import React, { useState, useEffect } from "react";
import { postUpdates } from "../services/postUpdates";
import { errorHandler } from "../services/errorHandler";
import { getData } from "../services/updatedata";
import CustomDatePicker from "./CustomDatePicker";
import { Loader } from "lucide-react";
const URL = "https://patient-care-server.onrender.com/api/v1/late-submissions"

const Update = ({ patientId }) => {
  const [updateType, setUpdateType] = useState("weekly");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLate, setLoadingLate] = useState(false);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState([]);
  const [blink, setBlink] = useState(true);
  const [lateSubmission, setLateSubmission] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reasonFilledLate, setReasonFilledLate] = useState("");
  
  useEffect(() => {
    const careGiver = localStorage.getItem("userId");
    const type = "updates";

    if (!patientId || !careGiver) return;
    setLoadingLate(true);

    const queryParams = new URLSearchParams({
      patient: patientId,
      careGiver,
      type,
    }).toString();

    getData(`${URL}?${queryParams}`)
        .then((data) => {
            setLateSubmission(data.responseObject || []);
        })
        .catch(() => {})
        .finally(() => setLoadingLate(false))
  }, [patientId]);

  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const dateOfMonth = today.getDate();
    const hour = today.getHours();
    let isValid = false;

    if (updateType === "weekly") {
        isValid = day === 5 && hour < 12;
    } else if (updateType === "monthly") {
        isValid = [1, 2, 3].includes(dateOfMonth);
    }

    let selectedDate = ""; // Default empty

    const withinLateSubmission = lateSubmission.some((entry) => {
        const startTime = new Date(entry.start).getTime();
        const endTime = startTime + entry.duration * 60000;
        const now = new Date().getTime();

        if (now >= startTime && now <= endTime) {
            selectedDate = new Date(endTime).toISOString().split("T")[0]; // Set endTime as date
            return true;
        }
        return false;
    });

    if (isValid || withinLateSubmission) {
        setDate(selectedDate || today.toISOString().split("T")[0]);
    } else {
        setDate("");
    }

    console.log("Late Data: ", lateSubmission);
  }, [updateType, lateSubmission]);

      
      
  

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
      dateTaken: lateSubmission.length > 0 && date ? selectedDate.toISOString().split("T")[0] : date,
      notes,
      reasonFilledLate,
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
        setMessage(["Update successfully registered."]);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setErrors([`Errors: ${error}`]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 1000); // Toggle every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Provide Updates</h2>
      {loadingLate && (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
        </div>
      )}
      <label className="block mb-2">Select Update Type:</label>
      <select
        value={updateType}
        onChange={(e) => setUpdateType(e.target.value)}
        className="mb-4 p-2 bg-gray-950 text-white border border-gray-700 rounded"
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <label className="block mb-2">Date:</label>
      <input
        type="text"
        value={date || "Not Available"}
        className="mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white w-full"
        disabled
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {lateSubmission.length > 0 && date && (
        <>
          <div className="mb-4">
            {lateSubmission
              .filter((entry) => {
                const now = new Date();
                const startTime = new Date(entry.start);
                const endTime = new Date(startTime.getTime() + entry.duration * 60000);
                return now >= startTime && now <= endTime; // Only include the active time slot
              })
              .map((entry) => {
                const startTime = new Date(entry.start);
                const endTime = new Date(startTime.getTime() + entry.duration * 60000);
                return (
                  <div key={entry.start} className="mb-2">
                    <label className="text-red-600">
                      Submission starts at {startTime.toLocaleString()} and will end by {endTime.toLocaleString()}
                    </label>
                  </div>
                );
              })}
            <br />
            <label className="block text-sm font-medium text-white mb-2">
              Select Date & Time (from 7.00 PM - 8:59PM) for Late Submission:
            </label>
            <CustomDatePicker 
              updateType={updateType} 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate} 
            />
          </div>
          <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Reason for Late Submission (Required):
          </label>
          <textarea
            value={reasonFilledLate}
            onChange={(e) => setReasonFilledLate(e.target.value)}
            placeholder="Enter reason here..."
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
            required
        />
      </div>
      </>
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
      {updateType === "weekly" && !date && (
        <div className="mt-2 mb-4 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-md">
          <p className={`text-xl md:text-2xl font-bold text-red-600 ${blink ? "opacity-100" : "opacity-0"} transition-opacity duration-500 flex items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            CHART ENTRY RESTRICTED
          </p>
          <p className="text-lg md:text-xl text-red-800 mt-2 font-medium">
          Weekly updates must be submitted on <span className="underline font-bold">Friday before noon</span>.
          </p>
        </div>
      )}

      {updateType === "monthly" && !date && (
        <div className="mt-2 mb-4 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-md">
          <p className={`text-xl md:text-2xl font-bold text-red-600 ${blink ? "opacity-100" : "opacity-0"} transition-opacity duration-500 flex items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            CHART ENTRY RESTRICTED
          </p>
          <p className="text-lg md:text-xl text-red-800 mt-2 font-medium">
          The monthly updates must be done from <span className="underline font-bold">date 1</span> to <span className="underline font-bold">date 3 of the month</span>.
          </p>
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

export default Update;
