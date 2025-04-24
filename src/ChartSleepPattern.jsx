import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createData, getData } from "../services/updatedata";
import { Loader, Moon, Check, X } from "lucide-react";
import { getCurrentDate, getCurrentTimeSlot, getDatesFromAprilFirst, isTimeInPast } from "./utils/dateTimeUtils";
import { errorHandler } from "../services/errorHandler";
import { TIME_SLOTS } from "./utils/constants";

// Import compartmentalized components
import PatientList from "./sleep-components/PatientList";
import DateSelector from "./sleep-components/DateSelector";
import TimeSlotsList from "./sleep-components/TimeSlotsList";
import CurrentSelection from "./sleep-components/CurrentSelection";
import SleepPatternReport from "./sleep-components/SleepPatternReport";
import ActionButtons from "./sleep-components/ActionButtons";
import Notifications from "./sleep-components/Notifications";

const SLEEP_URL = "https://patient-care-server.onrender.com/api/v1/sleeps";

// Sleep status descriptions for reporting
const SLEEP_STATUS_DESCRIPTIONS = {
  "A": "Awake",
  "S": "Sleeping",
  "N/A": "Resident not at the Facility"
};

const SleepPattern = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingSleepData, setLoadingSleepData] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [submittingSlots, setSubmittingSlots] = useState({});
  const [missingEntries, setMissingEntries] = useState([]);
  const [filledEntries, setFilledEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [showReport, setShowReport] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  
  const [formData, setFormData] = useState({
    resident: null,
    markAs: "",
    dateTaken: getCurrentDate(),
    reasonFilledLate: null,
    markedFor: getCurrentTimeSlot()
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
      // Find the selected patient data
      const patient = filteredPatients.find(p => parseInt(p.patientId) === parseInt(selectedPatientId));
      setSelectedPatient(patient);
    }
  }, [selectedPatientId, filteredPatients]);

  const fetchSleepData = async () => {
    setLoadingSleepData(true);
    try {
      const url = `${SLEEP_URL}?resident=${selectedPatientId}`;
      const response = await getData(url);
      
      if (response?.responseObject) {
        const sleepData = response.responseObject;
        setFilledEntries(sleepData);
        findMissingEntries(sleepData);
        return;
      }
      // If we reach here, there was likely no error but no data either
      setFilledEntries([]);
      findMissingEntries([]);
    } catch (err) {
      console.error("Error fetching sleep data:", err);
      setErrors(["Failed to load sleep data"]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoadingSleepData(false);
    }
  };

  const findMissingEntries = (data) => {
    const dates = getDatesFromAprilFirst();
    const missing = [];
    
    dates.forEach(date => {
      TIME_SLOTS.forEach(slot => {
        const isSlotFilled = data.some(entry => 
          entry.dateTaken === date && entry.markedFor === slot.value
        );
        
        if (!isSlotFilled && isTimeInPast(date, slot.value)) {
          missing.push({
            date,
            slot: slot.value,
            requiresReason: false,
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
    const patient = filteredPatients.find(p => parseInt(p.patientId) === parseInt(patientId));
    setSelectedPatient(patient);
    setFormData(prev => ({ 
      ...prev, 
      resident: patientId,
      markAs: "",
      reasonFilledLate: null
    }));
    setShowReport(false);
    setSelectedSlots([]); // Clear selected slots when changing patients
    setBatchMode(false);  // Exit batch mode when changing patients
  };

  // New function for handling batch slot selection
  const handleSlotToggle = (entry) => {
    if (!batchMode) return;
    
    const slotKey = `${entry.date}-${entry.slot}`;
    
    // Check if this slot is already selected
    if (selectedSlots.some(slot => slot.key === slotKey)) {
      // Remove from selected slots
      setSelectedSlots(prev => prev.filter(slot => slot.key !== slotKey));
    } else {
      // Add to selected slots
      setSelectedSlots(prev => [...prev, {
        key: slotKey,
        date: entry.date,
        slot: entry.slot
      }]);
    }
  };

  // Function to submit all selected slots with the chosen status
  const submitBatchEntries = async () => {
    if (!selectedPatientId) {
      setErrors(["Please select a resident"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    if (!selectedStatus) {
      setErrors(["Please select a sleep status"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    if (selectedSlots.length === 0) {
      setErrors(["Please select at least one time slot"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    // Mark all slots as submitting
    const newSubmittingState = {};
    selectedSlots.forEach(slot => {
      newSubmittingState[slot.key] = true;
    });
    setSubmittingSlots(prev => ({ ...prev, ...newSubmittingState }));
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each slot sequentially to avoid overwhelming the server
    for (const slot of selectedSlots) {
      // Prepare data for submission
      const submissionData = {
        resident: selectedPatientId,
        markAs: selectedStatus,
        dateTaken: slot.date,
        reasonFilledLate: null,
        markedFor: slot.slot
      };
      
      try {
        const response = await createData(SLEEP_URL, submissionData);
        if (response?.error) {
          errorCount++;
          console.error(`Error submitting ${slot.key}:`, response.error);
        } else {
          successCount++;
        }
      } catch (err) {
        errorCount++;
        console.error(`Error submitting ${slot.key}:`, err);
      }
      
      // Remove this submission from loading state
      setSubmittingSlots(prev => {
        const newState = { ...prev };
        delete newState[slot.key];
        return newState;
      });
    }
    
    // Show completion message
    if (successCount > 0 && errorCount === 0) {
      setMessage(`Successfully recorded ${successCount} sleep entries as ${selectedStatus}`);
    } else if (successCount > 0 && errorCount > 0) {
      setMessage(`Recorded ${successCount} entries, but ${errorCount} failed`);
    } else {
      setErrors(["Failed to submit sleep entries"]);
    }
    
    // Reset selected slots and fetch updated data
    setSelectedSlots([]);
    await fetchSleepData();
    
    setTimeout(() => {
      setMessage("");
      setErrors([]);
    }, 5000);
  };

  // Original single submission function
  const handleMarkAndSubmitSleep = async (sleepStatus, date, timeSlot) => {
    if (!selectedPatientId) {
      setErrors(["Please select a resident"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    // Create a unique key for this submission
    const submissionKey = `${date}-${timeSlot}`;
    
    // Check if this slot is already being submitted
    if (submittingSlots[submissionKey]) {
      return;
    }
    
    // Check if entry already exists for this time slot
    if (isSlotAlreadyFilled(date, timeSlot)) {
      setErrors([`An entry for ${timeSlot} on ${formatDate(date)} already exists`]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    // Set the submission state to loading
    setSubmittingSlots(prev => ({ ...prev, [submissionKey]: true }));
    
    // Prepare data for submission
    const submissionData = {
      resident: selectedPatientId,
      markAs: sleepStatus,
      dateTaken: date,
      reasonFilledLate: null,
      markedFor: timeSlot
    };
    
    try {
      const response = await createData(SLEEP_URL, submissionData);
      if (response?.error) {
        setErrors(errorHandler(response.error));
      } else {
        setMessage(`${sleepStatus} status recorded for ${timeSlot}`);
        await fetchSleepData(); // Refresh data after submission
      }
    } catch (err) {
      setErrors(["An error occurred while saving data"]);
    } finally {
      // Remove this submission from loading state
      setSubmittingSlots(prev => {
        const newState = { ...prev };
        delete newState[submissionKey];
        return newState;
      });
      
      setTimeout(() => {
        setMessage("");
        setErrors([]);
      }, 5000);
    }
  };

  const handleTimeSlotSelect = (entry) => {
    if (batchMode) {
      handleSlotToggle(entry);
      return;
    }
    
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
      reasonFilledLate: null 
    }));
  };

  const handleDateSelect = (e) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);
    
    // Update the form data with the selected date
    setFormData(prev => ({
      ...prev,
      dateTaken: selectedDate
    }));
    
    // Refresh the missing entries for this date
    if (filledEntries.length > 0) {
      findMissingEntries(filledEntries);
    }
    
    // Clear selected slots when changing dates
    if (batchMode) {
      setSelectedSlots([]);
    }
  };

  // Function to check if a slot is already filled
  const isSlotAlreadyFilled = (date, slot) => {
    return filledEntries.some(
      entry => entry.dateTaken === date && entry.markedFor === slot
    );
  };

  // Check if slot is disabled (already filled)
  const isSlotDisabled = (entry) => {
    return isSlotAlreadyFilled(entry.date, entry.slot);
  };

  // Check if currently selected slot is already filled
  const isCurrentSelectionFilled = () => {
    return formData.dateTaken && formData.markedFor && 
      isSlotAlreadyFilled(formData.dateTaken, formData.markedFor);
  };

  // Check if a slot is selected in batch mode
  const isSlotSelected = (entry) => {
    const slotKey = `${entry.date}-${entry.slot}`;
    return selectedSlots.some(slot => slot.key === slotKey);
  };

  // Toggle batch selection mode
  const toggleBatchMode = () => {
    if (batchMode) {
      // If exiting batch mode, clear all selected slots
      setSelectedSlots([]);
      setSelectedStatus("");
    }
    setBatchMode(!batchMode);
  };

  // Filter missing entries based on selected date
  const filteredMissingEntries = missingEntries.filter(entry => entry.date === selectedDate);

  // Handle toggling the report view
  const toggleReportView = () => {
    setShowReport(!showReport);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Get a time range for selection
  const selectTimeRange = (startTime, endTime) => {
    if (!batchMode) {
      setBatchMode(true);
    }
    
    const timeSlots = TIME_SLOTS.map(slot => slot.value);
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex === -1 || endIndex === -1) {
      setErrors(["Invalid time range"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }
    
    // Handle wrap-around (e.g., 11:00PM to 5:00AM spans across midnight)
    const newSelected = [];
    let currentIndex = startIndex;
    
    while (true) {
      const currentSlot = timeSlots[currentIndex];
      const entry = filteredMissingEntries.find(entry => entry.slot === currentSlot);
      
      if (entry && !isSlotAlreadyFilled(entry.date, entry.slot)) {
        newSelected.push({
          key: `${entry.date}-${entry.slot}`,
          date: entry.date,
          slot: entry.slot
        });
      }
      
      if (currentIndex === endIndex) break;
      
      // Move to next slot, wrap around if needed
      currentIndex = (currentIndex + 1) % timeSlots.length;
    }
    
    setSelectedSlots(newSelected);
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
      ) : showReport && selectedPatientId ? (
        <>
          <ActionButtons 
            onBack={toggleReportView} 
            showBackOnly={true} 
          />
          <SleepPatternReport 
            sleepData={filledEntries} 
            resident={selectedPatient} 
          />
        </>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Record Sleep Status</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={toggleBatchMode}
                        className={`px-3 py-1 rounded-md ${
                          batchMode ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {batchMode ? "Exit Batch Mode" : "Batch Mode"}
                      </button>
                      <ActionButtons 
                        onViewReport={toggleReportView}
                        onDownloadPDF={() => downloadSleepPatternData(filledEntries, selectedPatient)}
                        hasData={filledEntries.length > 0}
                      />
                    </div>
                  </div>
                  
                  <DateSelector 
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    getCurrentDate={getCurrentDate}
                  />
                  
                  <Notifications 
                    errors={errors} 
                    message={message} 
                  />
                  
                  {batchMode && (
                    <div className="mb-4 bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-lg font-medium mb-2">Batch Selection Mode</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="text-sm">Quick select:</div>
                        <button 
                          onClick={() => selectTimeRange("11:00PM", "5:00AM")}
                          className="px-2 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700"
                        >
                          11:00PM - 5:00AM
                        </button>
                        <button 
                          onClick={() => selectTimeRange("12:00AM", "6:00AM")}
                          className="px-2 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700"
                        >
                          12:00AM - 6:00AM
                        </button>
                        <button 
                          onClick={() => selectTimeRange("10:00PM", "6:00AM")}
                          className="px-2 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700"
                        >
                          10:00PM - 6:00AM
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="font-medium">Mark selected as:</div>
                        <div className="flex gap-2">
                          {Object.entries(SLEEP_STATUS_DESCRIPTIONS).map(([status, description]) => (
                            <button
                              key={status}
                              onClick={() => setSelectedStatus(status)}
                              className={`px-3 py-1 rounded-md ${
                                selectedStatus === status
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-600 text-gray-300"
                              }`}
                            >
                              {description}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="mr-2">Selected: {selectedSlots.length} slots</span>
                        <button
                          onClick={submitBatchEntries}
                          disabled={selectedSlots.length === 0 || !selectedStatus}
                          className={`flex items-center px-3 py-1 rounded-md ${
                            selectedSlots.length > 0 && selectedStatus
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-700 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Check size={16} className="mr-1" />
                          Submit All
                        </button>
                        <button
                          onClick={() => setSelectedSlots([])}
                          disabled={selectedSlots.length === 0}
                          className={`flex items-center ml-2 px-3 py-1 rounded-md ${
                            selectedSlots.length > 0
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-gray-700 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <X size={16} className="mr-1" />
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-2">Available Time Slots</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {filteredMissingEntries.length > 0 ? (
                          filteredMissingEntries.map((entry) => {
                            const isDisabled = isSlotDisabled(entry);
                            const isSelected = isSlotSelected(entry);
                            const isSubmitting = submittingSlots[`${entry.date}-${entry.slot}`];
                            
                            return (
                              <div
                                key={`${entry.date}-${entry.slot}`}
                                onClick={() => !isDisabled && handleTimeSlotSelect(entry)}
                                className={`p-2 rounded cursor-pointer border ${
                                  isDisabled
                                    ? "bg-gray-700 text-gray-500 border-gray-700 cursor-not-allowed"
                                    : isSelected
                                    ? "bg-blue-700 border-blue-500"
                                    : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{entry.slot}</span>
                                  {isSubmitting && (
                                    <Loader size={16} className="animate-spin" />
                                  )}
                                  {!isSubmitting && isSelected && (
                                    <Check size={16} className="text-blue-300" />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-2 p-4 text-center text-gray-400">
                            No missing entries for this date
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!batchMode && (
                      <CurrentSelection 
                        formData={formData}
                        isCurrentSelectionFilled={isCurrentSelectionFilled}
                        sleepStatusDescriptions={SLEEP_STATUS_DESCRIPTIONS}
                        formatDate={formatDate}
                        onMarkAndSubmit={(status) => 
                          handleMarkAndSubmitSleep(status, formData.dateTaken, formData.markedFor)
                        }
                      />
                    )}
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