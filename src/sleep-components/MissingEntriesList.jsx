// sleep-components/MissingEntriesList.jsx
import React from "react";
import { AlertCircle } from "lucide-react";
import { formatDate } from "../../utils/dateTimeUtils";

const MissingEntriesList = ({ 
  entries, 
  selectedDate, 
  selectedSlot, 
  onEntrySelect 
}) => {
  if (entries.length === 0) {
    return (
      <div className="mb-6">
        <h4 className="font-medium mb-2">Missing Entries</h4>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-center">No missing entries</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2">Missing Entries ({entries.length})</h4>
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="max-h-64 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-2">
            {entries.map((entry, idx) => {
              const isSelected = 
                selectedDate === entry.date && 
                selectedSlot === entry.slot;
              
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    isSelected ? "bg-green-700" : "bg-gray-600 hover:bg-gray-500"
                  }`}
                  onClick={() => onEntrySelect(entry)}
                >
                  <div>
                    <span className="font-medium">{entry.slot}</span>
                    <span className="text-xs text-gray-400 block">
                      {formatDate(entry.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {entry.requiresReason && (
                    <AlertCircle size={16} className="text-yellow-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissingEntriesList;