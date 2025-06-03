import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateVitalsPDFReport = async (vitals, selectedYear, selectedMonth) => {
    if (vitals.length === 0) return;

    const { patientName } = vitals[0];
    
    // Create PDF in landscape orientation for better table fit
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const captureAsImage = async (htmlContent) => {
        const container = document.createElement("div");
        container.style.padding = "20px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.style.width = "1400px"; // Wider for landscape
        container.style.backgroundColor = "#ffffff";
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        // High scale for print quality while optimizing for single page
        const canvas = await html2canvas(container, { 
            scale: 2.5, // Good balance of quality and performance
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: "#ffffff",
            width: 1400,
            height: container.scrollHeight
        });
        document.body.removeChild(container);
        
        return canvas.toDataURL("image/png", 0.95); // High quality PNG
    };

    // Calculate dynamic font sizes based on number of rows
    const rowCount = vitals.length;
    let headerFontSize, titleFontSize, cellFontSize, cellPadding;
    
    if (rowCount <= 10) {
        titleFontSize = 24;
        headerFontSize = 16;
        cellFontSize = 14;
        cellPadding = 8;
    } else if (rowCount <= 20) {
        titleFontSize = 22;
        headerFontSize = 14;
        cellFontSize = 12;
        cellPadding = 6;
    } else if (rowCount <= 30) {
        titleFontSize = 20;
        headerFontSize = 12;
        cellFontSize = 10;
        cellPadding = 4;
    } else {
        titleFontSize = 18;
        headerFontSize = 11;
        cellFontSize = 9;
        cellPadding = 3;
    }

    // Generate HTML for all vitals in a single page
    let vitalsHTML = `
        <div style="text-align: center; font-size: ${titleFontSize}px; font-weight: bold; margin-bottom: 8px; line-height: 1.2;">
            VITAL SIGNS REPORT
        </div>
        <div style="text-align: center; font-size: ${titleFontSize - 2}px; font-weight: bold; margin-bottom: 8px; line-height: 1.2;">
            Resident: ${patientName}
        </div>
        <div style="text-align: center; font-size: ${titleFontSize - 4}px; margin-bottom: 12px; line-height: 1.2;">
            Year: ${selectedYear} | Month: ${selectedMonth}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
                <tr style="background: #e6f2ff; text-align: center; font-weight: bold;">
                    <th style="padding: ${cellPadding}px; border: 1px solid #000; font-size: ${headerFontSize}px; width: 12%;">Date</th>
                    <th style="padding: ${cellPadding}px; border: 1px solid #000; font-size: ${headerFontSize}px; width: 18%;">Blood Pressure</th>
                    <th style="padding: ${cellPadding}px; border: 1px solid #000; font-size: ${headerFontSize}px; width: 15%;">Temperature</th>
                    <th style="padding: ${cellPadding}px; border: 1px solid #000; font-size: ${headerFontSize}px; width: 12%;">Pulse</th>
                    <th style="padding: ${cellPadding}px; border: 1px solid #000; font-size: ${headerFontSize}px; width: 18%;">Oxygen Saturation</th>
                    <th style="padding: ${cellPadding}px; border: 1px solid #000; font-size: ${headerFontSize}px; width: 12%;">Pain</th>
                </tr>
            </thead>
            <tbody>`;

    // Add all vitals to the table
    vitals.forEach((vital, index) => {
        // Format date properly
        const dateObj = new Date(vital.dateTaken);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit' // Use 2-digit year to save space
        });
        
        // Alternate row colors for better readability
        const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
        
        vitalsHTML += `
            <tr style="background: ${backgroundColor};">
                <td style="padding: ${cellPadding}px; border: 1px solid #000; font-size: ${cellFontSize}px; text-align: center; line-height: 1.1;">${formattedDate}</td>
                <td style="padding: ${cellPadding}px; border: 1px solid #000; text-align: center; font-size: ${cellFontSize}px; font-weight: bold; line-height: 1.1;">${vital.bloodPressure}</td>
                <td style="padding: ${cellPadding}px; border: 1px solid #000; text-align: center; font-size: ${cellFontSize}px; line-height: 1.1;">${vital.temperature}°F</td>
                <td style="padding: ${cellPadding}px; border: 1px solid #000; text-align: center; font-size: ${cellFontSize}px; line-height: 1.1;">${vital.pulse}</td>
                <td style="padding: ${cellPadding}px; border: 1px solid #000; text-align: center; font-size: ${cellFontSize}px; line-height: 1.1;">${vital.oxygenSaturation}%</td>
                <td style="padding: ${cellPadding}px; border: 1px solid #000; text-align: center; font-size: ${cellFontSize}px; line-height: 1.1;">${vital.pain}</td>
            </tr>`;
    });

    vitalsHTML += `</tbody></table>`;
    
    // Add footer with generation info
    vitalsHTML += `
        <div style="text-align: center; margin-top: 15px; font-size: ${cellFontSize - 1}px; color: #666;">
            Generated on ${new Date().toLocaleDateString('en-US')} | Total Records: ${vitals.length}
        </div>`;

    const vitalsImage = await captureAsImage(vitalsHTML);
    
    // Add image to PDF with optimal sizing for landscape A4
    // A4 landscape: 297mm x 210mm, leaving margins
    pdf.addImage(vitalsImage, "PNG", 5, 5, 287, 0); // Auto-scale height

    // Add metadata to PDF
    pdf.setProperties({
        title: `Vitals Report - ${patientName}`,
        subject: `Monthly Vitals for ${selectedMonth} ${selectedYear}`,
        author: "Care Facility",
        keywords: `vitals, medical report, ${patientName}, ${selectedMonth}, ${selectedYear}`,
        creator: "Vitals Management System"
    });

    // Save with descriptive filename
    pdf.save(`Vitals_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};