import React from "react";
import { BedIcon, SunIcon, XCircleIcon } from "lucide-react";

const StatusSelector = ({ currentStatus, onStatusChange, disabled, includeNA = false, descriptions = {} }) => {
  return (
    <div className="mb-6">
      <h4 className="text-lg font-medium mb-3">Sleep Status</h4>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => onStatusChange("A")}
          disabled={disabled}
          className={`flex items-center px-4 py-2 rounded-md ${
            currentStatus === "A"
              ? "bg-yellow-600 text-white"
              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <SunIcon size={18} className="mr-2" />
          <span>A - {descriptions["A"] || "Awake"}</span>
        </button>

        <button
          onClick={() => onStatusChange("S")}
          disabled={disabled}
          className={`flex items-center px-4 py-2 rounded-md ${
            currentStatus === "S"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <BedIcon size={18} className="mr-2" />
          <span>S - {descriptions["S"] || "Sleeping"}</span>
        </button>

        {includeNA && (
          <button
            onClick={() => onStatusChange("N/A")}
            disabled={disabled}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentStatus === "N/A"
                ? "bg-gray-500 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <XCircleIcon size={18} className="mr-2" />
            <span>N/A - {descriptions["N/A"] || "Not at Facility"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusSelector;