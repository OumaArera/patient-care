import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Downloads sleep pattern data in PDF format based on the requested format
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
  
  // Create hour-by-day mapping for sleep/awake data
  const dataByHourDay = {};
  
  // Define all time slots in order from 12AM to 11PM
  const timeSlots = [
    "12:00AM", "1:00AM", "2:00AM", "3:00AM", "4:00AM", "5:00AM", "6:00AM",
    "7:00AM", "8:00AM", "9:00AM", "10:00AM", "11:00AM", 
    "12:00PM", "1:00PM", "2:00PM", "3:00PM", "4:00PM", "5:00PM", "6:00PM", 
    "7:00PM", "8:00PM", "9:00PM", "10:00PM", "11:00PM"
  ];
  
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

  // Generate HTML table - header with resident info
  let tableHTML = `
    <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
      ${facilityName}
    </div>
    <div style="text-align: center; font-size: 16px; margin-bottom: 10px;">
      SLEEPING LOG
    </div>
    <div style="font-size: 14px; margin-bottom: 10px;">
      <strong>MONTH:</strong> ${month} ${year} &nbsp;&nbsp;
      <strong>NAME OF CLIENT:</strong> ${residentName}
    </div>
  `;
  
  // Create table with time slots as rows and days as columns
  tableHTML += `<table border="1" style="width: 100%; border-collapse: collapse; font-size: 11px;">
    <thead>
      <tr style="background: #f0f0f0; text-align: center; font-weight: bold;">
        <th style="padding: 4px; border: 1px solid #000; width: 70px;">TIME</th>`;
  
  // Generate day columns (1-31)
  for (let day = 1; day <= daysInMonth; day++) {
    tableHTML += `<th style="padding: 4px; border: 1px solid #000; width: 25px;">${day}</th>`;
  }
  
  tableHTML += `</tr></thead><tbody>`;
  
  // Add time slot rows
  timeSlots.forEach(timeSlot => {
    tableHTML += `<tr>
      <td style="padding: 5px; border: 1px solid #000; text-align: center; font-weight: bold;">${timeSlot}</td>`;
    
    // Add data for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const status = dataByHourDay[timeSlot][day];
      let backgroundColor = "";
      
      if (status === 'S') {
        backgroundColor = "background-color: #E0F7FA;";
      } else if (status === 'A') {
        backgroundColor = "background-color: #FFF9C4;";
      } else if (status === 'N/A') {
        backgroundColor = "background-color: #EEEEEE;";
      }
      
      tableHTML += `<td style="padding: 5px; border: 1px solid #000; text-align: center; ${backgroundColor}">
        ${status}
      </td>`;
    }
    
    tableHTML += `</tr>`;
  });
  
  tableHTML += `</tbody></table>`;
  
  // Create legend
  tableHTML += `
    <div style="margin-top: 20px; font-size: 12px;">
      <p><strong>Legend:</strong></p>
      <p><span style="display: inline-block; width: 20px; height: 12px; background-color: #E0F7FA; border: 1px solid #000;"></span> S - Sleeping</p>
      <p><span style="display: inline-block; width: 20px; height: 12px; background-color: #FFF9C4; border: 1px solid #000;"></span> A - Awake</p>
      <p><span style="display: inline-block; width: 20px; height: 12px; background-color: #EEEEEE; border: 1px solid #000;"></span> N/A - Resident not at the Facility</p>
      <p><span style="display: inline-block; width: 20px; height: 12px; border: 1px solid #000;"></span> Empty - No data recorded</p>
    </div>
  `;
  
  // Add summary section
  let sleepCount = 0;
  let awakeCount = 0;
  let naCount = 0;
  
  // Count the different statuses
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
  
  tableHTML += `
    <div style="margin-top: 20px; font-size: 14px;">
      <h3 style="font-size: 16px; margin-bottom: 10px;">Monthly Summary</h3>
      <p><strong>Total Sleep Hours:</strong> ${sleepCount} (${sleepPercentage}%)</p>
      <p><strong>Total Awake Hours:</strong> ${awakeCount} (${awakePercentage}%)</p>
      <p><strong>Total Not at Facility Hours:</strong> ${naCount} (${naPercentage}%)</p>
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
  
  // Define all time slots in order from 12AM to 11PM
  const timeSlots = [
    "12:00AM", "1:00AM", "2:00AM", "3:00AM", "4:00AM", "5:00AM", "6:00AM",
    "7:00AM", "8:00AM", "9:00AM", "10:00AM", "11:00AM", 
    "12:00PM", "1:00PM", "2:00PM", "3:00PM", "4:00PM", "5:00PM", "6:00PM", 
    "7:00PM", "8:00PM", "9:00PM", "10:00PM", "11:00PM"
  ];
  
  // Create hour-by-day mapping
  const dataByHourDay = {};
  
  // Initialize data structure
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
  
  // Create CSV content
  let csvContent = "TIME," + Array.from({ length: daysInMonth }, (_, i) => i + 1).join(",") + "\n";
  
  // Add data rows
  timeSlots.forEach(timeSlot => {
    let row = timeSlot;
    
    for (let day = 1; day <= daysInMonth; day++) {
      row += "," + dataByHourDay[timeSlot][day];
    }
    
    csvContent += row + "\n";
  });
  
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