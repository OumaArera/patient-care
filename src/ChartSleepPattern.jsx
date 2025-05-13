import React from "react";
import { Loader, Moon } from "lucide-react";
import { useSleepPattern } from './sleep-components/hooks/useSleepPattern';
import PatientList from "./sleep-components/PatientList";


// Import view components
import { SleepEntryForm, SleepPatternView } from "./views/SleepPatternView";

const SleepPattern = () => {
  const {
    loadingPatients,
    loadingSleepData,
    selectedPatientId,
    filteredPatients,
    message,
    errors,
    submittingSlots,
    missingEntries,
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
  } = useSleepPattern();

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
        <SleepPatternView 
          toggleReportView={toggleReportView}
          filledEntries={filledEntries}
          selectedPatient={selectedPatient}
        />
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
                <SleepEntryForm
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  errors={errors}
                  message={message}
                  batchMode={batchMode}
                  toggleBatchMode={toggleBatchMode}
                  toggleReportView={toggleReportView}
                  filledEntries={filledEntries}
                  selectedPatient={selectedPatient}
                  selectedSlots={selectedSlots}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  setSelectedSlots={setSelectedSlots}
                  submitBatchEntries={submitBatchEntries}
                  selectTimeRange={selectTimeRange}
                  missingEntries={missingEntries}
                  isSlotDisabled={isSlotDisabled}
                  isSlotSelected={isSlotSelected}
                  submittingSlots={submittingSlots}
                  handleTimeSlotSelect={handleTimeSlotSelect}
                  formData={formData}
                  isCurrentSelectionFilled={isCurrentSelectionFilled}
                  formatDate={formatDate}
                  onMarkAndSubmit={(status) => 
                    handleMarkAndSubmitSleep(status, formData.dateTaken, formData.markedFor)
                  }
                />
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