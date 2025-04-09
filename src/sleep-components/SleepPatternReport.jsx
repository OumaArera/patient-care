import React, { useState, useEffect } from "react";
import { Calendar, FileText, Download } from "lucide-react";
import { downloadSleepPatternData, downloadSleepPatternCSV } from "../utils/downloadUtils";

const SleepPatternReport = ({ sleepData, resident }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Define all time slots
  const timeSlots = [
    "7:00AM", "8:00AM", "9:00AM", "10:00AM", "11:00AM", "12:00PM", 
    "1:00PM", "2:00PM", "3:00PM", "4:00PM", "5:00PM", "6:00PM", 
    "7:00PM", "8:00PM", "9:00PM", "10:00PM", "11:00PM", "12:00AM", 
    "1:00AM", "2:00AM", "3:00AM", "4:00AM", "5:00AM", "6:00AM"
  ];
  
  // Status descriptions
  const statusDescriptions = {
    "A": "Awake",
    "S": "Sleeping",
    "N/A": "Resident not at the Facility"
  };

  useEffect(() => {
    if (sleepData?.length > 0) {
      filterData();
    }
  }, [sleepData, selectedMonth, selectedYear]);

  const filterData = () => {
    setIsLoading(true);
    
    // Filter data for selected month and year
    const filtered = sleepData.filter(entry => {
      const entryDate = new Date(entry.dateTaken);
      return entryDate.getMonth() === parseInt(selectedMonth) && 
             entryDate.getFullYear() === parseInt(selectedYear);
    });
    
    setFilteredData(filtered);
    setIsLoading(false);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleDownloadPDF = () => {
    const residentInfo = {
      residentName: resident?.name || "Unknown Resident",
      facilityName: resident?.facilityName || "Serenity Adult Family Home",
      branchName: resident?.branchName || "",
      month: new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }),
      year: selectedYear
    };
    
    downloadSleepPatternData(sleepData, residentInfo, selectedMonth, selectedYear);
  };

  const handleDownloadCSV = () => {
    const residentInfo = {
      residentName: resident?.name || "Unknown Resident",
      month: selectedMonth,
      year: selectedYear
    };
    
    downloadSleepPatternCSV(sleepData, residentInfo, selectedMonth, selectedYear);
  };

  // Get days in selected month
  const daysInMonth = new Date(selectedYear, parseInt(selectedMonth) + 1, 0).getDate();
  
  // Create hour-by-day mapping for sleep/awake data
  const dataByHourDay = {};
  
  // Initialize data structure for each time slot
  timeSlots.forEach(timeSlot => {
    dataByHourDay[timeSlot] = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dataByHourDay[timeSlot][day] = "";
    }
  });
  
  // Populate data
  filteredData.forEach(entry => {
    const entryDate = new Date(entry.dateTaken);
    const day = entryDate.getDate();
    
    if (day >= 1 && day <= daysInMonth && timeSlots.includes(entry.markedFor)) {
      dataByHourDay[entry.markedFor][day] = entry.markAs;
    }
  });

  // Count summary statistics
  let sleepCount = 0;
  let awakeCount = 0;
  let naCount = 0;
  
  Object.values(dataByHourDay).forEach(dayEntries => {
    Object.values(dayEntries).forEach(status => {
      if (status === 'S') sleepCount++;
      else if (status === 'A') awakeCount++;
      else if (status === 'N/A') naCount++;
    });
  });
  
  const totalRecorded = sleepCount + awakeCount + naCount;
  const sleepPercentage = totalRecorded > 0 ? ((sleepCount / totalRecorded) * 100).toFixed(1) : 0;
  const awakePercentage = totalRecorded > 0 ? ((awakeCount / totalRecorded) * 100).toFixed(1) : 0;
  const naPercentage = totalRecorded > 0 ? ((naCount / totalRecorded) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText size={24} className="text-blue-400 mr-2" />
          Sleep Pattern Report
        </h2>
        
        <div className="flex space-x-4">
          <div className="flex items-center">
            <label className="mr-2 flex items-center">
              <Calendar size={16} className="mr-1" />
              Month:
            </label>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(2023, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="mr-2">Year:</label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - 2 + i}>
                  {new Date().getFullYear() - 2 + i}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
          >
            <Download size={16} className="mr-1" />
            PDF
          </button>
          
          <button
            onClick={handleDownloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center"
          >
            <Download size={16} className="mr-1" />
            CSV
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">
          {resident?.name} - {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} {selectedYear}
        </h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredData.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700 text-gray-200 text-center text-xs">
                  <th className="py-2 px-3 border border-gray-600">TIME</th>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th key={i} className="py-2 px-2 border border-gray-600 w-8">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="text-center text-xs">
                    <td className="py-2 px-3 border border-gray-600 font-medium">
                      {timeSlot}
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const status = dataByHourDay[timeSlot][day];
                      let bgColor = "";
                      
                      if (status === 'S') bgColor = "bg-blue-900";
                      else if (status === 'A') bgColor = "bg-yellow-800";
                      else if (status === 'N/A') bgColor = "bg-gray-700";
                      
                      return (
                        <td 
                          key={day} 
                          className={`py-2 px-1 border border-gray-600 ${bgColor}`}
                          title={status ? statusDescriptions[status] || status : "No data"}
                        >
                          {status}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-900 border border-gray-600 mr-2"></div>
                  <span>S - Sleeping</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-800 border border-gray-600 mr-2"></div>
                  <span>A - Awake</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-700 border border-gray-600 mr-2"></div>
                  <span>N/A - Resident not at the Facility</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-800 border border-gray-600 mr-2"></div>
                  <span>Empty - No data recorded</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-3">Monthly Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Sleep Hours:</span>
                  <span className="font-medium">{sleepCount} ({sleepPercentage}%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Awake Hours:</span>
                  <span className="font-medium">{awakeCount} ({awakePercentage}%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Not at Facility Hours:</span>
                  <span className="font-medium">{naCount} ({naPercentage}%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hours Recorded:</span>
                  <span className="font-medium">{totalRecorded}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center h-64">
          <p className="text-gray-400 text-center">
            No sleep data available for {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} {selectedYear}
          </p>
        </div>
      )}
    </div>
  );
};

export default SleepPatternReport;