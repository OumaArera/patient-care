import React, { useState } from "react";
import { formatDate } from "../utils/dateTimeUtils";

const ReasonModal = ({ timeSlot, reason, onReasonChange, onConfirm, onCancel }) => {
  const [localReason, setLocalReason] = useState(reason);
  
  const handleChange = (e) => {
    setLocalReason(e.target.value);
  };
  
  const handleConfirm = () => {
    onReasonChange(localReason);
    onConfirm();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Late Entry Reason Required</h3>
        <p className="mb-4">
          You're entering data for {timeSlot?.slot} on {formatDate(timeSlot?.date)}.
          Please provide a reason for this late entry:
        </p>
        <textarea
          className="w-full p-3 bg-gray-700 text-white rounded mb-4"
          rows="3"
          placeholder="Enter reason for late entry..."
          value={localReason}
          onChange={handleChange}
        ></textarea>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;