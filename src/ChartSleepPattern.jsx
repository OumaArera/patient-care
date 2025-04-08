import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createData, getData } from "../services/updatedata";
import { Loader, Check, AlertCircle } from "lucide-react";
import { FaUserCircle, FaBed, FaRegClock } from "react-icons/fa";

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
  const [patients, setPatients] = useState([]);
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

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Determine current time slot based on time
  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Format to match time slots
    let hour = hours % 12;
    if (hour === 0) hour = 12;
    const ampm = hours < 12 ? "AM" : "PM";
    
    // Round down to the nearest hour
    return `${hour}:00${ampm}`;
  };

  // Generate dates for today, yesterday and day before yesterday
  const getDatesForLastThreeDays = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    
    return [
      today.toISOString().split('T')[0],
      yesterday.toISOString().split('T')[0],
      dayBeforeYesterday.toISOString().split('T')[0]
    ];
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if a given time is in the past
  const isTimeInPast = (date, timeSlot) => {
    const now = new Date();
    const entryDate = new Date(date);
    
    // If date is in the past, time is definitely in the past
    if (entryDate.getDate() < now.getDate() || 
        entryDate.getMonth() < now.getMonth() || 
        entryDate.getFullYear() < now.getFullYear()) {
      return true;
    }
    
    // If it's today, check the time
    if (entryDate.getDate() === now.getDate() && 
        entryDate.getMonth() === now.getMonth() && 
        entryDate.getFullYear() === now.getFullYear()) {
      
      const slotHour = parseInt(timeSlot.match(/\d+/)[0]);
      const slotAmPm = timeSlot.includes("AM") ? "AM" : "PM";
      let hour24Format = slotHour;
      
      if (slotAmPm === "PM" && slotHour !== 12) {
        hour24Format += 12;
      } else if (slotAmPm === "AM" && slotHour === 12) {
        hour24Format = 0;
      }
      
      return now.getHours() > hour24Format || 
             (now.getHours() === hour24Format && now.getMinutes() > 0);
    }
    
    return false;
  };

  useEffect(() => {
    const branch = localStorage.getItem("branch");
    if (!branch) return;
    
    setLoadingPatients(true);
    fetchPatients(branch)
      .then((data) => {
        setPatients(data?.responseObject || []);
      })
      .catch(() => {
        setError("Failed to load patients");
        setTimeout(() => setError(""), 5000);
      })
      .finally(() => setLoadingPatients(false));
  }, []);

  useEffect(() => {
    // Auto-set current time slot when component loads
    const currentSlot = getCurrentTimeSlot();
    setFormData(prev => ({
      ...prev,
      markedFor: currentSlot,
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
        setSleepData(response.responseObject);
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

  const handleTimeSlotSelect = (slot, requiresReason) => {
    if (requiresReason) {
      setCurrentTimeSlot(slot);
      setReasonModalOpen(true);
      setFormData(prev => ({
        ...prev,
        markedFor: slot.slot,
        dateTaken: slot.date
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        markedFor: slot.slot,
        dateTaken: slot.date,
        reasonFilledLate: null
      }));
    }
  };

  const handleReasonChange = (e) => {
    setFormData(prev => ({
      ...prev,
      reasonFilledLate: e.target.value
    }));
  };

  const confirmReason = () => {
    if (!formData.reasonFilledLate) {
      setError("Please provide a reason for late entry");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setReasonModalOpen(false);
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
      <h2 className="text-2xl font-bold mb-4">Sleep Pattern Tracking</h2>

      {loadingPatients ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Select Resident</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <div
                  key={patient.patientId}
                  className={`p-4 rounded-lg shadow-lg cursor-pointer ${
                    selectedPatientId === patient.patientId
                      ? "bg-green-800"
                      : "bg-gray-800"
                  }`}
                  onClick={() => handlePatientSelect(patient.patientId)}
                >
                  <FaUserCircle size={50} className="mx-auto text-blue-400 mb-3" />
                  <h3 className="text-lg font-bold text-center">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-center text-gray-400">
                    ID: {patient.patientId}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {selectedPatientId && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              {loadingSleepData ? (
                <div className="flex justify-center items-center h-32">
                  <Loader className="animate-spin" size={32} />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-4">Record Sleep Status</h3>
                  
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="flex space-x-4">
                      <button
                        className={`flex items-center px-4 py-2 rounded ${
                          formData.markAs === "A"
                            ? "bg-yellow-600"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => handleMarkSleep("A")}
                      >
                        <Check className="mr-2" size={18} />
                        Awake
                      </button>
                      <button
                        className={`flex items-center px-4 py-2 rounded ${
                          formData.markAs === "S"
                            ? "bg-blue-800"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => handleMarkSleep("S")}
                      >
                        <FaBed className="mr-2" size={18} />
                        Sleeping
                      </button>
                    </div>
                  </div>

                  {missingEntries.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Missing Entries</h4>
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {missingEntries.map((entry, idx) => {
                            const isSelected = 
                              formData.dateTaken === entry.date && 
                              formData.markedFor === entry.slot;
                            
                            return (
                              <div 
                                key={idx} 
                                className={`flex items-center justify-between p-3 rounded cursor-pointer ${
                                  isSelected ? "bg-green-700" : "bg-gray-800 hover:bg-gray-600"
                                }`}
                                onClick={() => handleTimeSlotSelect(entry, entry.requiresReason)}
                              >
                                <div>
                                  <span className="font-medium">{entry.slot}</span>
                                  <span className="text-sm text-gray-400 block">
                                    {formatDate(entry.date)}
                                  </span>
                                </div>
                                {entry.requiresReason && (
                                  <AlertCircle size={18} className="text-yellow-400" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-medium mb-2 flex items-center">
                      <FaRegClock className="mr-2" size={16} />
                      Current Selection
                    </h4>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400">Date</label>
                          <div className="font-medium">
                            {formData.dateTaken ? formatDate(formData.dateTaken) : "Not selected"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400">Time</label>
                          <div className="font-medium">
                            {formData.markedFor || "Not selected"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400">Status</label>
                          <div className="font-medium">
                            {formData.markAs === "A" ? "Awake" : 
                             formData.markAs === "S" ? "Sleeping" : 
                             "Not selected"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

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
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full disabled:bg-gray-600"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Sleep Record"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Modal for entering reason for late entry */}
          {reasonModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Late Entry Reason Required</h3>
                <p className="mb-4">
                  You're entering data for {currentTimeSlot?.slot} on {formatDate(currentTimeSlot?.date)}.
                  Please provide a reason for this late entry:
                </p>
                <textarea
                  className="w-full p-3 bg-gray-700 text-white rounded mb-4"
                  rows="3"
                  placeholder="Enter reason for late entry..."
                  value={formData.reasonFilledLate}
                  onChange={handleReasonChange}
                ></textarea>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                    onClick={() => setReasonModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                    onClick={confirmReason}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SleepPattern;