/**
 * Downloads sleep pattern data for a specific patient
 * @param {Array} data - The sleep data entries
 * @param {Object} patient - The patient object
 */
export const downloadSleepPatternData = (data, patient) => {
  if (!data || !patient) {
    console.error("Missing data or patient information");
    return;
  }
  
  console.log("Downloading sleep pattern data for", patient?.fullName);
  // Implementation of PDF generation would go here
  // This is a placeholder function
};

/**
 * Groups sleep entries by date for reporting
 * @param {Array} entries - Sleep data entries
 * @returns {Object} - Entries grouped by date
 */
export const groupEntriesByDate = (entries) => {
  const grouped = {};
  
  if (!entries || !Array.isArray(entries)) {
    return grouped;
  }
  
  entries.forEach(entry => {
    if (!grouped[entry.dateTaken]) {
      grouped[entry.dateTaken] = [];
    }
    grouped[entry.dateTaken].push(entry);
  });
  
  return grouped;
};

/**
 * Calculates sleep statistics for reporting
 * @param {Array} entries - Sleep data entries
 * @returns {Object} - Statistics including total hours, average, etc.
 */
export const calculateSleepStatistics = (entries) => {
  if (!entries || !Array.isArray(entries)) {
    return { 
      totalSleepHours: 0,
      averageSleepHours: 0,
      sleepingCount: 0,
      awakeCount: 0,
      notInFacilityCount: 0
    };
  }
  
  const sleepingEntries = entries.filter(entry => entry.markAs === "S");
  const awakeEntries = entries.filter(entry => entry.markAs === "A");
  const notInFacilityEntries = entries.filter(entry => entry.markAs === "N/A");
  
  // Assuming each sleep entry represents a 2-hour block
  const totalSleepHours = sleepingEntries.length * 2;
  
  // Group by date to calculate average sleep per day
  const entriesByDate = groupEntriesByDate(entries);
  const daysWithEntries = Object.keys(entriesByDate).length;
  
  const averageSleepHours = daysWithEntries > 0 
    ? (totalSleepHours / daysWithEntries).toFixed(1) 
    : 0;
  
  return {
    totalSleepHours,
    averageSleepHours,
    sleepingCount: sleepingEntries.length,
    awakeCount: awakeEntries.length,
    notInFacilityCount: notInFacilityEntries.length
  };
};