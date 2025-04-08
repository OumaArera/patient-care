// sleep-components/CurrentSelection.jsx
import React from "react";
import { FaRegClock } from "react-icons/fa";
import { formatDate } from "../utils/dateTimeUtils";

const CurrentSelection = ({ formData }) => {
  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2 flex items-center">
        <FaRegClock className="mr-2" size={16} />
        Current Selection
      </h4>
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400">Date</label>
            <div className="font-medium">
              {formData.dateTaken ? formatDate(formData.dateTaken) : "Not selected"}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400">Time</label>
            <div className="font-medium">
              {formData.markedFor || "Not selected"}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400">Status</label>
            <div className="font-medium">
              {formData.markAs === "A" ? "Awake" : 
               formData.markAs === "S" ? "Sleeping" : 
               "Not selected"}
            </div>
          </div>
          {formData.reasonFilledLate && (
            <div>
              <label className="block text-xs text-gray-400">Late Entry Reason</label>
              <div className="font-medium text-sm">
                {formData.reasonFilledLate}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentSelection;

