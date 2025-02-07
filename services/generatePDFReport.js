import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    // Extract common details from the first entry
    const { facilityName, branchName, patientName } = charts[0];

    // Generate HTML for the PDF
    let tableHTML = `
        <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px;">
            ${facilityName} _ ${branchName}
        </div>
        <div style="font-size: 12px; margin-bottom: 10px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center;">
                    <th style="padding: 5px;">Category</th>
                    <th style="padding: 5px;">Log</th>
                    ${Array.from({ length: 31 }, (_, i) => `<th style="padding: 5px;">${i + 1}</th>`).join("")}
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
            tableHTML += `<td style="padding: 5px; text-align: center;" rowspan="${rowspan}">${row.category}</td>`;
        }
        tableHTML += `<td style="padding: 5px; text-align: center;">${row.behavior}</td>`;
        row.days.forEach((status) => {
            tableHTML += `<td style="padding: 5px; text-align: center;">${status}</td>`;
        });
        tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table>`;

    // Caregiver sign-off section
    tableHTML += `
        <div style="font-size: 12px; margin-top: 20px;">
            <p>Care Giver 1: ..........................   Sign: ........................</p>
            <p>Care Giver 2: ..........................   Sign: ........................</p>
        </div>`;

    // Convert the HTML to a PDF
    const pdf = new jsPDF();
    const canvas = await html2canvas(document.body, { scale: 2 });

    pdf.html(tableHTML, {
        callback: (doc) => {
            doc.save(`Behavior_Log_${selectedYear}_${selectedMonth}.pdf`);
        },
        x: 10,
        y: 10,
        width: 190
    });
};
