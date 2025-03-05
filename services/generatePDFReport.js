import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    const { facilityName, branchName, patientName } = charts[0];
    const pdf = new jsPDF();

    const captureAsImage = async (htmlContent) => {
        const container = document.createElement("div");
        container.style.padding = "15px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        const canvas = await html2canvas(container, { scale: 1.5 });
        document.body.removeChild(container);
        
        return canvas.toDataURL("image/jpeg", 0.7);
    };

    let behaviorLogHTML = `
        <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
            ${facilityName} - ${branchName}
        </div>
        <div style="font-size: 14px; margin-bottom: 10px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 12px; font-weight: bold;">
                    <th style="padding: 6px; border: 1px solid #000;">Category</th>
                    <th style="padding: 6px; border: 1px solid #000;">Log</th>
                    ${Array.from({ length: 31 }, (_, i) => `<th style="padding: 6px; border: 1px solid #000;">${i + 1}</th>`).join("")}
                </tr>
            </thead>
            <tbody>`;

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

            const behaviorDate = new Date(chart.dateTaken);
            const utcDate = new Date(behaviorDate.getUTCFullYear(), behaviorDate.getUTCMonth(), behaviorDate.getUTCDate());
            const adjustedDay = utcDate.getDate() - 1;
            if (adjustedDay >= 0) {
                existingRow.days[adjustedDay] = behavior.status === "Yes" ? "✔️" : "";
            }
        });
        return acc;
    }, {});

    Object.entries(categoryGroups).forEach(([category, behaviors]) => {
        behaviors.forEach((row, index) => {
            behaviorLogHTML += `<tr>`;
            if (index === 0) {
                behaviorLogHTML += `
                    <td style="padding: 6px; border: 1px solid #000; text-align: center;" rowspan="${behaviors.length}">
                        ${category}
                    </td>`;
            }
            behaviorLogHTML += `<td style="padding: 6px; border: 1px solid #000; text-align: left;">${row.behavior}</td>`;
            row.days.forEach(status => {
                behaviorLogHTML += `<td style="padding: 6px; border: 1px solid #000; text-align: center;">${status}</td>`;
            });
            behaviorLogHTML += `</tr>`;
        });
    });

    behaviorLogHTML += `</tbody></table>`;

    const firstPageImage = await captureAsImage(behaviorLogHTML);
    pdf.addImage(firstPageImage, "JPEG", 10, 10, 190, 0);
    pdf.addPage();

    let behaviorDescriptionHTML = `
        <h3 style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 15px;">Behavior Description</h3>
        <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 12px; font-weight: bold;">
                    <th style="padding: 6px; border: 1px solid #000;">Date</th>
                    <th style="padding: 6px; border: 1px solid #000;">Behavior Description</th>
                    <th style="padding: 6px; border: 1px solid #000;">Trigger</th>
                    <th style="padding: 6px; border: 1px solid #000;">Care Giver Intervention</th>
                    <th style="padding: 6px; border: 1px solid #000;">Reported Provider And Careteam</th>
                    <th style="padding: 6px; border: 1px solid #000;">Outcome</th>
                </tr>
            </thead>
            <tbody>`;

    charts.forEach(chart => {
        const chartDate = new Date(chart.dateTaken);
        const utcDate = new Date(chartDate.getUTCFullYear(), chartDate.getUTCMonth(), chartDate.getUTCDate());
        const adjustedDate = new Date(utcDate);
        adjustedDate.setDate(adjustedDate.getDate() - 1);
        const formattedDate = adjustedDate.toISOString().split("T")[0];

        let rowData = {
            Behavior_Description: "",
            Trigger: "",
            Care_Giver_Intervention: "",
            Reported_Provider_And_Careteam: "",
            Outcome: ""
        };

        chart.behaviorsDescription.forEach(desc => {
            if (desc.descriptionType !== "Date") {
                rowData[desc.descriptionType] = desc.response;
            }
        });

        behaviorDescriptionHTML += `
            <tr>
                <td style="padding: 6px; border: 1px solid #000;">${formattedDate}</td>
                <td style="padding: 6px; border: 1px solid #000;">${rowData.Behavior_Description}</td>
                <td style="padding: 6px; border: 1px solid #000;">${rowData.Trigger}</td>
                <td style="padding: 6px; border: 1px solid #000;">${rowData.Care_Giver_Intervention}</td>
                <td style="padding: 6px; border: 1px solid #000;">${rowData.Reported_Provider_And_Careteam}</td>
                <td style="padding: 6px; border: 1px solid #000;">${rowData.Outcome}</td>
            </tr>`;
    });

    behaviorDescriptionHTML += `</tbody></table>`;
    const secondPageImage = await captureAsImage(behaviorDescriptionHTML);
    pdf.addImage(secondPageImage, "JPEG", 10, 10, 190, 0);
    pdf.save(`Behavior_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};
