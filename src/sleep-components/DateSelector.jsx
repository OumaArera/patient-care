import React from "react";

const DateSelector = ({ selectedDate, onDateSelect, getCurrentDate }) => {
  // Get today's date and 7 days before for range
  const today = getCurrentDate();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 366);  // Enable picking for a whole year instead of 7
  const minDate = sevenDaysAgo.toISOString().split('T')[0];

  return (
    <div className="mb-4">
      <label htmlFor="date-select" className="block mb-2 text-sm font-medium">
        Select Date:
      </label>
      <input
        id="date-select"
        type="date"
        value={selectedDate}
        onChange={onDateSelect}
        max={today}
        min={minDate}
        className="bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 w-full sm:w-64"
      />
    </div>
  );
};

export default DateSelector;