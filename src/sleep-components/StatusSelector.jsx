import React from "react";

const StatusSelector = ({ 
  currentStatus, 
  onStatusChange, 
  disabled, 
  includeNA = false,
  descriptions = {},
  autoSubmit = false
}) => {
  return (
    <div className="mb-6">
      <h4 className="text-md font-medium mb-3">Select Sleep Status</h4>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onStatusChange("A")}
          disabled={disabled || currentStatus === "A"}
          className={`px-4 py-2 rounded-full ${
            currentStatus === "A"
              ? "bg-yellow-600 text-white"
              : disabled
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-700 hover:bg-yellow-700 text-white"
          }`}
        >
          Awake (A)
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("S")}
          disabled={disabled || currentStatus === "S"}
          className={`px-4 py-2 rounded-full ${
            currentStatus === "S"
              ? "bg-blue-600 text-white"
              : disabled
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-700 hover:bg-blue-700 text-white"
          }`}
        >
          Sleeping (S)
        </button>
        {includeNA && (
          <button
            type="button"
            onClick={() => onStatusChange("N/A")}
            disabled={disabled || currentStatus === "N/A"}
            className={`px-4 py-2 rounded-full ${
              currentStatus === "N/A"
                ? "bg-purple-600 text-white"
                : disabled
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-purple-700 text-white"
            }`}
          >
            Not at Facility (N/A)
          </button>
        )}
      </div>
      {disabled && (
        <p className="text-sm text-gray-400 mt-2">
          This time slot has already been recorded
        </p>
      )}
      {autoSubmit && !disabled && (
        <p className="text-sm text-blue-400 mt-2">
          Click a status button to automatically record it
        </p>
      )}
    </div>
  );
};

export default StatusSelector;