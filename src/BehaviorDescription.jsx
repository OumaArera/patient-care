import React, { useState, useEffect } from "react";
import { postCharts } from "../services/postCharts";
import { Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import { errorHandler } from "../services/errorHandler";
import "react-datepicker/dist/react-datepicker.css";
import VitalsComponent from "./VitalsComponent";
import BehaviorDescriptions from "./BehaviorDescription";

const NewCharts = ({ charts, chartsData }) => {
  if (!chartsData.length) {
    return <p className="text-red-500 text-center p-4">The resident has not been assigned charts data.</p>;
  }

  const chart = charts[0];
  const [behaviors, setBehaviors] = useState(chart.behaviors);
  const [behaviorDescription, setBehaviorDescription] = useState();
  const [dateTaken, setDateTaken] = useState(new Date());
  const [reasonNotFiled, setReasonNotFiled] = useState(null);
  const [missingDays, setMissingDays] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);
  const [behaviorStatuses, setBehaviorStatuses] = useState(behaviors.map(() => null));
  const [vitals, setVitals] = useState([
    { status: true, response: "", vitalsType: "Blood Pressure" },
    { status: true, response: "", vitalsType: "Pulse" },
    { status: true, response: "", vitalsType: "Temperature" },
    { status: true, response: "", vitalsType: "Oxygen Saturation" },
    { status: true, response: "", vitalsType: "Pain" },
  ]);

  const [validationMessages, setValidationMessages] = useState({});

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

  const handleVitalsChange = (index, value) => {
    setVitals((prevVitals) => {
      const updatedVitals = [...prevVitals];
      updatedVitals[index].response = value;
      return updatedVitals;
    });

    validateVital(vitals[index].vitalsType, value, index);
  };

  const validateVital = (type, value, index) => {
    const thresholds = {
      "Blood Pressure": { systolic: { min: 71, max: 150 }, diastolic: { min: 51, max: 90 } },
      "Pulse": { min: 60, max: 100 },
      "Temperature": { min: 97, max: 99.5 }, // Fahrenheit
      "Oxygen Saturation": { min: 95, max: 100 }
    };

    let message = "";

    if (!value) {
      message = `${type} is required.`;
    } else if (type === "Blood Pressure") {
      const bpParts = value.split("/").map((v) => parseInt(v.trim(), 10));
      if (bpParts.length !== 2 || isNaN(bpParts[0]) || isNaN(bpParts[1])) {
        message = "Invalid Blood Pressure format (e.g., 120/80).";
      } else {
        const [systolic, diastolic] = bpParts;
        if (systolic < thresholds["Blood Pressure"].systolic.min) {
          message = `Systolic pressure (${systolic}) is too low. Consider retaking.`;
        } else if (systolic > thresholds["Blood Pressure"].systolic.max) {
          message = `Systolic pressure (${systolic}) is too high. Consider retaking.`;
        }
        if (diastolic < thresholds["Blood Pressure"].diastolic.min) {
          message = `Diastolic pressure (${diastolic}) is too low. Consider retaking.`;
        } else if (diastolic > thresholds["Blood Pressure"].diastolic.max) {
          message = `Diastolic pressure (${diastolic}) is too high. Consider retaking.`;
        }
      }
    } else if (type in thresholds) {
      const numericValue = parseFloat(value);
      if (numericValue < thresholds[type].min) {
        message = `${type} is too low (${numericValue}). Consider retaking.`;
      } else if (numericValue > thresholds[type].max) {
        message = `${type} is too high (${numericValue}). Consider retaking.`;
      } else {
        message = "✔️ OK";
      }
    }

    setValidationMessages((prev) => ({ ...prev, [index]: message }));
  };

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    setErrors([]);

    const payload = {
      patient: chart.patientId,
      behaviors,
      behaviorsDescription: behaviorDescription,
      dateTaken: dateTaken.toISOString(),
      vitals,
      ...(reasonNotFiled ? { reasonNotFiled } : {}),
    };

    console.log("Payload: ", payload);

    try {
      const response = await postCharts(payload);
      if (response?.error) {
        setErrors(errorHandler(response.error));
      } else {
        setMessage(["Chart data posted successfully."]);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setErrors([`Errors: ${error}`]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">Charts for {chart.patientName}</h2>

      <VitalsComponent 
        vitals={vitals} 
        handleVitalsChange={handleVitalsChange} 
        validationMessages={validationMessages} 
      />

      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          className={`px-6 py-3 rounded-lg flex items-center justify-center ${
            loadingSubmit ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          disabled={loadingSubmit}
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
