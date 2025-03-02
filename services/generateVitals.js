import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateVitalsPDFReport = async (vitals, selectedYear, selectedMonth) => {
    if (vitals.length === 0) return;

    const { patientName } = vitals[0];
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

    let pageIndex = 1;
    let totalPages = Math.ceil(vitals.length / 20); // 20 rows per page

    for (let i = 0; i < vitals.length; i += 20) {
        const vitalsBatch = vitals.slice(i, i + 20);

        let vitalsHTML = `
            <div style="text-align: center; font-size: 16px; font-weight: bold;">
                VITAL SIGNS REPORT
            </div>
            <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                Patient: ${patientName}
            </div>
            <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #f0f0f0; text-align: center; font-weight: bold;">
                        <th style="padding: 6px; border: 1px solid #000;">Date</th>
                        <th style="padding: 6px; border: 1px solid #000;">Blood Pressure</th>
                        <th style="padding: 6px; border: 1px solid #000;">Temperature</th>
                        <th style="padding: 6px; border: 1px solid #000;">Pulse</th>
                        <th style="padding: 6px; border: 1px solid #000;">Oxygen Saturation</th>
                        <th style="padding: 6px; border: 1px solid #000;">Pain</th>
                    </tr>
                </thead>
                <tbody>`;

        vitalsBatch.forEach(vital => {
            const date = new Date(vital.dateTaken).toLocaleDateString();
            vitalsHTML += `
                <tr>
                    <td style="padding: 6px; border: 1px solid #000;">${date}</td>
                    <td style="padding: 6px; border: 1px solid #000; text-align: center;">${vital.bloodPressure}</td>
                    <td style="padding: 6px; border: 1px solid #000; text-align: center;">${vital.temperature}°F</td>
                    <td style="padding: 6px; border: 1px solid #000; text-align: center;">${vital.pulse}</td>
                    <td style="padding: 6px; border: 1px solid #000; text-align: center;">${vital.oxygenSaturation}%</td>
                    <td style="padding: 6px; border: 1px solid #000; text-align: center;">${vital.pain}</td>
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
        if (i + 20 < vitals.length) {
            pdf.addPage();
        }

        pageIndex++;
    }

    pdf.save(`Vitals_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};
