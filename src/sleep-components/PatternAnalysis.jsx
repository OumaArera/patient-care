import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PatternAnalysis = ({ chartData }) => {
  // Check if pattern analysis data exists
  if (!chartData.patternAnalysis || chartData.patternAnalysis.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Pattern Analysis</h3>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Insufficient data for pattern analysis</div>
        </div>
      </div>
    );
  }

  // Process pattern data
  const hourlyData = chartData.patternAnalysis;
  
  // Identify common sleep and wake times
  const sleepTimeData = hourlyData
    .map((hour, index, array) => {
      const prevHour = index > 0 ? array[index - 1] : null;
      return {
        hour: hour.hour,
        timeLabel: hour.timeLabel,
        sleepTransition: prevHour && prevHour.sleepPercentage < 50 && hour.sleepPercentage >= 50,
        sleepPercentage: hour.sleepPercentage
      };
    })
    .filter(h => h.sleepTransition);

  const wakeTimeData = hourlyData
    .map((hour, index, array) => {
      const prevHour = index > 0 ? array[index - 1] : null;
      return {
        hour: hour.hour,
        timeLabel: hour.timeLabel,
        wakeTransition: prevHour && prevHour.sleepPercentage >= 50 && hour.sleepPercentage < 50,
        awakePercentage: 100 - hour.sleepPercentage
      };
    })
    .filter(h => h.wakeTransition);
  
  // Find most common sleep time
  const mostCommonSleepTime = sleepTimeData.length > 0 
    ? sleepTimeData[0].timeLabel
    : "Not enough data";
    
  // Find most common wake time
  const mostCommonWakeTime = wakeTimeData.length > 0 
    ? wakeTimeData[0].timeLabel
    : "Not enough data";
    
  // Find the deepest sleep hours (highest sleep percentage)
  const deepSleepHours = [...hourlyData]
    .sort((a, b) => b.sleepPercentage - a.sleepPercentage)
    .slice(0, 3)
    .map(h => h.timeLabel)
    .join(", ");
    
  // Calculate sleep quality score (0-100)
  const hasEnoughSleepData = hourlyData.some(h => h.sleepPercentage > 50);
  const sleepContinuity = hasEnoughSleepData 
    ? hourlyData.reduce((count, hour, index, arr) => {
        if (index === 0) return count;
        const prevHour = arr[index - 1];
        // If both current and previous hour have similar sleep patterns (both mostly sleep or both mostly awake)
        const transition = (hour.sleepPercentage > 50 && prevHour.sleepPercentage <= 50) || 
                         (hour.sleepPercentage <= 50 && prevHour.sleepPercentage > 50);
        return count + (transition ? 1 : 0);
      }, 0)
    : 0;
    
  const maxContinuity = 6; // Expected number of transitions in a good sleep pattern (sleep once, wake once)
  const sleepContinuityScore = Math.max(0, 100 - Math.max(0, sleepContinuity - maxContinuity) * 15);
  
  // Calculate sleep duration score
  const sleepTotal = hourlyData.reduce((sum, hour) => sum + hour.sleepPercentage/100, 0);
  const sleepDurationScore = Math.min(100, sleepTotal / 8 * 100); // 8 hours is ideal
  
  // Calculate sleep quality score
  const sleepQualityScore = hasEnoughSleepData 
    ? Math.round((sleepContinuityScore * 0.5) + (sleepDurationScore * 0.5))
    : 0;
    
  // Custom tooltip for hourly chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-bold">{data.timeLabel}</p>
          <p className="text-blue-500">Awake: {Math.round(100 - data.sleepPercentage)}%</p>
          <p className="text-purple-500">Sleep: {Math.round(data.sleepPercentage)}%</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Pattern Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-3 rounded-md">
          <div className="text-sm text-gray-600">Common Sleep Time</div>
          <div className="text-lg font-semibold text-indigo-600">{mostCommonSleepTime}</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-md">
          <div className="text-sm text-gray-600">Common Wake Time</div>
          <div className="text-lg font-semibold text-amber-600">{mostCommonWakeTime}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-md">
          <div className="text-sm text-gray-600">Sleep Quality</div>
          <div className="text-lg font-semibold text-purple-600">{sleepQualityScore}/100</div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2">Hourly Sleep Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12, fill: '#4B5563' }}
                ticks={[0, 6, 12, 18, 23]}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#4B5563' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sleepPercentage" name="Sleep %" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h4 className="font-medium text-gray-800 mb-2">Key Observations</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="mr-2 text-purple-500">•</span>
            Deepest sleep hours: {deepSleepHours || "Not enough data"}
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-purple-500">•</span>
            {sleepContinuity > maxContinuity 
              ? "Sleep pattern shows frequent transitions between sleep and wakefulness" 
              : "Sleep pattern shows normal transitions between sleep and wakefulness"}
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-purple-500">•</span>
            {sleepQualityScore >= 80 
              ? "Overall sleep quality appears good" 
              : sleepQualityScore >= 60 
                ? "Moderate sleep quality with room for improvement" 
                : "Sleep quality could benefit from attention and improvement"}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PatternAnalysis;