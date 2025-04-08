import React, { useEffect, useState } from "react";
import { getData } from "../../services/updatedata";
import { fetchPatients } from "../../services/fetchPatients";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
    
    filteredData.forEach(entry => {
      const date = entry.dateTaken;
      const day = new Date(date).getDate();
      
      if (!groupedByDate[day]) {
        groupedByDate[day] = {
          day,
          date,
          awakeHours: 0,
          sleepHours: 0,
          entries: []
        };
      }
      
      groupedByDate[day].entries.push({
        time: entry.markedFor,
        status: entry.markAs
      });
      
      if (entry.markAs === 'A') {
        groupedByDate[day].awakeHours++;
      } else if (entry.markAs === 'S') {
        groupedByDate[day].sleepHours++;
      }
    });

    // Convert to array and sort by day
    const chartData = Object.values(groupedByDate).sort((a, b) => a.day - b.day);
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

  const formatTimeForTooltip = (entries) => {
    if (!entries || entries.length === 0) return "";
    
    return entries.map(entry => {
      return `${entry.time}: ${entry.status === 'A' ? 'Awake' : 'Sleeping'}`;
    }).join('\n');
  };

  const selectedResidentName = selectedResident ? 
    residents.find(r => r.patientId === parseInt(selectedResident))?.firstName + " " + 
    residents.find(r => r.patientId === parseInt(selectedResident))?.lastName : "";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-bold">{`Date: ${new Date(data.date).toLocaleDateString()}`}</p>
          <p className="text-blue-500">{`Awake Hours: ${data.awakeHours}`}</p>
          <p className="text-purple-500">{`Sleep Hours: ${data.sleepHours}`}</p>
          <div className="mt-2">
            <p className="font-semibold">Details:</p>
            {data.entries.map((entry, idx) => (
              <p key={idx} className={`${entry.status === 'A' ? 'text-blue-500' : 'text-purple-500'}`}>
                {`${entry.time}: ${entry.status === 'A' ? 'Awake' : 'Sleeping'}`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sleep Pattern Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Branch Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedBranch}
            onChange={handleBranchChange}
            disabled={loading || branches.length === 0}
          >
            <option value="">Select a branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Resident Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Resident</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedResident}
            onChange={handleResidentChange}
            disabled={!selectedBranch || filteredResidents.length === 0}
          >
            <option value="">Select a resident</option>
            {filteredResidents.map((resident) => (
              <option key={resident.patientId} value={resident.patientId}>
                {resident.firstName} {resident.lastName}
              </option>
            ))}
          </select>
        </div>
        
        {/* Time Period Selection */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedMonth}
              onChange={handleMonthChange}
              disabled={!selectedResident}
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedYear}
              onChange={handleYearChange}
              disabled={!selectedResident}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Sleep Data Visualization */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {loadingSleepData ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-500">Loading sleep data...</div>
          </div>
        ) : selectedResident && chartData.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Sleep Patterns for {selectedResidentName} - {months[selectedMonth]} {selectedYear}
            </h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="awakeHours" name="Awake Hours" fill="#3b82f6" />
                  <Bar dataKey="sleepHours" name="Sleep Hours" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {chartData.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No sleep data available for {selectedResidentName} in {months[selectedMonth]} {selectedYear}
              </div>
            )}
          </>
        ) : selectedResident ? (
          <div className="text-center py-10 text-gray-500">
            No sleep data available for the selected resident in {months[selectedMonth]} {selectedYear}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Select a branch and resident to view sleep patterns
          </div>
        )}
      </div>
      
      {/* Optional: Summary Information */}
      {selectedResident && chartData.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <div className="text-xl font-bold text-blue-600">
                {chartData.reduce((sum, day) => sum + day.awakeHours, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Awake Hours</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-md">
              <div className="text-xl font-bold text-purple-600">
                {chartData.reduce((sum, day) => sum + day.sleepHours, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Sleep Hours</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-xl font-bold text-gray-600">
                {chartData.length}
              </div>
              <div className="text-sm text-gray-600">Days with Records</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSleepPatterns;