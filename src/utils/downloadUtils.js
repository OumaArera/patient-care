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
  
  // Create PDF in landscape orientation with more precise dimensions
  // A4 landscape dimensions in points: 841.89 x 595.28
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });
  
  // Calculate available space
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20; // margins in points
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);

  const captureAsImage = async (htmlContent) => {
    // Create a container with specific dimensions to better control the output
    const container = document.createElement("div");
    container.style.width = `${contentWidth}px`;
    container.style.padding = "0"; // Remove padding to maximize usable space
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#000";
    container.style.fontSize = "10px"; // Reduce font size slightly for better fit
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    // Increase scale for better quality, but keep reasonable for file size
    const canvas = await html2canvas(container, { 
      scale: 2.0, // Higher scale for better print quality
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    document.body.removeChild(container);
    
    return canvas.toDataURL("image/jpeg", 0.9); // Higher quality JPEG
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
  
  // Populate data with day shift (map data for a day to the next day)
  filteredData.forEach(entry => {
    const entryDate = new Date(entry.dateTaken);
    const day = entryDate.getDate();
    
    if (day >= 1 && day <= daysInMonth && timeSlots.includes(entry.markedFor)) {
      dataByHourDay[entry.markedFor][day] = entry.markAs;
    }
  });

  // Generate HTML table - header with resident info (more compact)
  let tableHTML = `
    <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 6px;">
      ${facilityName}
    </div>
    <div style="text-align: center; font-size: 14px; margin-bottom: 6px;">
      SLEEPING LOG
    </div>
    <div style="font-size: 12px; margin-bottom: 6px;">
      <strong>MONTH:</strong> ${month} ${year} &nbsp;&nbsp;
      <strong>NAME OF CLIENT:</strong> ${residentName}
    </div>
  `;
  
  // Create more compact table with time slots as rows and days as columns
  tableHTML += `<table border="1" style="width: 100%; border-collapse: collapse; font-size: 9px;">
    <thead>
      <tr style="background: #f0f0f0; text-align: center; font-weight: bold;">
        <th style="padding: 2px; border: 1px solid #000; width: 60px;">TIME</th>`;
  
  // Generate day columns (1-31)
  for (let day = 1; day <= daysInMonth; day++) {
    tableHTML += `<th style="padding: 2px; border: 1px solid #000; width: 20px;">${day}</th>`;
  }
  
  tableHTML += `</tr></thead><tbody>`;
  
  // Add time slot rows
  timeSlots.forEach(timeSlot => {
    tableHTML += `<tr>
      <td style="padding: 3px; border: 1px solid #000; text-align: center; font-weight: bold;">${timeSlot}</td>`;
    
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
      
      tableHTML += `<td style="padding: 3px; border: 1px solid #000; text-align: center; ${backgroundColor}">
        ${status}
      </td>`;
    }
    
    tableHTML += `</tr>`;
  });
  
  tableHTML += `</tbody></table>`;
  
  // Create more compact legend
  tableHTML += `
    <div style="margin-top: 10px; font-size: 10px; display: flex; justify-content: space-between;">
      <div style="flex: 1;">
        <p style="margin: 2px 0;"><strong>Legend:</strong></p>
        <p style="margin: 2px 0;"><span style="display: inline-block; width: 12px; height: 12px; background-color: #E0F7FA; border: 1px solid #000;"></span> S - Sleeping</p>
        <p style="margin: 2px 0;"><span style="display: inline-block; width: 12px; height: 12px; background-color: #FFF9C4; border: 1px solid #000;"></span> A - Awake</p>
      </div>
      <div style="flex: 1;">
        <p style="margin: 2px 0;">&nbsp;</p>
        <p style="margin: 2px 0;"><span style="display: inline-block; width: 12px; height: 12px; background-color: #EEEEEE; border: 1px solid #000;"></span> N/A - Resident not at the Facility</p>
        <p style="margin: 2px 0;"><span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #000;"></span> Empty - No data recorded</p>
      </div>
  `;
  
  // Add summary section - more compact
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
      <div style="flex: 1; margin-top: 2px;">
        <p style="margin: 2px 0;"><strong>Monthly Summary:</strong></p>
        <p style="margin: 2px 0;"><strong>Total Sleep Hours:</strong> ${sleepCount} (${sleepPercentage}%)</p>
        <p style="margin: 2px 0;"><strong>Total Awake Hours:</strong> ${awakeCount} (${awakePercentage}%)</p>
        <p style="margin: 2px 0;"><strong>Total Not at Facility Hours:</strong> ${naCount} (${naPercentage}%)</p>
        <p style="margin: 2px 0;"><strong>Total Hours Recorded:</strong> ${totalRecorded}</p>
      </div>
    </div>
  `;
  
  try {
    // Capture the HTML content as an image and add to PDF
    const pageImage = await captureAsImage(tableHTML);
    
    // Calculate aspect ratio to maintain proportions while fitting on page
    const imgProps = pdf.getImageProperties(pageImage);
    const imgWidth = contentWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    // If content fits on one page, use it directly
    if (imgHeight <= contentHeight) {
      pdf.addImage(pageImage, "JPEG", margin, margin, imgWidth, imgHeight, null, 'FAST');
    } else {
      // If content doesn't fit, compress it to fit on one page
      pdf.addImage(pageImage, "JPEG", margin, margin, imgWidth, contentHeight, null, 'FAST');
    }
    
    // Add watermark or footer with print quality info
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Generated for print quality - " + new Date().toLocaleString(), margin, pageHeight - 10);
    
    // Save the PDF with compression options for better print quality
    pdf.save(`SleepPattern_${residentName}_${year}_${month}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("There was an error generating the PDF. Please try again.");
  }
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
  
  // Populate data with day shift (map data for a day to the next day)
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