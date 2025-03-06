import React, { useState, useEffect } from "react";
import { postCharts } from "../services/postCharts";
import { Loader } from "lucide-react";
import dayjs from "dayjs";
import { errorHandler } from "../services/errorHandler";
import { getData } from "../services/updatedata";
import "react-datepicker/dist/react-datepicker.css";
import BehaviorDescriptions from "./BehaviorDescription";
const URL = "https://patient-care-server.onrender.com/api/v1/late-submissions"

const NewCharts = ({ charts, chartsData }) => {
  const chart = chartsData[0];

  const [behaviors, setBehaviors] = useState(chart.behaviors);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [blink, setBlink] = useState(true);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);
  const [behaviorStatuses, setBehaviorStatuses] = useState(
    behaviors.map(() => null) 
  );
  const [behaviorsDescription, setBehaviorsDescription] = useState([
    {"status": true, "response": "", "descriptionType": "Date"},
    {"status": true, "response": "", "descriptionType": "Outcome"},
    {"status": true, "response": "", "descriptionType": "Trigger"},
    {"status": true, "response": "", "descriptionType": "Behavior_Description"},
    {"status": true, "response": "", "descriptionType": "Care_Giver_Intervention"},
    {"status": true, "response": "", "descriptionType": "Reported_Provider_And_Careteam"}
  ]);
  const [lateSubmission, setLateSubmission] = useState([]);
    
    useEffect(() => {
      const careGiver = localStorage.getItem("userId");a
      const type = "charts";
  
      if (!selectedPatientId || !careGiver) return;
  
      const queryParams = new URLSearchParams({
        patient: charts.patientId,
        careGiver,
        type,
      }).toString();
  
      getData(`${URL}?${queryParams}`)
          .then((data) => {
              setLateSubmission(data.responseObject || []);
          })
          .catch(() => {}); 
    }, [selectedPatientId]);


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
  
  const isWithinAllowedTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
  
    // Default allowed submission window: 7:00 PM - 9:59 PM
    const withinDefaultTime = (hours === 19 || hours === 20 || (hours === 21 && minutes <= 59));
  
    // Check late submissions
    const withinLateSubmission = lateSubmission.some((entry) => {
      const startTime = new Date(entry.start);
      const endTime = new Date(startTime.getTime() + entry.duration * 60000); // Convert minutes to milliseconds
      return now >= startTime && now <= endTime;
    });
  
    return withinDefaultTime || withinLateSubmission;
  };
  

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    setErrors([]);
    const time = dayjs().format("YYYY-MM-DD HH:mm:ss")
    const payload = {
      patient: charts.patientId,
      behaviors,
      behaviorsDescription: behaviorsDescription,
      dateTaken: time,
    };
    try {
      const response = await postCharts(payload);
      if (response?.error) {
        setErrors(errorHandler(response.error));
      } else {
        setMessage(["Chart posted successfully."]);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setErrors([`Errors: ${error}`]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 1000); // Toggle every 2 seconds

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">Charts for {charts?.firstName} {charts?.lastName
      }</h2>

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
          {Object.entries(groupedBehaviors).map(([category, behaviorList]) => {
            return behaviorList.map((behavior, index) => {
              const originalIndex = chart.behaviors.findIndex((b) => b === behavior);
              return (
                <tr key={behavior.id} className="border border-gray-700">
                  {index === 0 && (
                    <td
                      className="p-3 border border-gray-700"
                      rowSpan={behaviorList.length} // Merge cells
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
            });
          })}
        </tbody>

        </table>
      </div>


      {/* Behaviors Description Table */}
      <div >
        <BehaviorDescriptions
          behaviorDescription={behaviorsDescription}
          handleChangeBehaviorDescription={handleChangeBehaviorDescription}
        />
      </div>
      {/* Submit Button */}
      <div className="mt-6 text-center">
      {!isWithinAllowedTime() && (
        <p className={`mb-2 text-red-500 ${blink ? "opacity-100" : "opacity-0"}`}>
          Chart entry must be done between 7:00 PM and 9:59 PM.
        </p>
      )}
      <button
        onClick={handleSubmit}
        className={`px-6 py-3 rounded-lg flex items-center justify-center ${
          loadingSubmit || behaviorStatuses.includes(null) || behaviorStatuses.includes("") || !isWithinAllowedTime()
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        disabled={loadingSubmit || behaviorStatuses.includes(null) || behaviorStatuses.includes("") || !isWithinAllowedTime()  }
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
