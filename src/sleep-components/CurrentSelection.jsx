import React from "react";

const CurrentSelection = ({ formData, isCurrentSelectionFilled, sleepStatusDescriptions, formatDate }) => {
  return (
    <div>
      <h4 className="text-lg font-medium mb-3">Current Selection</h4>
      <div className="bg-gray-700 p-4 rounded">
        <p className="mb-2">
          <span className="text-gray-400">Time: </span>
          <span className="font-medium">{formData.markedFor || "Not selected"}</span>
        </p>
        <p className="mb-2">
          <span className="text-gray-400">Date: </span>
          <span className="font-medium">{formData.dateTaken ? formatDate(formData.dateTaken) : "Not selected"}</span>
        </p>
        <p className="mb-2">
          <span className="text-gray-400">Status: </span>
          <span className="font-medium">
            {formData.markAs ? `${formData.markAs} - ${sleepStatusDescriptions[formData.markAs] || ""}` : "Not selected"}
          </span>
        </p>
        
        {/* Show warning if entry already exists */}
        {isCurrentSelectionFilled() && (
          <div className="mt-2 p-2 bg-yellow-800 rounded text-sm">
            An entry for this time slot already exists and cannot be modified.
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentSelection;