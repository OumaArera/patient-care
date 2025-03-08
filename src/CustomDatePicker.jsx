import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

const CustomDatePicker = ({ updateType, selectedDate, setSelectedDate }) => {
  
  // Function to determine if a date is valid based on updateType
  const isValidDate = (date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
    const dayOfMonth = date.getDate(); // 1, 2, 3, ..., 31
    const hour = date.getHours();

    if (updateType === "weekly") {
      // Only allow Fridays (5) and time between 8 AM - 12 Noon
      return dayOfWeek === 5 && hour >= 8 && hour < 12;
    } else if (updateType === "monthly") {
      // Only allow the 1st, 2nd, or 3rd of the month and time between 8 AM - 8 PM
      return [1, 2, 3].includes(dayOfMonth) && hour >= 8 && hour < 20;
    }

    return false;
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="yyyy-MM-dd HH:mm:ss"
      minTime={updateType === "weekly" ? dayjs().set("hour", 8).set("minute", 0).toDate() : dayjs().set("hour", 8).set("minute", 0).toDate()}
      maxTime={updateType === "weekly" ? dayjs().set("hour", 11).set("minute", 59).toDate() : dayjs().set("hour", 19).set("minute", 59).toDate()}
      filterDate={isValidDate} // Restricts date selection
      className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
    />
  );
};

export default CustomDatePicker;
