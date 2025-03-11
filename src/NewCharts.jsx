import React, { useState, useEffect } from "react";
import { postCharts } from "../services/postCharts";
import { Loader } from "lucide-react";
import dayjs from "dayjs";
import { errorHandler } from "../services/errorHandler";
import { getData } from "../services/updatedata";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reasonFilledLate, setReasonFilledLate] = useState("");
    
    useEffect(() => {
      const careGiver = localStorage.getItem("userId");
      const type = "charts";
  
      if (!charts.patientId || !careGiver) return;
  
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
    }, [charts.patientId]);

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
    console.log("Late: ", lateSubmission);
    // Check late submissions
    const withinLateSubmission = lateSubmission.some((entry) => {
      const startTime = new Date(entry.start);
      const endTime = new Date(startTime.getTime() + entry.duration * 60000); 
      return now >= startTime && now <= endTime;
    });
  
    return withinDefaultTime || withinLateSubmission;
  };
  
  
  const handleSubmit = async () => {
    setLoadingSubmit(true);
    setErrors([]);
    const time = isWithinAllowedTime() && lateSubmission.length > 0
      ? dayjs(selectedDate).format("YYYY-MM-DD HH:mm:ss")
      : dayjs().format("YYYY-MM-DD HH:mm:ss");
      const payload = {
        patient: charts.patientId,
        behaviors,
        behaviorsDescription,
        dateTaken: time,
        ...(lateSubmission.length > 0 && isWithinAllowedTime() && reasonFilledLate
          ? { reasonFilledLate }
          : {})
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
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">Charts for {charts?.firstName} {charts?.lastName
      }</h2>
      
      {lateSubmission.length > 0 && isWithinAllowedTime() && (
        <>
          <div className="mb-4">
            {lateSubmission
              .filter((entry) => {
                const now = new Date();
                const startTime = new Date(entry.start);
                const endTime = new Date(startTime.getTime() + entry.duration * 60000);
                return now >= startTime && now <= endTime; 
              })
              .map((entry) => {
                const startTime = new Date(entry.start);
                const endTime = new Date(startTime.getTime() + entry.duration * 60000);
                return (
                  <div key={entry.start} className="mb-2">
                    <p className="text-red-600">{entry.reasonForLateSubmission}</p>
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
            <DatePicker
              selected={selectedDate || dayjs().set("hour", 19).set("minute", 15).toDate()} // 
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              minTime={dayjs().set("hour", 19).set("minute", 0).toDate()}
              maxTime={dayjs().set("hour", 20).set("minute", 59).toDate()}
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
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
        <div className="mt-2 mb-4 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-md">
          <p className={`text-xl md:text-2xl font-bold text-red-600 ${blink ? "opacity-100" : "opacity-0"} transition-opacity duration-500 flex items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            CHART ENTRY RESTRICTED
          </p>
          <p className="text-lg md:text-xl text-red-800 mt-2 font-medium">
            Entries are only permitted between <span className="underline font-bold">7:00 PM</span> and <span className="underline font-bold">9:59 PM</span>.
          </p>
        </div>
      )}
      <button
        onClick={handleSubmit}
        className={`px-6 py-3 rounded-lg flex items-center justify-center ${
          loadingSubmit || behaviorStatuses.includes(null) || behaviorStatuses.includes("") || !isWithinAllowedTime() || !reasonFilledLate
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
