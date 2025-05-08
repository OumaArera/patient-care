import React, { useState, useEffect } from "react";
import { updateData } from "../../services/updatedata";
import { errorHandler } from "../../services/errorHandler";

const SleepEntryEditor = ({ sleepData, onUpdate }) => {
  const [updatingEntries, setUpdatingEntries] = useState({});
  const [errors, setErrors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(2);
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  
  // Reset pagination when sleep data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sleepData]);

  // Show error overlay when errors exist
  useEffect(() => {
    if (errors.length > 0) {
      setShowErrorOverlay(true);
      const timer = setTimeout(() => {
        setShowErrorOverlay(false);
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

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

      if (response?.error) {
        setErrors(errorHandler(response.error));
      } else {
        const updatedEntry = {
            ...entry,
            markAs: newStatus
        };
        onUpdate(updatedEntry);
      }
    } catch (error) {
      console.error("Error updating sleep status:", error);
      setErrors(["An error occurred while updating sleep status."]);
    } finally {
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

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b) - new Date(a));

  // Pagination logic
  const totalPages = Math.ceil(sortedDates.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentDates = sortedDates.slice(indexOfFirstEntry, indexOfLastEntry);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 relative">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Sleep Entries</h2>
      
      {/* Error Overlay */}
      {showErrorOverlay && errors.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-red-600">Error</h3>
              <button 
                onClick={() => setShowErrorOverlay(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {sortedDates.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No sleep data available</div>
      ) : (
        <>
          <div className="space-y-4 min-h-[400px]">
            {currentDates.map(date => (
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
                    .sort((a, b) => {
                      const getTimeValue = (timeStr) => {
                        const [hourMin, ampm] = timeStr.split(/(?:AM|PM)/i);
                        let [hour, min] = hourMin.split(':').map(Number);
                        
                        if (timeStr.toLowerCase().includes('pm') && hour < 12) {
                          hour += 12;
                        }
                        if (timeStr.toLowerCase().includes('am') && hour === 12) {
                          hour = 0;
                        }
                        
                        return hour * 60 + (min || 0);
                      };
                      
                      return getTimeValue(a.markedFor) - getTimeValue(b.markedFor);
                    })
                    .map(entry => (
                      <div 
                        key={entry.sleepId} 
                        className="flex items-center  bg-gray-50 rounded p-2 border hover:border-gray-400 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-950">{entry.markedFor}</span>
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {indexOfFirstEntry + 1}-{Math.min(indexOfLastEntry, sortedDates.length)} of {sortedDates.length} dates
          </div>
        </>
      )}
    </div>
  );
};

export default SleepEntryEditor;