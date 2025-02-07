import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generatePDFReport = (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    // Extract first available facility and resident details
    const { facilityName, branchName } = charts[0];
    const { firstName, lastName } = charts[0];

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${facilityName} _ ${branchName}`, 14, 10); // Header
    doc.setFontSize(12);
    doc.text(`Year: ${selectedYear}`, 14, 20);
    doc.text(`Month: ${selectedMonth}`, 14, 30);
    doc.text(`Resident Name: ${firstName} ${lastName}`, 14, 40);

    // Table Headers
    const tableHeaders = ["Category", "Log", ...Array.from({ length: 31 }, (_, i) => i + 1)];
    const tableRows = [];

    // Process chart data
    charts.forEach(chart => {
        chart.behaviors.forEach(behavior => {
            const row = [
                behavior.category,
                behavior.behavior,
                ...Array.from({ length: 31 }, (_, i) => 
                    new Date(chart.dateTaken).getDate() - 1 === i ? (behavior.status === "Yes" ? "✔️" : "❌") : ""
                ),
            ];
            tableRows.push(row);
        });
    });

    // Add table to PDF
    doc.autoTable({
        head: [tableHeaders],
        body: tableRows,
        startY: 50,
        styles: { fontSize: 8, cellPadding: 2 },
        theme: "grid",
    });

    // Caregivers Section
    doc.text("Care Giver 1: ..........................   Sign: ........................", 14, doc.lastAutoTable.finalY + 10);
    doc.text("Care Giver 2: ..........................   Sign: ........................", 14, doc.lastAutoTable.finalY + 20);

    // Save PDF
    doc.save(`Behavior_Log_${selectedYear}_${selectedMonth}.pdf`);
};
