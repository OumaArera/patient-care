// SleepPatternComponents/SelectionControls.jsx
import React from "react";

const SelectionControls = ({
  loading,
  loadingResidents,
  branches,
  selectedBranch,
  handleBranchChange,
  filteredResidents,
  selectedResident,
  handleResidentChange,
  months,
  selectedMonth,
  handleMonthChange,
  years,
  selectedYear,
  handleYearChange,
  viewMode,
  handleViewModeChange
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branch Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 appearance-none pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedBranch}
              onChange={handleBranchChange}
              disabled={loading || branches.length === 0}
            >
              <option value="" className="text-gray-800">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id} className="text-gray-800">
                  {branch.name}
                </option>
              ))}
            </select>
            {loadingResidents && (
              <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none">
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {loadingResidents && (
              <p className="text-xs text-blue-600 mt-1">Loading residents...</p>
            )}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Resident Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Resident</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 appearance-none pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedResident}
              onChange={handleResidentChange}
              disabled={!selectedBranch || filteredResidents.length === 0 || loadingResidents}
            >
              <option value="" className="text-gray-800">Select a resident</option>
              {filteredResidents.map((resident) => (
                <option key={resident.patientId} value={resident.patientId} className="text-gray-800">
                  {resident.firstName} {resident.lastName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Time Period Selection */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <div className="relative">
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 appearance-none pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedMonth}
                onChange={handleMonthChange}
                disabled={!selectedResident}
              >
                {months.map((month, index) => (
                  <option key={month} value={index} className="text-gray-800">
                    {month}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <div className="relative">
              <select
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 appearance-none pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedYear}
                onChange={handleYearChange}
                disabled={!selectedResident}
              >
                {years.map((year) => (
                  <option key={year} value={year} className="text-gray-800">
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* View Mode Controls */}
      {selectedResident && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Visualization Type</label>
          <div className="flex flex-wrap gap-3">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "bar" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleViewModeChange("bar")}
            >
              Bar Chart
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "line" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleViewModeChange("line")}
            >
              Line Chart
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "heatmap" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleViewModeChange("heatmap")}
            >
              Hourly Heatmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionControls;