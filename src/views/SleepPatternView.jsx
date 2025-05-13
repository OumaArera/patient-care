import React, { useState } from "react";
import { downloadSleepPatternData } from "../utils/downloadUtils";
import { TIME_SLOTS } from "../utils/constants";
import DateSelector from "../sleep-components/DateSelector";
import ActionButtons from "../sleep-components/ActionButtons";
import SleepPatternReport from "../sleep-components/SleepPatternReport";
import Notifications from "../sleep-components/Notifications";
import BatchModeControls from "../sleep-components/BatchModeControls";
import TimeSlotsList from "../sleep-components/TimeSlotsList";
import CurrentSelection from "../sleep-components/CurrentSelection";
import { SLEEP_STATUS_DESCRIPTIONS } from "../utils/constants";
import SleepEntryEditor from '../sleep-components/SleepEntryEditor';

// The Sleep Pattern Report View
export const SleepPatternView = ({ toggleReportView, filledEntries, selectedPatient }) => {
  const [updatedEntries, setUpdatedEntries] = useState([...filledEntries]);
  const [showEditor, setShowEditor] = useState(false);
  
  // Handle updates from the editor
  const handleSleepEntryUpdate = (updatedEntry) => {
    setUpdatedEntries(entries => 
      entries.map(entry => 
        entry.sleepId === updatedEntry.sleepId ? updatedEntry : entry
      )
    );
  };

  return (
    <div className="relative">
      <ActionButtons 
        onBack={toggleReportView} 
        showBackOnly={true} 
      />
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            Sleep Pattern for {selectedPatient?.firstName} {selectedPatient?.lastName}
          </h3>
          
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`px-4 py-2 rounded-md ${
              showEditor ? "bg-blue-600" : "bg-yellow-600"
            } hover:opacity-90 text-white transition-colors`}
          >
            {showEditor ? "Hide Editor" : "Edit Sleep Entries"}
          </button>
        </div>
        
        <div className={`bg-gray-800 p-4 rounded-lg shadow-md ${showEditor ? "opacity-30" : ""}`}>
          <SleepPatternReport 
            sleepData={updatedEntries} 
            resident={selectedPatient} 
          />
        </div>
        
        {showEditor && (
          <div className="absolute top-24 left-0 right-0 z-10 bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700">
            <div className="mb-4 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-white">Edit Sleep Entries</h4>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-white rounded-lg p-4">
              <SleepEntryEditor 
                sleepData={updatedEntries}
                onUpdate={handleSleepEntryUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// The Sleep Entry Form
export const SleepEntryForm = ({
  selectedDate,
  onDateSelect,
  errors,
  message,
  batchMode,
  toggleBatchMode,
  toggleReportView,
  filledEntries,
  selectedPatient,
  selectedSlots,
  selectedStatus,
  setSelectedStatus,
  setSelectedSlots,
  submitBatchEntries,
  selectTimeRange,
  missingEntries,
  isSlotDisabled,
  isSlotSelected,
  submittingSlots,
  handleTimeSlotSelect,
  formData,
  isCurrentSelectionFilled,
  formatDate,
  onMarkAndSubmit
}) => {
  return (
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
        onDateSelect={onDateSelect}
        getCurrentDate={() => selectedDate}
      />
      
      <Notifications errors={errors} message={message} />
      
      {batchMode && (
        <BatchModeControls
          selectedSlots={selectedSlots}
          selectedStatus={selectedStatus}
          sleepStatusDescriptions={SLEEP_STATUS_DESCRIPTIONS}
          setSelectedStatus={setSelectedStatus}
          setSelectedSlots={setSelectedSlots}
          submitBatchEntries={submitBatchEntries}
          selectTimeRange={selectTimeRange}
          timeSlots={TIME_SLOTS}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium mb-2">Available Time Slots</h4>
          <TimeSlotsList
            filteredMissingEntries={missingEntries}
            isSlotDisabled={isSlotDisabled}
            isSlotSelected={isSlotSelected}
            submittingSlots={submittingSlots}
            handleTimeSlotSelect={handleTimeSlotSelect}
            batchMode={batchMode}
          />
        </div>
        
        {!batchMode && (
          <CurrentSelection 
            formData={formData}
            isCurrentSelectionFilled={isCurrentSelectionFilled}
            sleepStatusDescriptions={SLEEP_STATUS_DESCRIPTIONS}
            formatDate={formatDate}
            onMarkAndSubmit={onMarkAndSubmit}
          />
        )}
      </div>
    </div>
  );
};