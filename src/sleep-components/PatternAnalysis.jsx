// SleepPatternComponents/PatternAnalysis.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
  const hourlyData = chartData.patternAnalysis.map(hour => ({
    ...hour,
    // Make sure we account for N/A percentages
    notPresentPercentage: hour.notPresentPercentage || 0,
    // Ensure sleep percentage doesn't include N/A time
    sleepPercentage: hour.sleepPercentage || 0,
    // Calculate awake percentage based on sleep and not present
    awakePercentage: 100 - (hour.sleepPercentage || 0) - (hour.notPresentPercentage || 0)
  }));
  
  // Identify common sleep and wake times - only consider when resident is present
  const sleepTimeData = hourlyData
    .map((hour, index, array) => {
      const prevHour = index > 0 ? array[index - 1] : null;
      const currPresentPercentage = 100 - hour.notPresentPercentage;
      const prevPresentPercentage = prevHour ? 100 - prevHour.notPresentPercentage : 0;
      
      // Only consider transitions when the resident is mostly present in both hours
      if (currPresentPercentage < 50 || (prevHour && prevPresentPercentage < 50)) {
        return null;
      }
      
      return {
        hour: hour.hour,
        timeLabel: hour.timeLabel,
        sleepTransition: prevHour && 
                        (prevHour.sleepPercentage / prevPresentPercentage * 100) < 50 && 
                        (hour.sleepPercentage / currPresentPercentage * 100) >= 50,
        sleepPercentage: hour.sleepPercentage
      };
    })
    .filter(h => h && h.sleepTransition);

  const wakeTimeData = hourlyData
    .map((hour, index, array) => {
      const prevHour = index > 0 ? array[index - 1] : null;
      const currPresentPercentage = 100 - hour.notPresentPercentage;
      const prevPresentPercentage = prevHour ? 100 - prevHour.notPresentPercentage : 0;
      
      // Only consider transitions when the resident is mostly present in both hours
      if (currPresentPercentage < 50 || (prevHour && prevPresentPercentage < 50)) {
        return null;
      }
      
      return {
        hour: hour.hour,
        timeLabel: hour.timeLabel,
        wakeTransition: prevHour && 
                      (prevHour.sleepPercentage / prevPresentPercentage * 100) >= 50 && 
                      (hour.sleepPercentage / currPresentPercentage * 100) < 50,
        awakePercentage: hour.awakePercentage
      };
    })
    .filter(h => h && h.wakeTransition);
  
  // Find most common sleep time
  const mostCommonSleepTime = sleepTimeData.length > 0 
    ? sleepTimeData[0].timeLabel
    : "Not enough data";
    
  // Find most common wake time
  const mostCommonWakeTime = wakeTimeData.length > 0 
    ? wakeTimeData[0].timeLabel
    : "Not enough data";
    
  // Find the deepest sleep hours (highest sleep percentage) - only when present
  const deepSleepHours = [...hourlyData]
    .filter(h => (100 - h.notPresentPercentage) > 50) // Only consider when resident is mostly present
    .sort((a, b) => b.sleepPercentage - a.sleepPercentage)
    .slice(0, 3)
    .map(h => h.timeLabel)
    .join(", ");
    
  // Calculate presence percentage
  const presencePercentage = hourlyData.reduce((sum, hour) => 
    sum + (100 - hour.notPresentPercentage)/100, 0) / hourlyData.length * 100;
    
  // Calculate sleep quality score (0-100) - only consider when resident is present
  const presentHours = hourlyData.filter(h => (100 - h.notPresentPercentage) > 50);
  const hasEnoughSleepData = presentHours.some(h => h.sleepPercentage > 50);
  
  const sleepContinuity = hasEnoughSleepData 
    ? presentHours.reduce((count, hour, index, arr) => {
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
  
  // Calculate sleep duration score - only for hours when present
  const totalPresentHours = presentHours.length;
  const sleepTotal = presentHours.reduce((sum, hour) => sum + hour.sleepPercentage/100, 0);
  const sleepDurationScore = totalPresentHours > 0 
    ? Math.min(100, (sleepTotal / (totalPresentHours * 0.66)) * 100) // Expect ~66% of present time sleeping
    : 0;
  
  // Calculate sleep quality score
  const sleepQualityScore = hasEnoughSleepData && totalPresentHours >= 8
    ? Math.round((sleepContinuityScore * 0.5) + (sleepDurationScore * 0.5))
    : totalPresentHours < 8 ? "Insufficient presence" : 0;
    
  // Custom tooltip for hourly chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-bold">{data.timeLabel}</p>
          <p className="text-green-500">Not Present: {Math.round(data.notPresentPercentage)}%</p>
          <p className="text-blue-500">Awake: {Math.round(data.awakePercentage)}%</p>
          <p className="text-purple-500">Sleep: {Math.round(data.sleepPercentage)}%</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Pattern Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <div className="text-lg font-semibold text-purple-600">
            {typeof sleepQualityScore === 'number' ? `${sleepQualityScore}/100` : sleepQualityScore}
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded-md">
          <div className="text-sm text-gray-600">Presence in Facility</div>
          <div className="text-lg font-semibold text-green-600">{Math.round(presencePercentage)}%</div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2">Hourly Status Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              stackOffset="expand"
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
              <Legend />
              <Bar dataKey="notPresentPercentage" name="Not Present" stackId="1" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="awakePercentage" name="Awake" stackId="1" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="sleepPercentage" name="Sleep" stackId="1" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
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
            <span className="mr-2 text-green-500">•</span>
            Resident is present in the facility {Math.round(presencePercentage)}% of the time
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-purple-500">•</span>
            {sleepContinuity > maxContinuity 
              ? "Sleep pattern shows frequent transitions between sleep and wakefulness" 
              : "Sleep pattern shows normal transitions between sleep and wakefulness"}
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-purple-500">•</span>
            {typeof sleepQualityScore === 'number' ? (
              sleepQualityScore >= 80 
                ? "Overall sleep quality appears good" 
                : sleepQualityScore >= 60 
                  ? "Moderate sleep quality with room for improvement" 
                  : "Sleep quality could benefit from attention and improvement"
            ) : (
              "Unable to assess sleep quality due to limited presence data"
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PatternAnalysis;