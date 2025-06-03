import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateVitalsPDFReport = async (vitals, selectedYear, selectedMonth) => {
    if (vitals.length === 0) return;

    const { patientName } = vitals[0];
    
    // Create PDF in portrait orientation for better readability
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false // Disable compression for better quality
    });

    const captureAsImage = async (htmlContent) => {
        const container = document.createElement("div");
        container.style.padding = "15px";
        container.style.fontFamily = "'Times New Roman', serif"; // Better for printing
        container.style.color = "#000";
        container.style.width = "800px"; // Optimized for portrait
        container.style.backgroundColor = "#ffffff";
        container.style.fontSize = "16px"; // Base font size
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        // Wait for fonts to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Very high scale for crisp print quality
        const canvas = await html2canvas(container, { 
            scale: 4, // Much higher scale for crisp text
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: "#ffffff",
            width: 800,
            height: container.scrollHeight,
            dpi: 300, // High DPI for print quality
            windowWidth: 1200,
            windowHeight: 1600
        });
        document.body.removeChild(container);
        
        return canvas.toDataURL("image/png", 1.0); // Maximum quality PNG
    };

    // Calculate dynamic font sizes based on number of rows
    const rowCount = vitals.length;
    let headerFontSize, titleFontSize, cellFontSize, cellPadding;
    
    if (rowCount <= 8) {
        titleFontSize = 20;
        headerFontSize = 14;
        cellFontSize = 12;
        cellPadding = 8;
    } else if (rowCount <= 15) {
        titleFontSize = 18;
        headerFontSize = 13;
        cellFontSize = 11;
        cellPadding = 6;
    } else if (rowCount <= 25) {
        titleFontSize = 16;
        headerFontSize = 12;
        cellFontSize = 10;
        cellPadding = 4;
    } else if (rowCount <= 35) {
        titleFontSize = 14;
        headerFontSize = 11;
        cellFontSize = 9;
        cellPadding = 3;
    } else {
        titleFontSize = 12;
        headerFontSize = 10;
        cellFontSize = 8;
        cellPadding = 2;
    }

    // Generate HTML for all vitals in a single page
    let vitalsHTML = `
        <div style="text-align: center; font-size: ${titleFontSize}px; font-weight: bold; margin-bottom: 10px; line-height: 1.3; color: #000;">
            VITAL SIGNS REPORT
        </div>
        <div style="text-align: center; font-size: ${titleFontSize - 2}px; font-weight: bold; margin-bottom: 8px; line-height: 1.3; color: #000;">
            Resident: ${patientName}
        </div>
        <div style="text-align: center; font-size: ${titleFontSize - 3}px; margin-bottom: 15px; line-height: 1.3; color: #333;">
            ${selectedMonth} ${selectedYear}
        </div>
        <table style="width: 100%; border-collapse: collapse; table-layout: fixed; border: 2px solid #000;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-weight: bold;">
                    <th style="padding: ${cellPadding}px; border: 1.5px solid #000; font-size: ${headerFontSize}px; width: 15%; font-weight: bold;">Date</th>
                    <th style="padding: ${cellPadding}px; border: 1.5px solid #000; font-size: ${headerFontSize}px; width: 18%; font-weight: bold;">BP</th>
                    <th style="padding: ${cellPadding}px; border: 1.5px solid #000; font-size: ${headerFontSize}px; width: 15%; font-weight: bold;">Temp</th>
                    <th style="padding: ${cellPadding}px; border: 1.5px solid #000; font-size: ${headerFontSize}px; width: 12%; font-weight: bold;">Pulse</th>
                    <th style="padding: ${cellPadding}px; border: 1.5px solid #000; font-size: ${headerFontSize}px; width: 15%; font-weight: bold;">O2 Sat</th>
                    <th style="padding: ${cellPadding}px; border: 1.5px solid #000; font-size: ${headerFontSize}px; width: 12%; font-weight: bold;">Pain</th>
                </tr>
            </thead>
            <tbody>`;

    // Add all vitals to the table
    vitals.forEach((vital, index) => {
        // Format date properly
        const dateObj = new Date(vital.dateTaken);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit'
        });
        
        // Alternate row colors for better readability
        const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f8f8';
        
        vitalsHTML += `
            <tr style="background: ${backgroundColor};">
                <td style="padding: ${cellPadding}px; border: 1.5px solid #000; font-size: ${cellFontSize}px; text-align: center; line-height: 1.2; font-weight: normal;">${formattedDate}</td>
                <td style="padding: ${cellPadding}px; border: 1.5px solid #000; text-align: center; font-size: ${cellFontSize}px; font-weight: bold; line-height: 1.2;">${vital.bloodPressure}</td>
                <td style="padding: ${cellPadding}px; border: 1.5px solid #000; text-align: center; font-size: ${cellFontSize}px; line-height: 1.2; font-weight: normal;">${vital.temperature}°</td>
                <td style="padding: ${cellPadding}px; border: 1.5px solid #000; text-align: center; font-size: ${cellFontSize}px; line-height: 1.2; font-weight: normal;">${vital.pulse}</td>
                <td style="padding: ${cellPadding}px; border: 1.5px solid #000; text-align: center; font-size: ${cellFontSize}px; line-height: 1.2; font-weight: normal;">${vital.oxygenSaturation}%</td>
                <td style="padding: ${cellPadding}px; border: 1.5px solid #000; text-align: center; font-size: ${cellFontSize}px; line-height: 1.2; font-weight: normal;">${vital.pain}</td>
            </tr>`;
    });

    vitalsHTML += `</tbody></table>`;
    
    // Add footer with generation info
    vitalsHTML += `
        <div style="text-align: center; margin-top: 20px; font-size: ${Math.max(cellFontSize - 2, 8)}px; color: #666; font-weight: normal;">
            Generated: ${new Date().toLocaleDateString('en-US')} | Records: ${vitals.length}
        </div>`;

    const vitalsImage = await captureAsImage(vitalsHTML);
    
    // Add image to PDF with optimal sizing for portrait A4
    // A4 portrait: 210mm x 297mm, with minimal margins for maximum space
    const imgWidth = 200; // Leave 5mm margins on each side
    const imgHeight = 0; // Auto-scale height to maintain aspect ratio
    
    pdf.addImage(vitalsImage, "PNG", 5, 5, imgWidth, imgHeight, undefined, 'FAST');

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