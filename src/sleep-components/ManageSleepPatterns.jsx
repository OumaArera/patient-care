// SleepPatternComponents/index.jsx
import React, { useEffect, useState } from "react";
import { getData } from "../../services/updatedata";
import { fetchPatients } from "../../services/fetchPatients";
import SelectionControls from "./SelectionControls";
import SleepPatternChart from "./SleepPatternChart";
import MonthlySummary from "./MonthlySummary";
import PatternAnalysis from "./PatternAnalysis";

const SLEEP_PATTERNS_URLS = "https://patient-care-server.onrender.com/api/v1/sleeps";

const ManageSleepPatterns = () => {
  const [residents, setResidents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sleepData, setSleepData] = useState([]);
  const [loadingSleepData, setLoadingSleepData] = useState(false);
  const [selectedResident, setSelectedResident] = useState("");
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);
  const [viewMode, setViewMode] = useState("bar"); // 'bar', 'line', or 'heatmap'

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    getResidents();
  }, []);

  useEffect(() => {
    if (residents.length > 0) {
      const uniqueBranches = [...new Set(residents.map(resident => resident.branchId))]
        .map(branchId => {
          const branch = residents.find(resident => resident.branchId === branchId);
          return {
            id: branchId,
            name: branch?.branchName || `Branch ${branchId}`
          };
        });
      setBranches(uniqueBranches);
    }
  }, [residents]);

  useEffect(() => {
    if (selectedBranch) {
      const filtered = residents.filter(resident => resident.branchId === parseInt(selectedBranch));
      setFilteredResidents(filtered);
      setSelectedResident(""); 
      setSleepData([]);
    } else {
      setFilteredResidents([]);
    }
  }, [selectedBranch, residents]);

  useEffect(() => {
    if (selectedResident) {
      getSleepData(selectedResident);
    }
  }, [selectedResident, selectedMonth, selectedYear]);

  useEffect(() => {
    if (sleepData.length > 0) {
      processChartData();
    }
  }, [sleepData, selectedMonth, selectedYear]);

  const getResidents = () => {
    setLoading(true);
    fetchPatients()
      .then((data) => setResidents(data?.responseObject || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getSleepData = (residentId) => {
    if (!residentId) return;
    setLoadingSleepData(true);
    const updatedURL = `${SLEEP_PATTERNS_URLS}?resident=${residentId}`;
    getData(updatedURL)
      .then((data) => setSleepData(data.responseObject || []))
      .catch(() => {})
      .finally(() => setLoadingSleepData(false));
  };

  const processChartData = () => {
    // Filter data for selected month and year
    const filteredData = sleepData.filter(entry => {
      const entryDate = new Date(entry.dateTaken);
      return entryDate.getMonth() === parseInt(selectedMonth) && 
             entryDate.getFullYear() === parseInt(selectedYear);
    });

    // Group data by date
    const groupedByDate = {};
    const hourlyPatterns = {}; // For tracking patterns by hour
    
    filteredData.forEach(entry => {
      const date = entry.dateTaken;
      const entryDate = new Date(date);
      const day = entryDate.getDate();
      const hour = entry.markedFor ? parseInt(entry.markedFor.split(':')[0]) : 0;
      
      // Initialize day data if not exists
      if (!groupedByDate[day]) {
        groupedByDate[day] = {
          day,
          date,
          awakeHours: 0,
          sleepHours: 0,
          entries: [],
          hourlyStatus: Array(24).fill(null) // Track status for each hour
        };
      }
      
      // Add entry details
      groupedByDate[day].entries.push({
        time: entry.markedFor,
        status: entry.markAs,
        hour
      });
      
      // Update hourly status
      if (hour >= 0 && hour < 24) {
        groupedByDate[day].hourlyStatus[hour] = entry.markAs;
      }
      
      // Count sleep/awake hours
      if (entry.markAs === 'A') {
        groupedByDate[day].awakeHours++;
        
        // Track hourly patterns
        if (!hourlyPatterns[hour]) hourlyPatterns[hour] = { awake: 0, sleep: 0 };
        hourlyPatterns[hour].awake++;
        
      } else if (entry.markAs === 'S') {
        groupedByDate[day].sleepHours++;
        
        // Track hourly patterns
        if (!hourlyPatterns[hour]) hourlyPatterns[hour] = { awake: 0, sleep: 0 };
        hourlyPatterns[hour].sleep++;
      }
    });

    // Convert to array and sort by day
    const chartData = Object.values(groupedByDate).sort((a, b) => a.day - b.day);
    
    // Add pattern analysis data
    chartData.patternAnalysis = Object.entries(hourlyPatterns).map(([hour, data]) => ({
      hour: parseInt(hour),
      awakeCount: data.awake,
      sleepCount: data.sleep,
      total: data.awake + data.sleep,
      awakePercentage: data.awake / (data.awake + data.sleep) * 100,
      sleepPercentage: data.sleep / (data.awake + data.sleep) * 100,
      timeLabel: `${hour.padStart ? hour.padStart(2, '0') : hour}:00`
    })).sort((a, b) => a.hour - b.hour);
    
    setChartData(chartData);
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleResidentChange = (e) => {
    setSelectedResident(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const selectedResidentName = selectedResident ? 
    residents.find(r => r.patientId === parseInt(selectedResident))?.firstName + " " + 
    residents.find(r => r.patientId === parseInt(selectedResident))?.lastName : "";

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Sleep Pattern Management</h1>
      
      <SelectionControls 
        loading={loading}
        branches={branches}
        selectedBranch={selectedBranch}
        handleBranchChange={handleBranchChange}
        filteredResidents={filteredResidents}
        selectedResident={selectedResident}
        handleResidentChange={handleResidentChange}
        months={months}
        selectedMonth={selectedMonth}
        handleMonthChange={handleMonthChange}
        years={years}
        selectedYear={selectedYear}
        handleYearChange={handleYearChange}
        viewMode={viewMode}
        handleViewModeChange={handleViewModeChange}
      />
      
      <SleepPatternChart 
        loadingSleepData={loadingSleepData}
        selectedResident={selectedResident}
        selectedResidentName={selectedResidentName}
        months={months}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        chartData={chartData}
        viewMode={viewMode}
      />
      
      {selectedResident && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <MonthlySummary chartData={chartData} />
          <PatternAnalysis chartData={chartData} />
        </div>
      )}
    </div>
  );
};

export default ManageSleepPatterns;