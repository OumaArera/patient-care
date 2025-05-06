import React, { useState } from "react";
import { updateData } from "../../services/updatedata";

const SleepEntryEditor = ({ sleepData, onUpdate }) => {
  const [updatingEntries, setUpdatingEntries] = useState({});
  
  const toggleSleepStatus = async (entry) => {
    if (updatingEntries[entry.sleepId]) return;
    
    try {
      // Set loading state for this specific entry
      setUpdatingEntries(prev => ({ ...prev, [entry.sleepId]: true }));
      
      // Create new status (toggle between "A" and "S")
      const newStatus = entry.markAs === "A" ? "S" : "A";
      
      const payload = {
        markAs: newStatus
      };
      
      const endpoint = `https://patient-care-server.onrender.com/api/v1/sleeps/${entry.sleepId}`;
      const response = await updateData(endpoint, payload);
      
      if (response && response.success) {
        const updatedEntry = {
          ...entry,
          markAs: newStatus
        };
        
        onUpdate(updatedEntry);
      } else {
        console.error("Failed to update sleep status:", response);
        alert("Failed to update sleep status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating sleep status:", error);
      alert("An error occurred while updating sleep status.");
    } finally {
      // Clear loading state
      setUpdatingEntries(prev => ({ ...prev, [entry.sleepId]: false }));
    }
  };

  // Group sleep entries by date for better organization
  const entriesByDate = {};
  sleepData.forEach(entry => {
    const date = entry.dateTaken;
    if (!entriesByDate[date]) {
      entriesByDate[date] = [];
    }
    entriesByDate[date].push(entry);
  });

  const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Sleep Entries</h2>
      
      {sortedDates.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No sleep data available</div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="border-b pb-3">
              <h3 className="font-medium text-gray-700 mb-2">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {entriesByDate[date]
                  .sort((a, b) => a.markedFor.localeCompare(b.markedFor))
                  .map(entry => (
                    <div 
                      key={entry.sleepId} 
                      className="flex items-center bg-gray-50 rounded p-2 border"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{entry.markedFor}</span>
                      </div>
                      
                      <button
                        onClick={() => toggleSleepStatus(entry)}
                        disabled={updatingEntries[entry.sleepId]}
                        className={`ml-2 px-3 py-1 rounded-full text-white text-sm font-medium transition-colors ${
                          entry.markAs === "A" 
                            ? "bg-yellow-500 hover:bg-yellow-600" 
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {updatingEntries[entry.sleepId] ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            ...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            {entry.markAs === "A" ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Awake
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                                Sleep
                              </>
                            )}
                          </span>
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SleepEntryEditor;