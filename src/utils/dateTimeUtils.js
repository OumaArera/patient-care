// utils/dateTimeUtils.js

// Get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };
  
  // Determine current time slot based on time
  export const getCurrentTimeSlot = () => {
    const now = new Date();
    const hours = now.getHours();
    
    // Format to match time slots
    let hour = hours % 12;
    if (hour === 0) hour = 12;
    const ampm = hours < 12 ? "AM" : "PM";
    
    // Round down to the nearest hour
    return `${hour}:00${ampm}`;
  };
  
  // Generate dates for today, yesterday and day before yesterday
  export const getDatesForLastThreeDays = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    
    return [
      today.toISOString().split('T')[0],
      yesterday.toISOString().split('T')[0],
      dayBeforeYesterday.toISOString().split('T')[0]
    ];
  };
  
  // Format date to more readable format
  export const formatDate = (dateString, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) => {
    if (!dateString) return "Not selected";
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Check if a given time is in the past
  export const isTimeInPast = (date, timeSlot) => {
    const now = new Date();
    const entryDate = new Date(date);
    
    // If date is in the past, time is definitely in the past
    if (entryDate.getDate() < now.getDate() || 
        entryDate.getMonth() < now.getMonth() || 
        entryDate.getFullYear() < now.getFullYear()) {
      return true;
    }
    
    // If it's today, check the time
    if (entryDate.getDate() === now.getDate() && 
        entryDate.getMonth() === now.getMonth() && 
        entryDate.getFullYear() === now.getFullYear()) {
      
      const slotHour = parseInt(timeSlot.match(/\d+/)[0]);
      const slotAmPm = timeSlot.includes("AM") ? "AM" : "PM";
      let hour24Format = slotHour;
      
      if (slotAmPm === "PM" && slotHour !== 12) {
        hour24Format += 12;
      } else if (slotAmPm === "AM" && slotHour === 12) {
        hour24Format = 0;
      }
      
      return now.getHours() > hour24Format || 
             (now.getHours() === hour24Format && now.getMinutes() > 0);
    }
    
    return false;
  };