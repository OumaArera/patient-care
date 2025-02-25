import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateVitalsPDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    const { facilityName, branchName, patientName } = charts[0];
    const pdf = new jsPDF("p", "mm", "a4");

    const captureAsImage = async (htmlContent) => {
        const container = document.createElement("div");
        container.style.padding = "20px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        const canvas = await html2canvas(container, { scale: 2 });
        document.body.removeChild(container);
        return canvas.toDataURL("image/png");
    };

    // Extract unique vitals types to create table headers
    const vitalsTypes = Array.from(new Set(charts.flatMap(chart => chart.vitals.map(v => v.vitalsType))));

    let pageIndex = 1;
    let totalPages = Math.ceil(charts.length / 20); // 20 rows per page

    for (let i = 0; i < charts.length; i += 20) {
        const chartsBatch = charts.slice(i, i + 20);

        let vitalsHTML = `
            <div style="text-align: center; font-size: 16px; font-weight: bold;">
                ${facilityName} - ${branchName}
            </div>
            <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                VITAL SIGNS FLOW SHEET
            </div>
            <div style="font-size: 14px; margin-bottom: 10px;">
                <strong>Resident Name:</strong> ${patientName} &nbsp;&nbsp;&nbsp;
                <strong>M/F:</strong> ______ &nbsp;&nbsp;&nbsp;
                <strong>Notes:</strong> _______________________________
            </div>
            <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #f0f0f0; text-align: center; font-weight: bold;">
                        <th style="padding: 6px; border: 1px solid #000;">Date</th>
                        <th style="padding: 6px; border: 1px solid #000;">Weight</th>
                        ${vitalsTypes.map(type => `<th style="padding: 6px; border: 1px solid #000;">${type}</th>`).join("")}
                        <th style="padding: 6px; border: 1px solid #000;">Caregiver Initials</th>
                    </tr>
                </thead>
                <tbody>`;

        chartsBatch.forEach(chart => {
            const date = new Date(chart.dateTaken).toLocaleDateString();
            const vitalsData = {};
            
            chart.vitals.forEach(vital => {
                vitalsData[vital.vitalsType] = vital.response || "-"; // Default to "-" if no response
            });

            vitalsHTML += `
                <tr>
                    <td style="padding: 6px; border: 1px solid #000;">${date}</td>
                    <td style="padding: 6px; border: 1px solid #000; text-align: center;">______</td> <!-- Blank Weight -->
                    ${vitalsTypes.map(type => `<td style="padding: 6px; border: 1px solid #000; text-align: center;">${vitalsData[type] || "-"}</td>`).join("")}
                    <td style="padding: 6px; border: 1px solid #000; text-align: center;">${chart.careGiver || "-"}</td>
                </tr>`;
        });

        vitalsHTML += `</tbody></table>`;

        // Capture the HTML as an image
        const vitalsImage = await captureAsImage(vitalsHTML);
        pdf.addImage(vitalsImage, "PNG", 10, 10, 190, 0);

        // Add footer
        pdf.setFontSize(10);
        pdf.text(`Page ${pageIndex} of ${totalPages}`, 105, 285, { align: "center" });
        pdf.text(`Year: ${selectedYear} | Month: ${selectedMonth}`, 15, 285);

        // Add new page unless it's the last page
        if (i + 20 < charts.length) {
            pdf.addPage();
        }

        pageIndex++;
    }

    pdf.save(`Vitals_${patientName}_${branchName}_${facilityName}_${selectedYear}_${selectedMonth}.pdf`);
};
