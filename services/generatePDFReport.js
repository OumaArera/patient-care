import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    const { facilityName, branchName, patientName } = charts[0];
    
    // Create PDF in landscape orientation with larger page size
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const captureAsImage = async (htmlContent) => {
        const container = document.createElement("div");
        container.style.padding = "15px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        // Increase scale for better quality
        const canvas = await html2canvas(container, { 
            scale: 2.5,
            useCORS: true,
            logging: false
        });
        document.body.removeChild(container);
        
        return canvas.toDataURL("image/png", 0.9); // Using PNG for better text quality
    };

    // Process behavior data to eliminate duplicates
    const processedBehaviors = {};
    charts.forEach(chart => {
        chart.behaviors.forEach(behavior => {
            const key = `${behavior.category}|${behavior.behavior}`;
            if (!processedBehaviors[key]) {
                processedBehaviors[key] = {
                    category: behavior.category,
                    behavior: behavior.behavior,
                    days: Array(31).fill(""),
                };
            }
            
            const behaviorDate = new Date(chart.dateTaken);
            behaviorDate.setDate(behaviorDate.getDate() - 1); // Backdating by 1 day
            const adjustedDay = behaviorDate.getDate() - 1;
            if (adjustedDay >= 0 && adjustedDay < 31) {
                processedBehaviors[key].days[adjustedDay] = behavior.status === "Yes" ? "✔️" : "";
            }
        });
    });

    // Convert processed behaviors to category groups
    const categoryGroups = Object.values(processedBehaviors).reduce((acc, behavior) => {
        if (!acc[behavior.category]) {
            acc[behavior.category] = [];
        }
        acc[behavior.category].push({
            behavior: behavior.behavior,
            days: behavior.days,
        });
        return acc;
    }, {});

    let behaviorLogHTML = `
        <div style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 20px;">
            ${facilityName} - ${branchName}
        </div>
        <div style="font-size: 18px; margin-bottom: 15px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 14px; font-weight: bold;">
                    <th style="padding: 8px; border: 1px solid #000;">Category</th>
                    <th style="padding: 8px; border: 1px solid #000;">Log</th>
                    ${Array.from({ length: 31 }, (_, i) => `<th style="padding: 8px; border: 1px solid #000;">${i + 1}</th>`).join("")}
                </tr>
            </thead>
            <tbody>`;

    Object.entries(categoryGroups).forEach(([category, behaviors]) => {
        behaviors.forEach((row, index) => {
            behaviorLogHTML += `<tr style="font-size: 14px;">`;
            if (index === 0) {
                behaviorLogHTML += `
                    <td style="padding: 8px; border: 1px solid #000; text-align: center; font-weight: bold;" rowspan="${behaviors.length}">
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

    const firstPageImage = await captureAsImage(behaviorLogHTML);
    // In landscape mode, height and width are swapped compared to portrait
    pdf.addImage(firstPageImage, "PNG", 10, 10, 277, 0); // A4 landscape width is 297mm, leaving margins
    pdf.addPage();

    // Process behavior description data
    const uniqueDescriptions = new Map();
    charts.forEach(chart => {
        const chartDate = new Date(chart.dateTaken);
        chartDate.setDate(chartDate.getDate() - 1); // Backdating by 1 day
        const formattedDate = chartDate.toISOString().split("T")[0];
        
        // Use date as key to avoid duplicates for the same day
        if (!uniqueDescriptions.has(formattedDate)) {
            let rowData = {
                date: formattedDate,
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
            
            uniqueDescriptions.set(formattedDate, rowData);
        }
    });

    let behaviorDescriptionHTML = `
        <h3 style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 20px;">Behavior Description</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 16px; font-weight: bold;">
                    <th style="padding: 8px; border: 1px solid #000;">Date</th>
                    <th style="padding: 8px; border: 1px solid #000;">Behavior Description</th>
                    <th style="padding: 8px; border: 1px solid #000;">Trigger</th>
                    <th style="padding: 8px; border: 1px solid #000;">Care Giver Intervention</th>
                    <th style="padding: 8px; border: 1px solid #000;">Reported Provider And Careteam</th>
                    <th style="padding: 8px; border: 1px solid #000;">Outcome</th>
                </tr>
            </thead>
            <tbody>`;

    // Sort descriptions by date
    const sortedDescriptions = Array.from(uniqueDescriptions.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedDescriptions.forEach(rowData => {
        behaviorDescriptionHTML += `
            <tr style="font-size: 14px;">
                <td style="padding: 8px; border: 1px solid #000;">${rowData.date}</td>
                <td style="padding: 8px; border: 1px solid #000;">${rowData.Behavior_Description}</td>
                <td style="padding: 8px; border: 1px solid #000;">${rowData.Trigger}</td>
                <td style="padding: 8px; border: 1px solid #000;">${rowData.Care_Giver_Intervention}</td>
                <td style="padding: 8px; border: 1px solid #000;">${rowData.Reported_Provider_And_Careteam}</td>
                <td style="padding: 8px; border: 1px solid #000;">${rowData.Outcome}</td>
            </tr>`;
    });

    behaviorDescriptionHTML += `</tbody></table>`;
    const secondPageImage = await captureAsImage(behaviorDescriptionHTML);
    pdf.addImage(secondPageImage, "PNG", 10, 10, 277, 0);
    
    // Add report metadata for better searchability
    pdf.setProperties({
        title: `Behavior Report - ${patientName}`,
        subject: `Behavior Report for ${selectedMonth} ${selectedYear}`,
        author: facilityName,
        keywords: `behavior report, ${patientName}, ${selectedMonth}, ${selectedYear}`
    });
    
    pdf.save(`Behavior_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};