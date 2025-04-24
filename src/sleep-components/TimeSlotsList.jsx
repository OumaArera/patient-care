import React from "react";
import StatusSelector from "./StatusSelector";

const TimeSlotsList = ({ 
  entries, 
  onTimeSlotSelect, 
  isSlotDisabled, 
  currentSelection, 
  submittingSlots,
  sleepStatusDescriptions,
  onMarkAndSubmit
}) => {
  // Check if a slot is currently being submitted
  const isSubmitting = (entry) => {
    const key = `${entry.date}-${entry.slot}`;
    return submittingSlots[key] === true;
  };

  // Check if a slot is selected
  const isSelected = (entry) => {
    return currentSelection.dateTaken === entry.date && currentSelection.markedFor === entry.slot;
  };

  return (
    <div>
      <h4 className="text-lg font-medium mb-3">Available Time Slots</h4>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div 
              key={`${entry.date}-${entry.slot}`}
              className="mb-4"
            >
              <button
                onClick={() => onTimeSlotSelect(entry)}
                disabled={isSlotDisabled(entry) || isSubmitting(entry)}
                className={`p-2 rounded text-left w-full flex items-center justify-between mb-2 ${
                  isSelected(entry)
                    ? "bg-blue-700 text-white"
                    : isSlotDisabled(entry)
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : isSubmitting(entry)
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <span>{entry.slot}</span>
                {entry.isCurrentTimeSlot && (
                  <span className="text-xs bg-green-600 px-2 py-1 rounded">Current</span>
                )}
                {isSlotDisabled(entry) && !entry.isCurrentTimeSlot && (
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">Filled</span>
                )}
                {isSubmitting(entry) && (
                  <span className="text-xs bg-yellow-600 px-2 py-1 rounded">Submitting...</span>
                )}
              </button>
              
              {/* Show status selector if this time slot is selected */}
              {isSelected(entry) && !isSlotDisabled(entry) && (
                <div className="ml-4 border-l-2 border-blue-500 pl-3">
                  <StatusSelector
                    currentStatus={currentSelection.markAs}
                    onStatusChange={onMarkAndSubmit}
                    disabled={isSubmitting(entry)}
                    includeNA={true}
                    descriptions={sleepStatusDescriptions}
                    autoSubmit={true}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400">No available time slots for the selected date</p>
        )}
      </div>
    </div>
  );
};

export default TimeSlotsList;