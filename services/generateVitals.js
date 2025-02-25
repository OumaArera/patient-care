import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateVitalsPDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    const { facilityName, branchName, patientName } = charts[0];
    const pdf = new jsPDF();

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

    // Generate table for Vitals Flow Sheet
    let vitalsHTML = `
        <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 15px;">
            ${facilityName} - ${branchName}
        </div>
        <div style="font-size: 16px; margin-bottom: 15px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 14px; font-weight: bold;">
                    <th style="padding: 8px; border: 1px solid #000;">Date</th>
                    ${vitalsTypes.map(type => `<th style="padding: 8px; border: 1px solid #000;">${type}</th>`).join("")}
                    <th style="padding: 8px; border: 1px solid #000;">Caregiver Initials</th>
                </tr>
            </thead>
            <tbody>`;

    charts.forEach(chart => {
        const date = new Date(chart.dateTaken).toLocaleDateString();
        const vitalsData = {};
        
        chart.vitals.forEach(vital => {
            vitalsData[vital.vitalsType] = vital.response || "-"; // Default to "-" if no response
        });

        vitalsHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #000;">${date}</td>
                ${vitalsTypes.map(type => `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${vitalsData[type] || "-"}</td>`).join("")}
                <td style="padding: 8px; border: 1px solid #000; text-align: center;">${chart.careGiver || "-"}</td>
            </tr>`;
    });

    vitalsHTML += `</tbody></table>`;

    const vitalsImage = await captureAsImage(vitalsHTML);
    pdf.addImage(vitalsImage, "PNG", 10, 10, 190, 0);
    pdf.save(`Vitals_${patientName}_${branchName}_${facilityName}_${selectedYear}_${selectedMonth}.pdf`);
};
