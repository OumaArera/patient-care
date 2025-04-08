// sleep-components/StatusSelector.jsx
import React from "react";
import { Check } from "lucide-react";
import { FaBed } from "react-icons/fa";

const StatusSelector = ({ currentStatus, onStatusChange }) => {
  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2">Status</h4>
      <div className="flex space-x-4">
        <button
          className={`flex items-center px-4 py-2 rounded ${
            currentStatus === "A"
              ? "bg-yellow-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          onClick={() => onStatusChange("A")}
        >
          <Check className="mr-2" size={18} />
          Awake
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded ${
            currentStatus === "S"
              ? "bg-blue-800"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          onClick={() => onStatusChange("S")}
        >
          <FaBed className="mr-2" size={18} />
          Sleeping
        </button>
      </div>
    </div>
  );
};

export default StatusSelector;