import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    // Extract details from the first entry
    const { facilityName, branchName, patientName } = charts[0];

    // Create a container div for the table (avoiding full document capture)
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#000"; // Ensure no `oklch()` colors

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
                    <th style="padding: 8px; border: 1px solid #000;">Category</th>
                    <th style="padding: 8px; border: 1px solid #000;">Log</th>
                    ${Array.from({ length: 31 }, (_, i) => `<th style="padding: 8px; border: 1px solid #000;">${i + 1}</th>`).join("")}
                </tr>
            </thead>
            <tbody>`;

    // Process chart data
    const rows = charts.reduce((acc, chart) => {
        chart.behaviors.forEach((behavior) => {
            let existingRow = acc.find(row => row.behavior === behavior.behavior);
            if (!existingRow) {
                existingRow = {
                    category: behavior.category,
                    behavior: behavior.behavior,
                    days: Array(31).fill(""),
                    rowspan: 1
                };
                acc.push(existingRow);
            } else {
                existingRow.rowspan++;
            }
            existingRow.days[new Date(chart.dateTaken).getDate() - 1] = behavior.status === "Yes" ? "✔️" : "❌";
        });
        return acc;
    }, []);

    // Add rows to the table
    rows.forEach((row, index, arr) => {
        tableHTML += `<tr>`;
        if (index === 0 || arr[index - 1].category !== row.category) {
            const rowspan = arr.filter(r => r.category === row.category).length;
            tableHTML += `<td style="padding: 8px; border: 1px solid #000; text-align: center;" rowspan="${rowspan}">${row.category}</td>`;
        }
        tableHTML += `<td style="padding: 8px; border: 1px solid #000; text-align: left;">${row.behavior}</td>`;
        row.days.forEach((status) => {
            tableHTML += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${status}</td>`;
        });
        tableHTML += `</tr>`;
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
    pdf.save(`Behavior_Log_${selectedYear}_${selectedMonth}.pdf`);
};
