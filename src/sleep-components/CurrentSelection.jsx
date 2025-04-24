import React from "react";

const CurrentSelection = ({
  formData,
  isCurrentSelectionFilled,
  sleepStatusDescriptions,
  formatDate,
  onMarkAndSubmit
}) => {
  const isFilled = isCurrentSelectionFilled();
  
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h4 className="text-lg font-medium mb-2">Current Selection</h4>
      
      {formData.markedFor ? (
        <>
          <div className="mb-4 p-3 bg-gray-800 rounded-md border border-gray-600">
            <div className="flex flex-col mb-2">
              <span className="text-gray-400 text-sm">Time Slot:</span>
              <span className="font-semibold">{formData.markedFor}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Date:</span>
              <span className="font-semibold">{formatDate(formData.dateTaken)}</span>
            </div>
          </div>
          
          {isFilled ? (
            <div className="text-yellow-400 p-2 bg-yellow-900/30 rounded mb-2">
              Entry already exists for this time slot
            </div>
          ) : (
            <div className="mb-3">
              <h5 className="text-sm font-medium mb-2">Mark resident as:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {Object.entries(sleepStatusDescriptions).map(([status, description]) => (
                  <button
                    key={status}
                    onClick={() => onMarkAndSubmit(status)}
                    className="flex justify-center py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    {description}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-400 text-center p-4">
          Select a time slot to record sleep status
        </div>
      )}
    </div>
  );
};

export default CurrentSelection;