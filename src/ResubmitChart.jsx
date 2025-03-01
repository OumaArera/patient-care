import React, { useState, useEffect } from "react";
import { postCharts } from "../services/postCharts";
import { Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import { errorHandler } from "../services/errorHandler";
import "react-datepicker/dist/react-datepicker.css";
import VitalsComponent from "./VitalsComponent";
import BehaviorDescriptions from "./BehaviorDescription";
import { fetchChartData } from "../services/fetchChartData";

const ResubmitChart = ({ patient, handleGetCharts }) => {

  const [behaviors, setBehaviors] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [behaviorStatuses, setBehaviorStatuses] = useState(
    behaviors.map(() => null) 
  );
  const [vitals, setVitals] = useState([
    {status: true, response: '', vitalsType: 'Blood Pressure'},
    {status: true, response: '', vitalsType: 'Pulse'},
    {status: true, response: '', vitalsType: 'Temperature'},
    {status: true, response: '', vitalsType: 'Oxygen Saturation'},
    {status: true, response: '', vitalsType: 'Pain'},
  ])
  const [behaviorsDescription, setBehaviorsDescription] = useState([
    {"status": true, "response": "", "descriptionType": "Date"},
    {"status": true, "response": "", "descriptionType": "Outcome"},
    {"status": true, "response": "", "descriptionType": "Trigger"},
    {"status": true, "response": "", "descriptionType": "Behavior_Description"},
    {"status": true, "response": "", "descriptionType": "Care_Giver_Intervention"},
    {"status": true, "response": "", "descriptionType": "Reported_Provider_And_Careteam"}
  ]);

  useEffect(() => {
    setLoading(true);
    fetchChartData()
      .then((data) => {
        console.log("Data: ", data);
        const newBehaviors = data?.responseObject?.[0]?.behaviors || [];
        setBehaviors(newBehaviors);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching chart data:", error);
        setBehaviors([]); 
        setLoading(false);
      });
  }, []);
  

  const handleVitalsChange = (index, value) => {
    setVitals((prevVitals) => {
      const updatedVitals = [...prevVitals];
      updatedVitals[index].response = value;
      return updatedVitals;
    });
  };
  

  const handleChangeBehaviorDescription = (index, value) => {
    setBehaviorsDescription((prevDescriptions) => {
      const updatedDescriptions = [...prevDescriptions];
      updatedDescriptions[index].response = value;
      return updatedDescriptions;
    });
  };
  
  const handleStatusChange = (index, value) => {
    setBehaviorStatuses((prevStatuses) => {
      const updatedStatuses = [...prevStatuses];
      updatedStatuses[index] = value;
      return updatedStatuses;
    });
  
    setBehaviors((prev) =>
      prev.map((b, i) => (i === index ? { ...b, status: value } : b))
    );
  };
  

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    setErrors([]);
  
    if (vitals.some(vital => vital.vitalsType !== "Pain" && !vital.response)) {
      setErrors(["All vitals except Pain must be provided."]);
      setLoadingSubmit(false);
      return;
    }
    const time = dayjs(selectedDate).format("YYYY-MM-DD HH:mm:ss");
    const payload = {
      patient: patient.patientId,
      behaviors,
      behaviorsDescription: behaviorsDescription,
      dateTaken: time,
      vitals
    };
    try {
      const response = await postCharts(payload);
      if (response?.error) {
        setErrors(errorHandler(response.error));
      } else {
        setMessage(["Chart posted successfully."]);
        setTimeout(() => handleGetCharts(patient.patientId), 5000);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setErrors([`Errors: ${error}`]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const groupBehaviorsByCategory = (behaviors) => {
    return behaviors.reduce((acc, behavior) => {
      if (!acc[behavior.category]) {
        acc[behavior.category] = [];
      }
      acc[behavior.category].push(behavior);
      return acc;
    }, {});
  };
  
  const groupedBehaviors = groupBehaviorsByCategory(chart.behaviors);


  return (
    <div className="p-6 bg-gray-900 text-white">
      {loading? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
          <p>Loading Charts Data</p>
      </div>
      ):(
        <>
          <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">Charts for {patient.firstName} {patient.lastName}</h2>
      
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
              <th className="p-3 border border-gray-700">Category</th>
              <th className="p-3 border border-gray-700">Log</th>
              <th className="p-3 border border-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
          {Object.entries(groupedBehaviors).map(([category, behaviorList]) =>
            behaviorList.map((behavior) => {
              // Find the original index of this behavior in `chart.behaviors`
              const originalIndex = chart.behaviors.findIndex((b) => b === behavior);

              return (
                <tr key={behavior.id} className="border border-gray-700">
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

      {/* Behaviors Description Table */}
      <div>
        <BehaviorDescriptions
          behaviorDescription={behaviorsDescription}
          handleChangeBehaviorDescription={handleChangeBehaviorDescription}
        />
      </div>
      {/* Vitals Input Table */}
      <div>
      <VitalsComponent vitalsData={vitals} handleVitalsChange={handleVitalsChange} />

      </div>
      {/* Submit Button */}
      <div className="mt-6 text-center">
      <button
        onClick={handleSubmit}
        className={`px-6 py-3 rounded-lg flex items-center justify-center ${
          loadingSubmit || behaviorStatuses.includes(null) || behaviorStatuses.includes("") || 
          vitals.some(vital => vital.vitalsType !== "Pain" && !vital.response) 
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        disabled={loadingSubmit || behaviorStatuses.includes(null) || behaviorStatuses.includes("") || 
          vitals.some(vital => vital.vitalsType !== "Pain" && !vital.response)}
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
        </>
      )}
      
    </div>
  );
};

export default ResubmitChart;

