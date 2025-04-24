import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createData, getData } from "../services/updatedata";
import { Loader, Moon } from "lucide-react";
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
    // Instead of require, use the already imported functions
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
  };

  // New function that combines sleep status selection and submission
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

  // Filter missing entries based on selected date
  const filteredMissingEntries = missingEntries.filter(entry => entry.date === selectedDate);

  // Handle toggling the report view
  const toggleReportView = () => {
    setShowReport(!showReport);
  };

  const formatDate = (dateString) => {
    // Implement here instead of using require
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
                    <ActionButtons 
                      onViewReport={toggleReportView}
                      onDownloadPDF={() => downloadSleepPatternData(filledEntries, selectedPatient)}
                      hasData={filledEntries.length > 0}
                    />
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
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TimeSlotsList 
                      entries={filteredMissingEntries}
                      onTimeSlotSelect={handleTimeSlotSelect}
                      isSlotDisabled={isSlotDisabled}
                      currentSelection={formData}
                      submittingSlots={submittingSlots}
                      sleepStatusDescriptions={SLEEP_STATUS_DESCRIPTIONS}
                      onMarkAndSubmit={(status) => 
                        handleMarkAndSubmitSleep(status, formData.dateTaken, formData.markedFor)
                      }
                    />
                    
                    <CurrentSelection 
                      formData={formData}
                      isCurrentSelectionFilled={isCurrentSelectionFilled}
                      sleepStatusDescriptions={SLEEP_STATUS_DESCRIPTIONS}
                      formatDate={formatDate}
                    />
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