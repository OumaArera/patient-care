import React, { useState, useEffect } from 'react';

const SleepPatternPreview = ({ sleepData, selectedMonth, selectedYear, selectedResidentName }) => {
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [groupByOption, setGroupByOption] = useState('day'); // 'day' or 'week'

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (sleepData && sleepData.length > 0 && showPreview) {
      processPreviewData();
    }
  }, [sleepData, selectedMonth, selectedYear, showPreview, groupByOption]);

  const processPreviewData = () => {
    // Filter data for selected month and year
    const filteredData = sleepData.filter(entry => {
      const entryDate = new Date(entry.dateTaken);
      return entryDate.getMonth() === parseInt(selectedMonth) && 
             entryDate.getFullYear() === parseInt(selectedYear);
    });

    if (groupByOption === 'day') {
      processDailyData(filteredData);
    } else {
      processWeeklyData(filteredData);
    }
  };

  const processDailyData = (filteredData) => {
    // Group data by date
    const groupedByDate = {};
    
    filteredData.forEach(entry => {
      const date = entry.dateTaken;
      const day = new Date(date).getDate();
      
      if (!groupedByDate[day]) {
        groupedByDate[day] = {
          day,
          date,
          sleepEntries: [],
          awakeEntries: []
        };
      }
      
      if (entry.markAs === 'S') {
        groupedByDate[day].sleepEntries.push({
          time: entry.markedFor,
          id: entry.sleepId
        });
      } else if (entry.markAs === 'A') {
        groupedByDate[day].awakeEntries.push({
          time: entry.markedFor,
          id: entry.sleepId
        });
      }
    });

    const processed = Object.values(groupedByDate).sort((a, b) => a.day - b.day);
    setPreviewData(processed);
  };

  const processWeeklyData = (filteredData) => {
    // Group data by week
    const groupedByWeek = {};
    
    filteredData.forEach(entry => {
      const date = new Date(entry.dateTaken);
      const weekNumber = getWeekNumber(date);
      const weekKey = `week-${weekNumber}`;
      
      if (!groupedByWeek[weekKey]) {
        const weekStart = getFirstDayOfWeek(date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        groupedByWeek[weekKey] = {
          weekNumber,
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          sleepCount: 0,
          awakeCount: 0,
          days: {}
        };
      }
      
      const day = date.getDate();
      if (!groupedByWeek[weekKey].days[day]) {
        groupedByWeek[weekKey].days[day] = {
          date: entry.dateTaken,
          sleepCount: 0,
          awakeCount: 0
        };
      }
      
      if (entry.markAs === 'S') {
        groupedByWeek[weekKey].sleepCount++;
        groupedByWeek[weekKey].days[day].sleepCount++;
      } else if (entry.markAs === 'A') {
        groupedByWeek[weekKey].awakeCount++;
        groupedByWeek[weekKey].days[day].awakeCount++;
      }
    });

    const processed = Object.values(groupedByWeek).sort((a, b) => a.weekNumber - b.weekNumber);
    setPreviewData(processed);
  };

  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const pastDaysOfMonth = date.getDate() - 1;
    return Math.floor((firstDayOfMonth.getDay() + pastDaysOfMonth) / 7) + 1;
  };

  const getFirstDayOfWeek = (date) => {
    const dayOfWeek = date.getDay();
    const difference = date.getDate() - dayOfWeek;
    const firstDay = new Date(date);
    firstDay.setDate(difference);
    return firstDay;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Handle formats like "11:00PM"
    const match = timeString.match(/(\d+):(\d+)([AP]M)/);
    if (match) {
      const [, hours, minutes, period] = match;
      return `${hours}:${minutes} ${period}`;
    }
    
    return timeString;
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleGroupByChange = (e) => {
    setGroupByOption(e.target.value);
  };

  if (!sleepData || sleepData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Sleep Pattern Preview</h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <label htmlFor="groupBy" className="mr-2 text-gray-700">Group by:</label>
            <select
              id="groupBy"
              value={groupByOption}
              onChange={handleGroupByChange}
              className="border rounded px-2 py-1 text-gray-700"
              disabled={!showPreview}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
            </select>
          </div>
          <button
            onClick={togglePreview}
            className={`${showPreview ? 'bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-medium py-1 px-4 rounded flex items-center`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="mt-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700">
              {selectedResidentName} - {months[selectedMonth]} {selectedYear}
            </h3>
          </div>

          {groupByOption === 'day' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Day</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Sleep Times</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Awake Times</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.length > 0 ? (
                    previewData.map((dayData) => (
                      <tr key={`day-${dayData.day}`} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 font-medium">{dayData.day}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {dayData.sleepEntries.length > 0 ? (
                              dayData.sleepEntries.map((entry) => (
                                <span key={entry.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {formatTime(entry.time)}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 italic">No sleep entries</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {dayData.awakeEntries.length > 0 ? (
                              dayData.awakeEntries.map((entry) => (
                                <span key={entry.id} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                  {formatTime(entry.time)}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 italic">No awake entries</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-center text-gray-500">
                        No data available for this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {previewData.length > 0 ? (
                previewData.map((weekData) => (
                  <div key={`week-${weekData.weekNumber}`} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Week {weekData.weekNumber} ({weekData.weekStart} to {weekData.weekEnd})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Sleep Entries</span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{weekData.sleepCount} total</span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Awake Entries</span>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{weekData.awakeCount} total</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-left text-gray-700 font-medium">Day</th>
                            <th className="px-3 py-2 text-center text-gray-700 font-medium">Sleep</th>
                            <th className="px-3 py-2 text-center text-gray-700 font-medium">Awake</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(weekData.days).map(([day, dayData]) => (
                            <tr key={`week-${weekData.weekNumber}-day-${day}`} className="border-t border-gray-200">
                              <td className="px-3 py-2">{new Date(dayData.date).toLocaleDateString()}</td>
                              <td className="px-3 py-2 text-center">{dayData.sleepCount}</td>
                              <td className="px-3 py-2 text-center">{dayData.awakeCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 p-4">
                  No data available for this month
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SleepPatternPreview;