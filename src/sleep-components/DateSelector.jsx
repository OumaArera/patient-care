import React from "react";
import { Calendar } from "lucide-react";

const DateSelector = ({ selectedDate, onDateSelect, getCurrentDate }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2 items-center">
        <Calendar size={18} className="mr-2" />
        Select Date
      </label>
      <input
        type="date"
        value={selectedDate}
        onChange={onDateSelect}
        min="2025-04-01"
        max={getCurrentDate()}
        className="bg-gray-700 text-white p-2 rounded border border-gray-600 w-full"
      />
    </div>
  );
};

export default DateSelector;