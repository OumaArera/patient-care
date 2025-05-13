import { useEffect, useState } from "react";
import { fetchPatients } from "../../../services/fetchPatients";
import { createData, getData } from "../../../services/updatedata";
import { getCurrentDate, getCurrentTimeSlot, getDatesFromAprilFirst, isTimeInPast } from "../../utils/dateTimeUtils";
import { errorHandler } from "../../../services/errorHandler";
import { TIME_SLOTS } from "../../utils/constants";

const SLEEP_URL = "https://patient-care-server.onrender.com/api/v1/sleeps";

export const useSleepPattern = () => {
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
    setSelectedSlots([]); 
    setBatchMode(false); 
  };

  // Function for handling batch slot selection
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

  // Toggle the report view
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
  
  // Get a time range for selection - either preset or custom
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
      const entry = missingEntries.find(entry => 
        entry.date === selectedDate && entry.slot === currentSlot
      );
      
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

  return {
    loadingPatients,
    loadingSleepData,
    selectedPatientId,
    filteredPatients,
    message,
    errors,
    submittingSlots,
    missingEntries: missingEntries.filter(entry => entry.date === selectedDate),
    filledEntries,
    selectedDate,
    showReport,
    selectedPatient,
    batchMode,
    selectedSlots,
    selectedStatus,
    formData,
    handlePatientSelect,
    handleMarkAndSubmitSleep,
    handleTimeSlotSelect,
    handleDateSelect,
    isSlotDisabled,
    isCurrentSelectionFilled,
    isSlotSelected,
    toggleBatchMode,
    toggleReportView,
    formatDate,
    selectTimeRange,
    submitBatchEntries,
    setSelectedStatus,
    setSelectedSlots
  };
};