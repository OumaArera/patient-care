import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    const { facilityName, branchName, patientName } = charts[0];
    
    // Create PDF in landscape orientation with larger page size
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Define page dimensions
    const pageWidth = 297; // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    const captureAsImage = async (htmlContent) => {
        const container = document.createElement("div");
        container.style.padding = "15px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.style.width = "1000px"; // Fixed width for consistent rendering
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        // Increase scale for better quality
        const canvas = await html2canvas(container, { 
            scale: 2.5,
            useCORS: true,
            logging: false
        });
        document.body.removeChild(container);
        
        return canvas.toDataURL("image/png", 0.9); // Using PNG for better text quality
    };

    // Process behavior data to eliminate duplicates
    const processedBehaviors = {};
    charts.forEach(chart => {
        chart.behaviors.forEach(behavior => {
            const key = `${behavior.category}|${behavior.behavior}`;
            if (!processedBehaviors[key]) {
                processedBehaviors[key] = {
                    category: behavior.category,
                    behavior: behavior.behavior,
                    days: Array(31).fill(""),
                };
            }
            
            const behaviorDate = new Date(chart.dateTaken);
            behaviorDate.setDate(behaviorDate.getDate() - 1); // Backdating by 1 day
            const adjustedDay = behaviorDate.getDate() - 1;
            if (adjustedDay >= 0 && adjustedDay < 31) {
                processedBehaviors[key].days[adjustedDay] = behavior.status === "Yes" ? "✔️" : "";
            }
        });
    });

    // Convert processed behaviors to category groups
    const categoryGroups = Object.values(processedBehaviors).reduce((acc, behavior) => {
        if (!acc[behavior.category]) {
            acc[behavior.category] = [];
        }
        acc[behavior.category].push({
            behavior: behavior.behavior,
            days: behavior.days,
        });
        return acc;
    }, {});

    // Generate header content (facility name, patient info)
    const headerHTML = `
        <div style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 20px;">
            ${facilityName} - ${branchName}
        </div>
        <div style="font-size: 18px; margin-bottom: 15px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>`;

    // Generate behavior log in chunks to handle pagination
    const ROWS_PER_PAGE = 18; // Adjust based on testing
    let currentPage = 1;
    let rowCount = 0;
    let pageData = [];
    
    // Add header for first page
    let behaviorLogChunk = headerHTML;
    
    Object.entries(categoryGroups).forEach(([category, behaviors]) => {
        // Check if this category will fit on current page
        if (rowCount + behaviors.length > ROWS_PER_PAGE) {
            // Finish current page
            pageData.push(behaviorLogChunk);
            
            // Start new page
            behaviorLogChunk = headerHTML;
            rowCount = 0;
            currentPage++;
        }
        
        // Start behavior table or continue existing table
        if (rowCount === 0) {
            behaviorLogChunk += `
            <div style="margin-top: 10px; font-size: 16px;">
                <strong>Behavior Log</strong> (Page ${currentPage})
            </div>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f0f0f0; text-align: center; font-size: 14px; font-weight: bold;">
                        <th style="padding: 6px; border: 1px solid #000;">Category</th>
                        <th style="padding: 6px; border: 1px solid #000;">Log</th>
                        ${Array.from({ length: 31 }, (_, i) => `<th style="padding: 6px; border: 1px solid #000;">${i + 1}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>`;
        }
        
        // Add rows for this category
        behaviors.forEach((row, index) => {
            behaviorLogChunk += `<tr style="font-size: 14px;">`;
            if (index === 0) {
                behaviorLogChunk += `
                    <td style="padding: 6px; border: 1px solid #000; text-align: center; font-weight: bold;" rowspan="${behaviors.length}">
                        ${category}
                    </td>`;
            }
            behaviorLogChunk += `<td style="padding: 6px; border: 1px solid #000; text-align: left;">${row.behavior}</td>`;
            row.days.forEach(status => {
                behaviorLogChunk += `<td style="padding: 6px; border: 1px solid #000; text-align: center;">${status}</td>`;
            });
            behaviorLogChunk += `</tr>`;
        });
        
        rowCount += behaviors.length;
        
        // Close table if it's the end of the page
        if (rowCount >= ROWS_PER_PAGE) {
            behaviorLogChunk += `</tbody></table>`;
            pageData.push(behaviorLogChunk);
            behaviorLogChunk = headerHTML;
            rowCount = 0;
            currentPage++;
        }
    });
    
    // Close table for the last page if necessary
    if (rowCount > 0) {
        behaviorLogChunk += `</tbody></table>`;
        pageData.push(behaviorLogChunk);
    }
    
    // Generate each page of the behavior log
    for (let i = 0; i < pageData.length; i++) {
        if (i > 0) {
            pdf.addPage();
        }
        const pageImage = await captureAsImage(pageData[i]);
        pdf.addImage(pageImage, "PNG", margin, margin, contentWidth, 0);
    }

    // Process behavior description data
    const uniqueDescriptions = new Map();
    charts.forEach(chart => {
        const chartDate = new Date(chart.dateTaken);
        chartDate.setDate(chartDate.getDate() - 1); // Backdating by 1 day
        const formattedDate = chartDate.toISOString().split("T")[0];
        
        // Check if this date has any description data
        const hasDescriptionData = chart.behaviorsDescription.some(desc => 
            desc.descriptionType !== "Date" && desc.response && desc.response.trim() !== ""
        );
        
        if (hasDescriptionData) {
            // Use date as key to avoid duplicates for the same day
            if (!uniqueDescriptions.has(formattedDate)) {
                let rowData = {
                    date: formattedDate,
                    Behavior_Description: "",
                    Trigger: "",
                    Care_Giver_Intervention: "",
                    Reported_Provider_And_Careteam: "",
                    Outcome: ""
                };
                
                chart.behaviorsDescription.forEach(desc => {
                    if (desc.descriptionType !== "Date" && desc.response) {
                        rowData[desc.descriptionType] = desc.response;
                    }
                });
                
                uniqueDescriptions.set(formattedDate, rowData);
            }
        }
    });

    // Sort descriptions by date
    const sortedDescriptions = Array.from(uniqueDescriptions.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Add empty rows for manual entry if there are fewer than 3 rows
    while (sortedDescriptions.length < 3) {
        sortedDescriptions.push({
            date: "",
            Behavior_Description: "",
            Trigger: "",
            Care_Giver_Intervention: "",
            Reported_Provider_And_Careteam: "",
            Outcome: ""
        });
    }

    // Generate behavior description pages
    const DESCRIPTIONS_PER_PAGE = 7; // Adjust based on testing
    const descriptionPages = [];
    
    // Split descriptions into pages
    for (let i = 0; i < sortedDescriptions.length; i += DESCRIPTIONS_PER_PAGE) {
        const pageDescriptions = sortedDescriptions.slice(i, i + DESCRIPTIONS_PER_PAGE);
        let behaviorDescriptionHTML = `
            ${headerHTML}
            <h3 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 15px;">
                Behavior Description
            </h3>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f0f0f0; text-align: center; font-size: 14px; font-weight: bold;">
                        <th style="padding: 6px; border: 1px solid #000; width: 10%;">Date</th>
                        <th style="padding: 6px; border: 1px solid #000; width: 18%;">Behavior Description</th>
                        <th style="padding: 6px; border: 1px solid #000; width: 18%;">Trigger</th>
                        <th style="padding: 6px; border: 1px solid #000; width: 18%;">Care Giver Intervention</th>
                        <th style="padding: 6px; border: 1px solid #000; width: 18%;">Reported Provider And Careteam</th>
                        <th style="padding: 6px; border: 1px solid #000; width: 18%;">Outcome</th>
                    </tr>
                </thead>
                <tbody>`;

        pageDescriptions.forEach(rowData => {
            behaviorDescriptionHTML += `
                <tr style="font-size: 14px;">
                    <td style="padding: 6px; border: 1px solid #000;">${rowData.date}</td>
                    <td style="padding: 6px; border: 1px solid #000;">${rowData.Behavior_Description}</td>
                    <td style="padding: 6px; border: 1px solid #000;">${rowData.Trigger}</td>
                    <td style="padding: 6px; border: 1px solid #000;">${rowData.Care_Giver_Intervention}</td>
                    <td style="padding: 6px; border: 1px solid #000;">${rowData.Reported_Provider_And_Careteam}</td>
                    <td style="padding: 6px; border: 1px solid #000;">${rowData.Outcome}</td>
                </tr>`;
        });

        behaviorDescriptionHTML += `</tbody></table>`;
        descriptionPages.push(behaviorDescriptionHTML);
    }

    // Add behavior description pages to PDF
    for (const pageHTML of descriptionPages) {
        pdf.addPage();
        const pageImage = await captureAsImage(pageHTML);
        pdf.addImage(pageImage, "PNG", margin, margin, contentWidth, 0);
    }
    
    // Add report metadata for better searchability
    pdf.setProperties({
        title: `Behavior Report - ${patientName}`,
        subject: `Behavior Report for ${selectedMonth} ${selectedYear}`,
        author: facilityName,
        keywords: `behavior report, ${patientName}, ${selectedMonth}, ${selectedYear}`
    });
    
    pdf.save(`Behavior_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};