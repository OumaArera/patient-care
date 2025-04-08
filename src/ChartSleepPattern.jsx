// SleepPattern.jsx
import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createData, getData } from "../services/updatedata";
import { Loader, Moon } from "lucide-react";
import PatientList from "./sleep-components/PatientList";
import StatusSelector from "./sleep-components/StatusSelector";
import MissingEntriesList from "./sleep-components/MissingEntriesList";
import CurrentSelection from "./sleep-components/CurrentSelection";
import ReasonModal from "./sleep-components/ReasonModal";
import { 
  getCurrentDate, 
  getCurrentTimeSlot, 
  getDatesForLastThreeDays,
  formatDate,
  isTimeInPast 
} from "./utils/dateTimeUtils";

const SLEEP_URL = "https://patient-care-server.onrender.com/api/v1/assessments";

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
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(null);
  const [missingEntries, setMissingEntries] = useState([]);
  
  const [formData, setFormData] = useState({
    resident: null,
    markAs: "",
    dateTaken: null,
    reasonFilledLate: "",
    markedFor: ""
  });

  useEffect(() => {
    const branch = localStorage.getItem("branch");
    if (!branch) return;
    setLoadingPatients(true);
    
    fetchPatients()
      .then((data) => {
        const patients = data?.responseObject || [];
        // setAllPatients(patients);
        // Filter patients client-side based on branch
        const filtered = patients.filter(p => parseInt(p.branchId) === parseInt(branch));
        setFilteredPatients(filtered);
      })
      .catch(() => {
        setError("Failed to load patients");
        setTimeout(() => setError(""), 5000);
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
        // setSleepData(response.responseObject);
        findMissingEntries(response.responseObject);
      }
    } catch (err) {
      setError("Failed to load sleep data");
      setTimeout(() => setError(""), 5000);
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
            requiresReason: date !== getCurrentDate()
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
      resident: patientId 
    }));
  };

  const handleMarkSleep = (sleepStatus) => {
    setFormData(prev => ({ 
      ...prev, 
      markAs: sleepStatus 
    }));
  };

  const handleTimeSlotSelect = (entry) => {
    if (entry.requiresReason) {
      setCurrentTimeSlot(entry);
      setReasonModalOpen(true);
    }
    
    setFormData(prev => ({
      ...prev,
      markedFor: entry.slot,
      dateTaken: entry.date,
      reasonFilledLate: entry.requiresReason ? prev.reasonFilledLate : null
    }));
  };

  const handleReasonChange = (reason) => {
    setFormData(prev => ({
      ...prev,
      reasonFilledLate: reason
    }));
  };

  const confirmReason = () => {
    if (!formData.reasonFilledLate) {
      setError("Please provide a reason for late entry");
      setTimeout(() => setError(""), 5000);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.resident) {
      setError("Please select a resident");
      setTimeout(() => setError(""), 5000);
      return;
    }
    
    if (!formData.markAs) {
      setError("Please mark resident as Awake or Sleeping");
      setTimeout(() => setError(""), 5000);
      return;
    }
    
    if (!formData.markedFor) {
      setError("Time slot is required");
      setTimeout(() => setError(""), 5000);
      return;
    }

    // Check if reason is required but not provided
    const isLateEntry = formData.dateTaken !== getCurrentDate();
    if (isLateEntry && !formData.reasonFilledLate) {
      setError("Please provide a reason for late entry");
      setTimeout(() => setError(""), 5000);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await createData(SLEEP_URL, formData);
      if (response?.error) {
        setError("Failed to save sleep pattern");
      } else {
        setMessage("Sleep pattern recorded successfully");
        fetchSleepData(); // Refresh data
        
        // Reset form except patient selection
        setFormData(prev => ({
          ...prev,
          markAs: "",
          reasonFilledLate: "",
          markedFor: getCurrentTimeSlot(),
          dateTaken: getCurrentDate()
        }));
      }
    } catch (err) {
      setError("An error occurred while saving data");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);
    }
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
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Missing Entries */}
                    <div>
                      <MissingEntriesList 
                        entries={missingEntries}
                        selectedDate={formData.dateTaken}
                        selectedSlot={formData.markedFor}
                        onEntrySelect={handleTimeSlotSelect}
                      />
                    </div>
                    
                    {/* Current Selection */}
                    <div>
                      <CurrentSelection formData={formData} />
                      
                      {/* Fixed Submit Section */}
                      <div className="mt-6 sticky bottom-4">
                        {error && (
                          <div className="mb-4 p-3 bg-red-800 rounded">
                            <p className="text-sm text-white">{error}</p>
                          </div>
                        )}

                        {message && (
                          <div className="mb-4 p-3 bg-green-800 rounded">
                            <p className="text-sm text-white">{message}</p>
                          </div>
                        )}

                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
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

      {/* Modal for entering reason for late entry */}
      {reasonModalOpen && (
        <ReasonModal
          timeSlot={currentTimeSlot}
          reason={formData.reasonFilledLate}
          onReasonChange={handleReasonChange}
          onConfirm={() => {
            if (confirmReason()) setReasonModalOpen(false);
          }}
          onCancel={() => setReasonModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SleepPattern;