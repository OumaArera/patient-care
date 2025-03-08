import React from "react";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

const CustomDatePicker = ({ updateType, selectedDate, setSelectedDate }) => {
  
  // Function to allow only valid dates
  const isValidDate = (date) => {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    if (updateType === "weekly") {
      return dayOfWeek === 5;
    } else if (updateType === "monthly") {
      return [1, 2, 3].includes(dayOfMonth);
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
      minTime={dayjs().set("hour", 8).set("minute", 0).toDate()}
      maxTime={updateType === "weekly" 
        ? dayjs().set("hour", 11).set("minute", 59).toDate()
        : dayjs().set("hour", 19).set("minute", 59).toDate()}
      filterDate={isValidDate}
      className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
    />
  );
};

export default CustomDatePicker;
