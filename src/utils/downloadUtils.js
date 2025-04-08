import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Downloads sleep pattern data in PDF format
 * @param {Array} sleepData - Raw sleep data
 * @param {Object} residentInfo - Information about the resident
 * @param {number} selectedMonth - The selected month (0-11)
 * @param {number} selectedYear - The selected year
 * @returns {Promise} - Promise that resolves when download is complete
 */
export const downloadSleepPatternData = async (sleepData, residentInfo, selectedMonth, selectedYear) => {
  if (!sleepData || sleepData.length === 0) return;

  const { residentName, facilityName, branchName, month, year } = residentInfo;
  const pdf = new jsPDF('landscape');

  const captureAsImage = async (htmlContent) => {
    const container = document.createElement("div");
    container.style.padding = "15px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#000";
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    const canvas = await html2canvas(container, { scale: 1.5 });
    document.body.removeChild(container);
    
    return canvas.toDataURL("image/jpeg", 0.7);
  };

  // Filter data for selected month and year
  const filteredData = sleepData.filter(entry => {
    const entryDate = new Date(entry.dateTaken);
    return entryDate.getMonth() === parseInt(selectedMonth) && 
           entryDate.getFullYear() === parseInt(selectedYear);
  });

  // Get days in selected month
  const daysInMonth = new Date(selectedYear, parseInt(selectedMonth) + 1, 0).getDate();
  
  // Create day-by-hour mapping for sleep/awake data
  const dataByDay = {};
  
  // Initialize data structure for each day
  for (let day = 1; day <= daysInMonth; day++) {
    dataByDay[day] = Array(24).fill("");
  }
  
  // Populate data
  filteredData.forEach(entry => {
    const entryDate = new Date(entry.dateTaken);
    const day = entryDate.getDate();
    const hour = entry.markedFor ? parseInt(entry.markedFor.split(':')[0]) : 0;
    
    if (day >= 1 && day <= daysInMonth && hour >= 0 && hour < 24) {
      dataByDay[day][hour] = entry.markAs;
    }
  });

  // Generate HTML table - header with resident info
  let tableHTML = `
    <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
      ${facilityName} - ${branchName}
    </div>
    <div style="text-align: center; font-size: 16px; margin-bottom: 15px;">
      Sleep Pattern Report
    </div>
    <div style="font-size: 14px; margin-bottom: 20px;">
      <strong>Year:</strong> ${year} &nbsp;&nbsp;
      <strong>Month:</strong> ${month} &nbsp;&nbsp;
      <strong>Resident Name:</strong> ${residentName}
    </div>
  `;
  
  // Create table with hours from 7AM to 6AM the next day
  tableHTML += `<table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">
    <thead>
      <tr style="background: #f0f0f0; text-align: center; font-weight: bold;">
        <th style="padding: 6px; border: 1px solid #000;">Date</th>`;
  
  // Generate hour columns (7AM to 6AM next day)
  const hours = [];
  for (let i = 7; i < 24; i++) {
    hours.push(i);
  }
  for (let i = 0; i < 7; i++) {
    hours.push(i);
  }
  
  hours.forEach(hour => {
    const hourLabel = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    tableHTML += `<th style="padding: 6px; border: 1px solid #000;">${hourLabel}</th>`;
  });
  
  tableHTML += `</tr></thead><tbody>`;
  
  // Add data rows
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = `${year}-${(parseInt(selectedMonth) + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    tableHTML += `<tr>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${formattedDate}</td>`;
    
    // Add data for each hour in the reordered sequence (7AM to 6AM)
    hours.forEach(hour => {
      const status = dataByDay[day][hour];
      tableHTML += `<td style="padding: 6px; border: 1px solid #000; text-align: center; 
        ${status === 'S' ? 'background-color: #E0F7FA;' : status === 'A' ? 'background-color: #FFF9C4;' : ''}">
        ${status}
      </td>`;
    });
    
    tableHTML += `</tr>`;
  }
  
  tableHTML += `</tbody></table>`;
  
  // Create legend
  tableHTML += `
    <div style="margin-top: 20px; font-size: 12px;">
      <p><strong>Legend:</strong></p>
      <p><span style="display: inline-block; width: 20px; height: 12px; background-color: #E0F7FA; border: 1px solid #000;"></span> S - Sleeping</p>
      <p><span style="display: inline-block; width: 20px; height: 12px; background-color: #FFF9C4; border: 1px solid #000;"></span> A - Awake</p>
      <p><span style="display: inline-block; width: 20px; height: 12px; border: 1px solid #000;"></span> Empty - No data recorded</p>
    </div>
  `;
  
  // Add summary section
  const sleepCounts = Object.values(dataByDay).reduce((acc, dayData) => {
    dayData.forEach(status => {
      if (status === 'S') acc.sleep++;
      else if (status === 'A') acc.awake++;
    });
    return acc;
  }, { sleep: 0, awake: 0 });
  
  const totalRecorded = sleepCounts.sleep + sleepCounts.awake;
  const sleepPercentage = totalRecorded > 0 ? ((sleepCounts.sleep / totalRecorded) * 100).toFixed(1) : 0;
  const awakePercentage = totalRecorded > 0 ? ((sleepCounts.awake / totalRecorded) * 100).toFixed(1) : 0;
  
  tableHTML += `
    <div style="margin-top: 30px; font-size: 14px;">
      <h3 style="font-size: 16px; margin-bottom: 10px;">Monthly Summary</h3>
      <p><strong>Total Sleep Hours:</strong> ${sleepCounts.sleep} (${sleepPercentage}%)</p>
      <p><strong>Total Awake Hours:</strong> ${sleepCounts.awake} (${awakePercentage}%)</p>
      <p><strong>Total Hours Recorded:</strong> ${totalRecorded}</p>
    </div>
  `;
  
  // Capture the HTML content as an image and add to PDF
  const pageImage = await captureAsImage(tableHTML);
  pdf.addImage(pageImage, "JPEG", 10, 10, 280, 0);
  
  // Save the PDF
  pdf.save(`SleepPattern_${residentName}_${year}_${month}.pdf`);
};

/**
 * Downloads sleep pattern data in CSV format
 * @param {Array} sleepData - Raw sleep data
 * @param {Object} residentInfo - Information about the resident
 * @param {number} selectedMonth - The selected month (0-11)
 * @param {number} selectedYear - The selected year
 */
export const downloadSleepPatternCSV = (sleepData, residentInfo, selectedMonth, selectedYear) => {
  if (!sleepData || sleepData.length === 0) return;

  const { residentName } = residentInfo;
  
  // Filter data for selected month and year
  const filteredData = sleepData.filter(entry => {
    const entryDate = new Date(entry.dateTaken);
    return entryDate.getMonth() === parseInt(selectedMonth) && 
           entryDate.getFullYear() === parseInt(selectedYear);
  });

  // Get days in month
  const daysInMonth = new Date(selectedYear, parseInt(selectedMonth) + 1, 0).getDate();
  
  // Create day-by-hour mapping
  const dataByDay = {};
  
  // Initialize data structure
  for (let day = 1; day <= daysInMonth; day++) {
    dataByDay[day] = Array(24).fill("");
  }
  
  // Populate data
  filteredData.forEach(entry => {
    const entryDate = new Date(entry.dateTaken);
    const day = entryDate.getDate();
    const hour = entry.markedFor ? parseInt(entry.markedFor.split(':')[0]) : 0;
    
    if (day >= 1 && day <= daysInMonth && hour >= 0 && hour < 24) {
      dataByDay[day][hour] = entry.markAs;
    }
  });

  // Create hours header (7AM to 6AM)
  const hours = [];
  for (let i = 7; i < 24; i++) {
    hours.push(i);
  }
  for (let i = 0; i < 7; i++) {
    hours.push(i);
  }
  
  // Create CSV content
  let csvContent = "Date," + hours.map(h => `${h < 10 ? '0' + h : h}:00`).join(",") + "\n";
  
  // Add data rows
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = `${year}-${(parseInt(selectedMonth) + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    let row = formattedDate;
    hours.forEach(hour => {
      row += "," + dataByDay[day][hour];
    });
    
    csvContent += row + "\n";
  }
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SleepPattern_${residentName}_${selectedYear}_${selectedMonth + 1}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};