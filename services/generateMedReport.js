import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateMedicationPDFReport = async (medications) => {
    if (medications.length === 0) return;

    const { facilityName, branchName, patientName } = medications[0];
    const pdf = new jsPDF("l", "mm", "a4"); // Landscape format for wider tables

    const captureAsImage = async (htmlContent) => {
        const container = document.createElement("div");
        container.style.padding = "10px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        const canvas = await html2canvas(container, { scale: 2 });
        document.body.removeChild(container);
        return canvas.toDataURL("image/png");
    };

    // Generate header section
    let medicationHTML = `
        <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
            ${facilityName} - ${branchName}
        </div>
        <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px;">
            MEDICATION ADMINISTRATION RECORD
        </div>
        <div style="font-size: 14px; margin-bottom: 5px;">
            <strong>Resident Name:</strong> ${patientName} &nbsp;&nbsp;&nbsp;
            <strong>Year:</strong>..........................&nbsp;&nbsp;&nbsp;
            <strong>Month:</strong>..........................
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-weight: bold;">
                    <th rowspan="2" style="padding: 6px; border: 1px solid #000;">Medication Name</th>
                    <th rowspan="2" style="padding: 6px; border: 1px solid #000;">Scheduled Time</th>
                    ${Array.from({ length: 31 }, (_, i) => `<th style="padding: 6px; border: 1px solid #000;">${i + 1}</th>`).join("")}
                </tr>
            </thead>
            <tbody>`;

    // Organize data by medication
    const medicationMap = {};

    medications.forEach(entry => {
        const { medicationName, medicationTimes } = entry.medication;
        if (!medicationMap[medicationName]) {
            medicationMap[medicationName] = {
                medicationDetails: entry.medication,
                days: medicationTimes.map(() => Array(31).fill(""))
            };
        }

        const entryDate = new Date(entry.timeAdministered);
        const dayIndex = entryDate.getDate() - 1; // Zero-based index

        // Check if administered within the ±1 hour window
        medicationTimes.forEach((time, timeIndex) => {
            const [scheduledHour, scheduledMinute] = time.split(":").map(Number);
            const adminHour = entryDate.getHours();
            const adminMinute = entryDate.getMinutes();

            const adminTimeInMinutes = adminHour * 60 + adminMinute;
            const scheduledTimeInMinutes = scheduledHour * 60 + scheduledMinute;

            if (Math.abs(adminTimeInMinutes - scheduledTimeInMinutes) <= 60) {
                medicationMap[medicationName].days[timeIndex][dayIndex] = "✔";
            }
        });
    });

    // Populate table with medications and times
    Object.entries(medicationMap).forEach(([medicationName, data]) => {
        const numRows = data.medicationDetails.medicationTimes.length;
        medicationHTML += `
            <tr>
                <td rowspan="${numRows}" style="padding: 6px; border: 1px solid #000; text-align: center; font-weight: bold;">
                    ${medicationName}
                </td>`;

        data.medicationDetails.medicationTimes.forEach((time, index) => {
            if (index !== 0) medicationHTML += `<tr>`;
            medicationHTML += `
                <td style="padding: 6px; border: 1px solid #000; text-align: center;">${time}</td>
                ${data.days[index].map(status => `<td style="padding: 6px; border: 1px solid #000; text-align: center;">${status}</td>`).join("")}
            </tr>`;
        });
    });

    medicationHTML += `</tbody></table>`;

    const medicationImage = await captureAsImage(medicationHTML);
    pdf.addImage(medicationImage, "PNG", 10, 10, 280, 0);

    // Footer
    pdf.setFontSize(10);
    pdf.text("Signature: ________________________", 200, 200);

    pdf.save(`Medication_Record_${patientName}_.pdf`);
};
