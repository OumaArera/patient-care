import React from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

const SleepPatternChart = ({
  loadingSleepData,
  selectedResident,
  selectedResidentName,
  months,
  selectedMonth,
  selectedYear,
  chartData,
  viewMode
}) => {
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-bold text-gray-800">Date: {new Date(data.date).toLocaleDateString()}</p>
          <p className="text-blue-600 font-medium">Awake Hours: {data.awakeHours}</p>
          <p className="text-purple-600 font-medium">Sleep Hours: {data.sleepHours}</p>
          <div className="mt-2">
            <p className="font-semibold text-gray-700">Details:</p>
            <div className="max-h-48 overflow-y-auto">
              {data.entries.sort((a, b) => {
                const aHour = parseInt(a.time.split(':')[0]);
                const bHour = parseInt(b.time.split(':')[0]);
                return aHour - bHour;
              }).map((entry, idx) => (
                <p key={idx} className={`${entry.status === 'A' ? 'text-blue-600' : 'text-purple-600'} text-sm py-1`}>
                  {entry.time}: {entry.status === 'A' ? 'Awake' : 'Sleeping'}
                </p>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render heatmap chart
  const renderHeatmapChart = () => {
    if (!chartData.length || !chartData.patternAnalysis) return null;
    
    // Group data by hour across the month
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourlyStats = chartData.patternAnalysis.find(h => h.hour === hour) || {
        hour,
        awakeCount: 0,
        sleepCount: 0,
        awakePercentage: 0,
        sleepPercentage: 0,
        timeLabel: `${hour.toString().padStart(2, '0')}:00`
      };
      
      return {
        hour,
        timeLabel: `${hour.toString().padStart(2, '0')}:00`,
        awakeCount: hourlyStats.awakeCount || 0,
        sleepCount: hourlyStats.sleepCount || 0,
        sleepPercentage: hourlyStats.sleepPercentage || 0
      };
    });
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3">Hourly Sleep Pattern</h3>
        <div className="flex flex-wrap justify-center mt-2">
          {hourlyData.map((hourData) => (
            <div 
              key={hourData.hour} 
              className="relative m-1"
              title={`${hourData.timeLabel}: ${Math.round(hourData.sleepPercentage)}% Sleep`}
            >
              <div className="text-xs font-medium text-center mb-1">{hourData.hour}</div>
              <div 
                className="h-20 w-8 rounded-sm flex items-end"
                style={{ 
                  backgroundColor: `rgba(139, 92, 246, ${hourData.sleepPercentage / 100})`,
                  border: '1px solid #e2e8f0'
                }}
              >
                <div 
                  className="w-full bg-purple-500 opacity-50"
                  style={{ 
                    height: `${hourData.sleepPercentage}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-center mt-1">
                {hourData.awakeCount + hourData.sleepCount > 0 ? 
                  `${Math.round(hourData.sleepPercentage)}%` : '-'}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center mt-4">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-white border border-gray-300 mr-1"></div>
            <span className="text-sm text-gray-700 mr-4">Awake</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-purple-500 mr-1"></div>
            <span className="text-sm text-gray-700">Sleep</span>
          </div>
        </div>
      </div>
    );
  };

  // Render bar chart
  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="day" 
            label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
            tick={{ fill: '#4B5563' }}
          />
          <YAxis 
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} 
            tick={{ fill: '#4B5563' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Bar dataKey="awakeHours" name="Awake Hours" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="sleepHours" name="Sleep Hours" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render line chart
  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="day" 
            label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
            tick={{ fill: '#4B5563' }}
          />
          <YAxis 
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} 
            tick={{ fill: '#4B5563' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <ReferenceLine y={8} stroke="#CBD5E1" strokeDasharray="3 3" label="8 hours" />
          <Line 
            type="monotone" 
            dataKey="awakeHours" 
            name="Awake Hours" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="sleepHours" 
            name="Sleep Hours" 
            stroke="#8b5cf6" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render appropriate chart based on viewMode
  const renderChart = () => {
    switch (viewMode) {
      case "line":
        return renderLineChart();
      case "heatmap":
        return renderHeatmapChart();
      case "bar":
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {loadingSleepData ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
            <div className="mt-4 text-lg text-gray-600">Loading sleep data...</div>
          </div>
        </div>
      ) : selectedResident && chartData.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Sleep Patterns for {selectedResidentName}
            </h2>
            <div className="text-gray-600 font-medium">
              {months[selectedMonth]} {selectedYear}
            </div>
          </div>
          {renderChart()}
          {viewMode === "heatmap" && (
            <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p>The heatmap shows the percentage of time the resident is asleep during each hour of the day across the selected month. Darker purple indicates more sleep time during that hour.</p>
            </div>
          )}
        </>
      ) : selectedResident ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-gray-500">
            No sleep data available for {selectedResidentName} in {months[selectedMonth]} {selectedYear}
          </p>
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Select a resident</h3>
          <p className="mt-1 text-gray-500">
            Select a branch and resident to view sleep patterns
          </p>
        </div>
      )}
    </div>
  );
};

export default SleepPatternChart;