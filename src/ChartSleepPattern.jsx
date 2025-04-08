import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createData, getData } from "../services/updatedata";
import { Loader, Moon } from "lucide-react";
import PatientList from "./sleep-components/PatientList";
import StatusSelector from "./sleep-components/StatusSelector";
import MissingEntriesList from "./sleep-components/MissingEntriesList";
import CurrentSelection from "./sleep-components/CurrentSelection";
import { 
  getCurrentDate, 
  getCurrentTimeSlot, 
  getDatesForLastThreeDays,
  formatDate,
  isTimeInPast 
} from "./utils/dateTimeUtils";
import { errorHandler } from "../services/errorHandler";

const SLEEP_URL = "https://patient-care-server.onrender.com/api/v1/sleeps";

const TIME_SLOTS = [
  { value: "7:00AM", label: "7:00 AM" },
  { value: "8:00AM", label: "8:00 AM" },
  { value: "9:00AM", label: "9:00 AM" },
  { value: "10:00AM", label: "10:00 AM" },
  { value: "11:00AM", label: "11:00 AM" },
  { value: "12:00PM", label: "12:00 PM (Noon)" },
  { value: "1:00PM", label: "1:00 PM" },
  { value: "2:00PM", label: "2:00 PM" },
  { value: "3:00PM", label: "3:00 PM" },
  { value: "4:00PM", label: "4:00 PM" },
  { value: "5:00PM", label: "5:00 PM" },
  { value: "6:00PM", label: "6:00 PM" },
  { value: "7:00PM", label: "7:00 PM" },
  { value: "8:00PM", label: "8:00 PM" },
  { value: "9:00PM", label: "9:00 PM" },
  { value: "10:00PM", label: "10:00 PM" },
  { value: "11:00PM", label: "11:00 PM" },
  { value: "12:00AM", label: "12:00 AM (Midnight)" },
  { value: "1:00AM", label: "1:00 AM" },
  { value: "2:00AM", label: "2:00 AM" },
  { value: "3:00AM", label: "3:00 AM" },
  { value: "4:00AM", label: "4:00 AM" },
  { value: "5:00AM", label: "5:00 AM" },
  { value: "6:00AM", label: "6:00 AM" },
];

const SleepPattern = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingSleepData, setLoadingSleepData] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(null);
  const [missingEntries, setMissingEntries] = useState([]);
  const [filledEntries, setFilledEntries] = useState([]);
  
  const [formData, setFormData] = useState({
    resident: null,
    markAs: "",
    dateTaken: null,
    reasonFilledLate: null,
    markedFor: ""
  });

  useEffect(() => {
    const branch = localStorage.getItem("branch");
    if (!branch) return;
    setLoadingPatients(true);
    
    fetchPatients()
      .then((data) => {
        const patients = data?.responseObject || [];
        const filtered = patients.filter(p => parseInt(p.branchId) === parseInt(branch));
        setFilteredPatients(filtered);
      })
      .catch(() => {
        setErrors(["Failed to load patients"]);
        setTimeout(() => setErrors([]), 5000);
      })
      .finally(() => setLoadingPatients(false));
  }, []);

  useEffect(() => {
    // Auto-set current time slot when component loads
    setFormData(prev => ({
      ...prev,
      markedFor: getCurrentTimeSlot(),
      dateTaken: getCurrentDate()
    }));
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchSleepData();
    }
  }, [selectedPatientId]);

  const fetchSleepData = async () => {
    setLoadingSleepData(true);
    try {
      const url = `${SLEEP_URL}?resident=${selectedPatientId}`;
      const response = await getData(url);
      if (response?.responseObject) {
        const sleepData = response.responseObject;
        setFilledEntries(sleepData);
        findMissingEntries(sleepData);
      }
    } catch (err) {
      setErrors(["Failed to load sleep data"]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoadingSleepData(false);
    }
  };

  const findMissingEntries = (data) => {
    const dates = getDatesForLastThreeDays();
    const missing = [];
    
    dates.forEach(date => {
      TIME_SLOTS.forEach(slot => {
        // Check if this slot is already filled
        const isSlotFilled = data.some(entry => 
          entry.dateTaken === date && entry.markedFor === slot.value
        );
        
        if (!isSlotFilled && isTimeInPast(date, slot.value)) {
          missing.push({
            date,
            slot: slot.value,
            requiresReason: date !== getCurrentDate(),
            isCurrentTimeSlot: date === getCurrentDate() && slot.value === getCurrentTimeSlot(),
            disabled: false
          });
        }
      });
    });
    
    setMissingEntries(missing);
  };

  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId);
    setFormData(prev => ({ 
      ...prev, 
      resident: patientId,
      markAs: "",
      reasonFilledLate: null
    }));
  };

  const handleMarkSleep = (sleepStatus) => {
    setFormData(prev => ({ 
      ...prev, 
      markAs: sleepStatus 
    }));
  };

  const handleTimeSlotSelect = (entry) => {
    // Check if the slot is already filled
    const isAlreadyFilled = isSlotAlreadyFilled(entry.date, entry.slot);
    
    if (isAlreadyFilled) {
      setErrors([`Entry for ${entry.slot} on ${formatDate(entry.date)} already exists`]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      markedFor: entry.slot,
      dateTaken: entry.date,
      reasonFilledLate: entry.requiresReason ? prev.reasonFilledLate : null
    }));
    
    setCurrentTimeSlot(entry);
  };

  const handleReasonChange = (e) => {
    setFormData(prev => ({
      ...prev,
      reasonFilledLate: e.target.value
    }));
  };

  // New function to check if a slot is already filled
  const isSlotAlreadyFilled = (date, slot) => {
    return filledEntries.some(
      entry => entry.dateTaken === date && entry.markedFor === slot
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.resident) {
      setErrors(["Please select a resident"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    if (!formData.markAs) {
      setErrors(["Please select a sleep status"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    if (!formData.markedFor) {
      setErrors(["Time slot is required"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }

    // Check if entry already exists for this time slot
    if (isSlotAlreadyFilled(formData.dateTaken, formData.markedFor)) {
      setErrors([`An entry for ${formData.markedFor} on ${formatDate(formData.dateTaken)} already exists`]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }

    // Check if reason is required but not provided
    const isLateEntry = formData.dateTaken !== getCurrentDate();
    if (isLateEntry && !formData.reasonFilledLate) {
      setErrors(["Please provide a reason for late entry"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await createData(SLEEP_URL, formData);
      if (response?.error) {
        setErrors(errorHandler(response.error));
        setTimeout(() => setErrors([]), 5000);
      } else {
        setMessage("Sleep pattern recorded successfully");
        await fetchSleepData(); // Refresh data after submission
        
        // Reset form except patient selection
        setFormData(prev => ({
          ...prev,
          markAs: "",
          reasonFilledLate: null,
          markedFor: getCurrentTimeSlot(),
          dateTaken: getCurrentDate()
        }));
      }
    } catch (err) {
      setErrors(["An error occurred while saving data"]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setMessage("");
        setErrors([]);
      }, 5000);
    }
  };

  // Updated to check both filled entries and current selection
  const isSlotDisabled = (entry) => {
    return isSlotAlreadyFilled(entry.date, entry.slot);
  };

  // Check if currently selected slot is already filled
  const isCurrentSelectionFilled = () => {
    return formData.dateTaken && formData.markedFor && 
      isSlotAlreadyFilled(formData.dateTaken, formData.markedFor);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Moon size={24} className="text-blue-400 mr-2" />
        Sleep Pattern Tracking
      </h2>

      {loadingPatients ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
              <h3 className="text-xl font-semibold mb-3">Select Resident</h3>
              <PatientList 
                patients={filteredPatients}
                selectedPatientId={selectedPatientId}
                onPatientSelect={handlePatientSelect}
              />
            </div>
          </div>
          
          {/* Right Column - Sleep Status and Form */}
          <div className="lg:col-span-2">
            {selectedPatientId ? (
              loadingSleepData ? (
                <div className="flex justify-center items-center h-32">
                  <Loader className="animate-spin" size={32} />
                </div>
              ) : (
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Record Sleep Status</h3>
                  
                  {/* Status Selection */}
                  <StatusSelector
                    currentStatus={formData.markAs}
                    onStatusChange={handleMarkSleep}
                    disabled={isCurrentSelectionFilled()}
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Missing Entries */}
                    <div>
                      <h4 className="text-lg font-medium mb-3">Missing Entries</h4>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {missingEntries.length > 0 ? (
                          missingEntries.map((entry, idx) => (
                            <button
                              key={`${entry.date}-${entry.slot}`}
                              onClick={() => handleTimeSlotSelect(entry)}
                              disabled={isSlotDisabled(entry)}
                              className={`p-2 rounded text-left w-full flex items-center justify-between ${
                                formData.dateTaken === entry.date && formData.markedFor === entry.slot
                                  ? "bg-blue-700 text-white"
                                  : isSlotDisabled(entry)
                                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-700 hover:bg-gray-600"
                              }`}
                            >
                              <span>
                                {entry.slot} - {formatDate(entry.date)}
                              </span>
                              {entry.isCurrentTimeSlot && (
                                <span className="text-xs bg-green-600 px-2 py-1 rounded">Current</span>
                              )}
                              {isSlotDisabled(entry) && !entry.isCurrentTimeSlot && (
                                <span className="text-xs bg-gray-600 px-2 py-1 rounded">Filled</span>
                              )}
                            </button>
                          ))
                        ) : (
                          <p className="text-gray-400">No missing entries</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Current Selection */}
                    <div>
                      <h4 className="text-lg font-medium mb-3">Current Selection</h4>
                      <div className="bg-gray-700 p-4 rounded">
                        <p className="mb-2">
                          <span className="text-gray-400">Time: </span>
                          <span className="font-medium">{formData.markedFor || "Not selected"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-400">Date: </span>
                          <span className="font-medium">{formData.dateTaken ? formatDate(formData.dateTaken) : "Not selected"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-400">Status: </span>
                          <span className="font-medium">{formData.markAs || "Not selected"}</span>
                        </p>
                        
                        {/* Show warning if entry already exists */}
                        {isCurrentSelectionFilled() && (
                          <div className="mt-2 p-2 bg-yellow-800 rounded text-sm">
                            An entry for this time slot already exists and cannot be modified.
                          </div>
                        )}
                        
                        {/* Inline reason field for late entries */}
                        {currentTimeSlot && currentTimeSlot.requiresReason && !isCurrentSelectionFilled() && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Reason for Late Entry <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={formData.reasonFilledLate || ""}
                              onChange={handleReasonChange}
                              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
                              rows="3"
                              placeholder="Please provide reason for late entry"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Fixed Submit Section */}
                      <div className="mt-6 sticky bottom-4">
                        {errors.length > 0 && (
                          <div className="mb-4 p-3 bg-red-800 rounded">
                            {errors.map((error, index) => (
                              <p key={index} className="text-sm text-white">{error}</p>
                            ))}
                          </div>
                        )}

                        {message && (
                          <div className="mb-4 p-3 bg-green-800 rounded">
                            <p className="text-sm text-white">{message}</p>
                          </div>
                        )}

                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !formData.markAs || !formData.markedFor || isCurrentSelectionFilled()}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full disabled:bg-gray-600"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Sleep Record"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">
                  Please select a resident to record sleep patterns
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepPattern;