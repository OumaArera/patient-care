// dateTimeUtils.js

// Get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
  const now = new Date();
  return formatDateToYYYYMMDD(now);
};

// Format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  return date.toISOString().split('T')[0];
};

// Get current time slot based on current hour
export const getCurrentTimeSlot = () => {
  const now = new Date();
  const hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12; 
  return `${hour12}:00${ampm}`;
};

// Format date for display (MM/DD/YYYY)
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Check if a time is in the past relative to current time
export const isTimeInPast = (dateString, timeSlot) => {
  const now = new Date();
  const date = new Date(dateString);
  
  // If the date is in the past, return true
  if (date.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)) {
    return true;
  }
  
  // If the date is today, check if the time slot is in the past
  if (date.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
    const timeSlotHour = parseTimeSlot(timeSlot);
    const currentHour = new Date().getHours();
    return timeSlotHour <= currentHour;
  }
  
  return false;
};

// Parse time slot to get hour in 24-hour format
const parseTimeSlot = (timeSlot) => {
  const match = timeSlot.match(/(\d+):00(AM|PM)/);
  if (!match) return 0;
  
  let hour = parseInt(match[1]);
  const ampm = match[2];
  
  if (ampm === 'PM' && hour < 12) {
    hour += 12;
  } else if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return hour;
};

// Get dates from April 1st to today
export const getDatesFromAprilFirst = () => {
  const dates = [];
  const today = new Date();
  const aprilFirst = new Date('2025-04-01');
  
  // Start from April 1st
  const currentDate = new Date(aprilFirst);
  
  // Add each date until today
  while (currentDate <= today) {
    dates.push(formatDateToYYYYMMDD(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};