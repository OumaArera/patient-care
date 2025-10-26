import React from "react";

const MonthlySummary = ({ chartData }) => {
  // Calculate stats
  const totalAwakeHours = chartData.reduce((sum, day) => sum + day.awakeHours, 0);
  const totalSleepHours = chartData.reduce((sum, day) => sum + day.sleepHours, 0);
  const daysWithRecords = chartData.length;
  const averageSleepHours = daysWithRecords > 0 ? (totalSleepHours / daysWithRecords).toFixed(1) : 0;
  const averageAwakeHours = daysWithRecords > 0 ? (totalAwakeHours / daysWithRecords).toFixed(1) : 0;
  
  // Find days with most/least sleep
  const dayWithMostSleep = chartData.length > 0 
    ? chartData.reduce((max, day) => max.sleepHours > day.sleepHours ? max : day) 
    : null;
  
  const dayWithLeastSleep = chartData.length > 0 
    ? chartData.reduce((min, day) => (min.sleepHours < day.sleepHours && day.sleepHours > 0) ? min : day) 
    : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Monthly Summary</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-md">
          <div className="text-2xl font-bold text-blue-600">{totalAwakeHours}</div>
          <div className="text-sm text-gray-600">Total Awake Hours</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-md">
          <div className="text-2xl font-bold text-purple-600">{totalSleepHours}</div>
          <div className="text-sm text-gray-600">Total Sleep Hours</div>
        </div>
        <div className="p-4 bg-green-50 rounded-md">
          <div className="text-2xl font-bold text-green-600">{averageSleepHours}</div>
          <div className="text-sm text-gray-600">Avg. Sleep Hours / Day</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="text-2xl font-bold text-gray-600">{daysWithRecords}</div>
          <div className="text-sm text-gray-600">Days With Records</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Sleep Quality Indicators</h4>
          
          <div className="flex items-center mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${averageSleepHours >= 7 ? 'bg-green-500' : averageSleepHours >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                style={{ width: `${Math.min(averageSleepHours/10*100, 100)}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600 whitespace-nowrap">{averageSleepHours} hrs</span>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            {averageSleepHours >= 7 
              ? "Healthy sleep pattern" 
              : averageSleepHours >= 5 
                ? "Moderate sleep deficit" 
                : "Significant sleep deficit"}
          </div>
        </div>
        
        {dayWithMostSleep && (
          <div className="flex space-x-4">
            <div className="flex-1 p-3 border rounded-md border-gray-200">
              <div className="text-sm text-gray-500">Most Sleep</div>
              <div className="font-medium">{new Date(dayWithMostSleep.date).getDate()}</div>
              <div className="text-purple-600 font-bold">{dayWithMostSleep.sleepHours} hrs</div>
            </div>
            
            {dayWithLeastSleep && dayWithLeastSleep.sleepHours > 0 && (
              <div className="flex-1 p-3 border rounded-md border-gray-200">
                <div className="text-sm text-gray-500">Least Sleep</div>
                <div className="font-medium">{new Date(dayWithLeastSleep.date).getDate()}</div>
                <div className="text-purple-600 font-bold">{dayWithLeastSleep.sleepHours} hrs</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlySummary;