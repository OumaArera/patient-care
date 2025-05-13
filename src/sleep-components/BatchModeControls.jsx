import React, { useState } from "react";
import { Check, X } from "lucide-react";

const BatchModeControls = ({
  selectedSlots,
  selectedStatus,
  sleepStatusDescriptions,
  setSelectedStatus,
  setSelectedSlots,
  submitBatchEntries,
  selectTimeRange,
  timeSlots
}) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleCustomRangeSelection = () => {
    if (!startTime || !endTime) {
      return;
    }
    selectTimeRange(startTime, endTime);
  };

  return (
    <div className="mb-4 bg-gray-700 p-4 rounded-lg">
      <h4 className="text-lg font-medium mb-2">Batch Selection Mode</h4>
      
      {/* Preset Quick Selects */}
      {/* <div className="flex flex-wrap gap-2 mb-3">
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
      </div> */}
      
      {/* Custom Range Selection */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="text-sm font-medium">Custom range:</div>
        <select 
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
        >
          <option value="">Start time</option>
          {timeSlots.map(slot => (
            <option key={`start-${slot.value}`} value={slot.value}>{slot.value}</option>
          ))}
        </select>
        <span>to</span>
        <select 
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
        >
          <option value="">End time</option>
          {timeSlots.map(slot => (
            <option key={`end-${slot.value}`} value={slot.value}>{slot.value}</option>
          ))}
        </select>
        <button
          onClick={handleCustomRangeSelection}
          disabled={!startTime || !endTime}
          className={`px-2 py-1 text-xs rounded ${
            startTime && endTime 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Apply
        </button>
      </div>
      
      {/* Status Selection */}
      <div className="flex items-center gap-3 mb-3">
        <div className="font-medium">Mark selected as:</div>
        <div className="flex gap-2">
          {Object.entries(sleepStatusDescriptions).map(([status, description]) => (
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
      
      {/* Action Buttons */}
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
  );
};

export default BatchModeControls;