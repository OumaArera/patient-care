import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateMedicationPDFReport = async (medications, selectedYear, selectedMonth) => {
    if (medications.length === 0) return;
    console.log("Medications: ", medications);

    // Extract details from the first entry
    const { facilityName, branchName, patientName } = medications[0];

    // Create a container for the HTML structure
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#000"; // Ensuring no `oklch()` colors

    let tableHTML = `
        <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
            ${facilityName} _ ${branchName}
        </div>
        <div style="font-size: 14px; margin-bottom: 15px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 12px; font-weight: bold;">
                    <th style="padding: 8px; border: 1px solid #000;">Date</th>
                    <th style="padding: 8px; border: 1px solid #000;">Time Administered</th>
                    <th style="padding: 8px; border: 1px solid #000;">Care Giver</th>
                    <th style="padding: 8px; border: 1px solid #000;">Status</th>
                </tr>
            </thead>
            <tbody>`;

    // Process medication data
    medications.forEach((entry) => {
        const date = new Date(entry.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        tableHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #000; text-align: center;">${date}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: center;">${entry.timeAdministered}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: center;">${entry.careGiverName}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: center;">${entry.status}</td>
            </tr>`;
    });

    tableHTML += `</tbody></table>`;

    // Caregiver sign-off section
    tableHTML += `
        <div style="font-size: 14px; margin-top: 20px;">
            <p>Care Giver 1: ..........................   Sign: ........................</p>
            <p>Care Giver 2: ..........................   Sign: ........................</p>
        </div>`;

    // Append the generated HTML to the container
    container.innerHTML = tableHTML;

    // Append container to body (temporarily)
    document.body.appendChild(container);

    // Capture only the table container using `html2canvas`
    const canvas = await html2canvas(container, { scale: 2 });

    // Remove container after capturing
    document.body.removeChild(container);

    // Convert canvas to PDF
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`Medication_Report_${selectedYear}_${selectedMonth}.pdf`);
};
