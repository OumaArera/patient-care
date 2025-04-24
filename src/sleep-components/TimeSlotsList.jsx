import React from "react";
import { Loader, Check } from "lucide-react";

const TimeSlotsList = ({
  filteredMissingEntries,
  isSlotDisabled,
  isSlotSelected,
  submittingSlots,
  handleTimeSlotSelect,
  batchMode
}) => {
  return (
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
  );
};

export default TimeSlotsList;