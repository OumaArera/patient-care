import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    const { facilityName, branchName, patientName } = charts[0];

    const pdf = new jsPDF();

    // Function to capture a container as an image
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

    // First Table: Behavior Log
    let behaviorLogHTML = `
        <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 15px;">
            ${facilityName} _ ${branchName}
        </div>
        <div style="font-size: 16px; margin-bottom: 15px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 14px; font-weight: bold;">
                    <th style="padding: 8px; border: 1px solid #000;">Category</th>
                    <th style="padding: 8px; border: 1px solid #000;">Log</th>
                    ${Array.from({ length: 31 }, (_, i) => `<th style="padding: 8px; border: 1px solid #000;">${i + 1}</th>`).join("")}
                </tr>
            </thead>
            <tbody>`;

    // Group behaviors by category
    const categoryGroups = charts.reduce((acc, chart) => {
        chart.behaviors.forEach((behavior) => {
            if (!acc[behavior.category]) {
                acc[behavior.category] = [];
            }
            let existingRow = acc[behavior.category].find(row => row.behavior === behavior.behavior);
            if (!existingRow) {
                existingRow = {
                    behavior: behavior.behavior,
                    days: Array(31).fill(""),
                };
                acc[behavior.category].push(existingRow);
            }
            existingRow.days[new Date(chart.dateTaken).getDate() - 1] = behavior.status === "Yes" ? "✔️" : "";
        });
        return acc;
    }, {});

    // Generate table rows with merged category cells
    Object.entries(categoryGroups).forEach(([category, behaviors]) => {
        behaviors.forEach((row, index) => {
            behaviorLogHTML += `<tr>`;
            if (index === 0) {
                behaviorLogHTML += `
                    <td style="padding: 8px; border: 1px solid #000; text-align: center;" rowspan="${behaviors.length}">
                        ${category}
                    </td>`;
            }
            behaviorLogHTML += `<td style="padding: 8px; border: 1px solid #000; text-align: left;">${row.behavior}</td>`;
            row.days.forEach(status => {
                behaviorLogHTML += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${status}</td>`;
            });
            behaviorLogHTML += `</tr>`;
        });
    });

    behaviorLogHTML += `</tbody></table>`;

    // Capture first table
    const firstPageImage = await captureAsImage(behaviorLogHTML);
    pdf.addImage(firstPageImage, "PNG", 10, 10, 190, 0);
    pdf.addPage();

    // Second Table: Behavior Description
    let behaviorDescriptionHTML = `
        <h3 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">Behavior Description</h3>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 14px; font-weight: bold;">
                    <th style="padding: 8px; border: 1px solid #000;">Date</th>
                    <th style="padding: 8px; border: 1px solid #000;">Outcome</th>
                    <th style="padding: 8px; border: 1px solid #000;">Trigger</th>
                    <th style="padding: 8px; border: 1px solid #000;">Behavior Description</th>
                    <th style="padding: 8px; border: 1px solid #000;">Care Giver Intervention</th>
                    <th style="padding: 8px; border: 1px solid #000;">Reported Provider And Careteam</th>
                </tr>
            </thead>
            <tbody>`;

    charts.forEach(chart => {
        chart.behaviorsDescription.forEach(desc => {
            behaviorDescriptionHTML += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #000;">${new Date(chart.dateTaken).toLocaleDateString()}</td>
                    <td style="padding: 8px; border: 1px solid #000;">${desc.descriptionType === "Outcome" ? desc.response : ""}</td>
                    <td style="padding: 8px; border: 1px solid #000;">${desc.descriptionType === "Trigger" ? desc.response : ""}</td>
                    <td style="padding: 8px; border: 1px solid #000;">${desc.descriptionType === "Behavior_Description" ? desc.response : ""}</td>
                    <td style="padding: 8px; border: 1px solid #000;">${desc.descriptionType === "Care_Giver_Intervention" ? desc.response : ""}</td>
                    <td style="padding: 8px; border: 1px solid #000;">${desc.descriptionType === "Reported_Provider_And_Careteam" ? desc.response : ""}</td>
                </tr>`;
        });
    });

   // Add caregiver signatures at the bottom of the second page
    behaviorDescriptionHTML += `
    <div style="margin-top: 30px; font-size: 16px;">
        <p>Caregiver 1: ................................................... Sign: ......................</p>
        <p>Caregiver 2: ................................................... Sign: ......................</p>
    </div>
    `;

    // Capture second table with signatures
    const secondPageImage = await captureAsImage(behaviorDescriptionHTML);
    pdf.addImage(secondPageImage, "PNG", 10, 10, 190, 0);
    pdf.save(`Behavior_${patientName}${branchName}_Log${facilityName}_${selectedYear}_${selectedMonth}.pdf`);

};