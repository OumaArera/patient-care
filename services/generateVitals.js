import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateVitalsPDFReport = async (vitals, selectedYear, selectedMonth) => {
    if (vitals.length === 0) return;

    const { patientName } = vitals[0];
    
    // Create PDF in landscape orientation with better settings
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const captureAsImage = async (htmlContent) => {
        const container = document.createElement("div");
        container.style.padding = "30px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.style.width = "1200px"; // Wider container for better text layout
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        // Increase scale for better quality and print clarity
        const canvas = await html2canvas(container, { 
            scale: 3, // Higher scale for sharper text
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });
        document.body.removeChild(container);
        
        return canvas.toDataURL("image/png", 1.0); // Maximum quality PNG
    };

    let pageIndex = 1;
    // Reduce items per page for better readability
    const itemsPerPage = 15;
    let totalPages = Math.ceil(vitals.length / itemsPerPage);

    for (let i = 0; i < vitals.length; i += itemsPerPage) {
        const vitalsBatch = vitals.slice(i, i + itemsPerPage);

        let vitalsHTML = `
            <div style="text-align: center; font-size: 26px; font-weight: bold; margin-bottom: 8px;">
                VITAL SIGNS REPORT
            </div>
            <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
                Resident: ${patientName}
            </div>
            <div style="text-align: center; font-size: 18px; margin-bottom: 20px;">
                Year: ${selectedYear} | Month: ${selectedMonth}
            </div>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e6f2ff; text-align: center; font-weight: bold;">
                        <th style="padding: 12px; border: 1.5px solid #000; font-size: 18px;">Date</th>
                        <th style="padding: 12px; border: 1.5px solid #000; font-size: 18px;">Blood Pressure</th>
                        <th style="padding: 12px; border: 1.5px solid #000; font-size: 18px;">Temperature</th>
                        <th style="padding: 12px; border: 1.5px solid #000; font-size: 18px;">Pulse</th>
                        <th style="padding: 12px; border: 1.5px solid #000; font-size: 18px;">Oxygen Saturation</th>
                        <th style="padding: 12px; border: 1.5px solid #000; font-size: 18px;">Pain</th>
                    </tr>
                </thead>
                <tbody>`;

        vitalsBatch.forEach(vital => {
            // Format date properly
            const dateObj = new Date(vital.dateTaken);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            
            vitalsHTML += `
                <tr>
                    <td style="padding: 10px; border: 1.5px solid #000; font-size: 16px;">${formattedDate}</td>
                    <td style="padding: 10px; border: 1.5px solid #000; text-align: center; font-size: 16px; font-weight: bold;">${vital.bloodPressure}</td>
                    <td style="padding: 10px; border: 1.5px solid #000; text-align: center; font-size: 16px;">${vital.temperature}°F</td>
                    <td style="padding: 10px; border: 1.5px solid #000; text-align: center; font-size: 16px;">${vital.pulse}</td>
                    <td style="padding: 10px; border: 1.5px solid #000; text-align: center; font-size: 16px;">${vital.oxygenSaturation}%</td>
                    <td style="padding: 10px; border: 1.5px solid #000; text-align: center; font-size: 16px;">${vital.pain}</td>
                </tr>`;
        });

        vitalsHTML += `</tbody></table>`;
        
        // Add page number footer
        vitalsHTML += `
            <div style="text-align: center; margin-top: 20px; font-size: 14px;">
                Page ${pageIndex} of ${totalPages}
            </div>`;

        const vitalsImage = await captureAsImage(vitalsHTML);
        
        // Add image with better positioning
        pdf.addImage(vitalsImage, "PNG", 10, 5, 277, 0);

        if (i + itemsPerPage < vitals.length) {
            pdf.addPage();
        }

        pageIndex++;
    }

    // Add metadata to PDF
    pdf.setProperties({
        title: `Vitals Report - ${patientName}`,
        subject: `Monthly Vitals for ${selectedMonth} ${selectedYear}`,
        author: "Care Facility",
        keywords: `vitals, medical report, ${patientName}, ${selectedMonth}, ${selectedYear}`
    });

    pdf.save(`Vitals_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};