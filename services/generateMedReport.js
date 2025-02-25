import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateMedicationPDFReport = async (medications) => {
    if (medications.length === 0) return;

    const { facilityName, branchName, patientName, medication } = medications[0];
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
            <strong>Medication:</strong> ${medication.medicationName} (${medication.medicationCode})<br>
            <strong>Dosage:</strong> ${medication.quantity} &nbsp;&nbsp;&nbsp;
            <strong>Diagnosis:</strong> ${medication.diagnosis}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-weight: bold;">
                    <th style="padding: 6px; border: 1px solid #000;">Date</th>
                    ${Array.from({ length: 31 }, (_, i) => `<th style="padding: 6px; border: 1px solid #000;">${i + 1}</th>`).join("")}
                    <th style="padding: 6px; border: 1px solid #000;">Caregiver Initials</th>
                </tr>
            </thead>
            <tbody>`;

    // Organize data by medication
    const medicationMap = {};
    
    medications.forEach(entry => {
        if (!medicationMap[entry.medication.medicationName]) {
            medicationMap[entry.medication.medicationName] = {
                medicationDetails: entry.medication,
                days: Array(31).fill("-"),
                caregiver: entry.careGiverName
            };
        }

        const entryDate = new Date(entry.timeAdministered);
        const dayIndex = entryDate.getDate() - 1; // Zero-based index

        // Check if administered within the ±1 hour window
        const isWithinTimeWindow = entry.medication.medicationTimes.some(time => {
            const [scheduledHour, scheduledMinute] = time.split(":").map(Number);
            const adminHour = entryDate.getHours();
            const adminMinute = entryDate.getMinutes();

            const adminTimeInMinutes = adminHour * 60 + adminMinute;
            const scheduledTimeInMinutes = scheduledHour * 60 + scheduledMinute;

            return Math.abs(adminTimeInMinutes - scheduledTimeInMinutes) <= 60;
        });

        if (isWithinTimeWindow) {
            medicationMap[entry.medication.medicationName].days[dayIndex] = "✔";
        }
    });

    // Populate table
    Object.entries(medicationMap).forEach(([medicationName, data]) => {
        medicationHTML += `
            <tr>
                <td style="padding: 6px; border: 1px solid #000;">${medicationName}</td>
                ${data.days.map(status => `<td style="padding: 6px; border: 1px solid #000; text-align: center;">${status}</td>`).join("")}
                <td style="padding: 6px; border: 1px solid #000; text-align: center;">${data.caregiver}</td>
            </tr>`;
    });

    medicationHTML += `</tbody></table>`;

    const medicationImage = await captureAsImage(medicationHTML);
    pdf.addImage(medicationImage, "PNG", 10, 10, 280, 0);

    // Footer
    pdf.setFontSize(10);
    pdf.text("Signature: ________________________", 200, 200);

    pdf.save(`Medication_Record_${patientName}.pdf`);
};
