import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    const { facilityName, branchName, patientName } = charts[0];
    
    // Create PDF in landscape orientation
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Define page dimensions
    const pageWidth = 297; // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);

    /**
     * Renders HTML content to an image and adds it to the PDF
     * @param {string} htmlContent - The HTML content to render
     * @param {jsPDF} pdfDoc - The PDF document to add the image to
     * @param {boolean} addPage - Whether to add a new page before rendering
     */
    const renderHTMLToPDF = async (htmlContent, pdfDoc, addPage = false) => {
        if (addPage) {
            pdfDoc.addPage();
        }
        
        // Create a temporary container
        const container = document.createElement("div");
        container.style.width = "1000px"; // Fixed width for consistent rendering
        container.style.padding = "0";
        container.style.margin = "0";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.innerHTML = htmlContent;
        
        document.body.appendChild(container);
        
        try {
            const canvas = await html2canvas(container, { 
                scale: 2, // Balance between quality and performance
                useCORS: true,
                logging: false,
                width: 1000 // Fixed width matching container
            });
            
            const imgData = canvas.toDataURL("image/png", 0.9);
            pdfDoc.addImage(imgData, "PNG", margin, margin, contentWidth, 0); // Maintain aspect ratio
        } catch (error) {
            console.error("Error rendering HTML to PDF:", error);
        } finally {
            document.body.removeChild(container);
        }
    };

    // Process behavior data
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

    // Group behaviors by category
    const categoryGroups = {};
    Object.values(processedBehaviors).forEach(behavior => {
        if (!categoryGroups[behavior.category]) {
            categoryGroups[behavior.category] = [];
        }
        categoryGroups[behavior.category].push({
            behavior: behavior.behavior,
            days: behavior.days,
        });
    });

    // Estimate how many categories we can fit per page
    // This is a conservative estimate to ensure we don't cut tables
    const estimatedRowsPerCategory = Object.values(categoryGroups).map(behaviors => behaviors.length);
    const maxRowsPerPage = 15; // Conservative estimate based on table row height
    
    // Create the behavior log pages
    let currentPage = 0;
    let currentPageCategories = [];
    let currentPageRows = 0;
    const behaviorPages = [];
    
    // Distribute categories across pages
    Object.entries(categoryGroups).forEach(([category, behaviors]) => {
        const categoryRows = behaviors.length;
        
        // If adding this category would exceed the page limit, create a new page
        if (currentPageRows + categoryRows > maxRowsPerPage && currentPageCategories.length > 0) {
            behaviorPages.push({
                pageNumber: currentPage + 1,
                categories: currentPageCategories
            });
            currentPage++;
            currentPageCategories = [];
            currentPageRows = 0;
        }
        
        currentPageCategories.push({
            name: category,
            behaviors: behaviors
        });
        currentPageRows += categoryRows;
    });
    
    // Add the last page if there are remaining categories
    if (currentPageCategories.length > 0) {
        behaviorPages.push({
            pageNumber: currentPage + 1,
            categories: currentPageCategories
        });
    }
    
    // Generate header content
    const headerHTML = `
        <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 15px;">
            ${facilityName} - ${branchName}
        </div>
        <div style="font-size: 16px; margin-bottom: 10px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>`;
    
    // Generate and render behavior log pages
    for (let i = 0; i < behaviorPages.length; i++) {
        const page = behaviorPages[i];
        const totalPages = behaviorPages.length;
        
        let pageHTML = `
            ${headerHTML}
            <div style="font-size: 16px; margin: 10px 0;">
                <strong>Behavior Log</strong> (Page ${page.pageNumber} of ${totalPages})
            </div>
            <table border="1" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                <thead>
                    <tr style="background: #f0f0f0; text-align: center; font-size: 12px; font-weight: bold;">
                        <th style="width: 12%; padding: 5px; border: 1px solid #000;">Category</th>
                        <th style="width: 18%; padding: 5px; border: 1px solid #000;">Log</th>
                        ${Array.from({ length: 31 }, (_, i) => 
                            `<th style="width: 2.25%; padding: 5px; border: 1px solid #000;">${i + 1}</th>`
                        ).join("")}
                    </tr>
                </thead>
                <tbody>`;
        
        // Add rows for each category on this page
        page.categories.forEach(category => {
            category.behaviors.forEach((behavior, index) => {
                pageHTML += `<tr style="font-size: 12px;">`;
                
                if (index === 0) {
                    pageHTML += `
                        <td style="padding: 5px; border: 1px solid #000; text-align: center; font-weight: bold;" rowspan="${category.behaviors.length}">
                            ${category.name}
                        </td>`;
                }
                
                pageHTML += `
                    <td style="padding: 5px; border: 1px solid #000; text-align: left;">${behavior.behavior}</td>
                    ${behavior.days.map(status => 
                        `<td style="padding: 5px; border: 1px solid #000; text-align: center;">${status}</td>`
                    ).join("")}
                </tr>`;
            });
        });
        
        pageHTML += `</tbody></table>`;
        
        // Render this page
        await renderHTMLToPDF(pageHTML, pdf, i > 0);
    }
    
    // Process behavior description data
    const uniqueDescriptions = new Map();
    charts.forEach(chart => {
        const chartDate = new Date(chart.dateTaken);
        chartDate.setDate(chartDate.getDate() - 1); // Backdating by 1 day
        const formattedDate = chartDate.toISOString().split("T")[0];
        
        // Check if this date has any meaningful description data
        const hasData = chart.behaviorsDescription.some(desc => 
            desc.descriptionType !== "Date" && desc.response && desc.response.trim() !== ""
        );
        
        if (hasData) {
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
                    if (desc.descriptionType !== "Date" && desc.response) {
                        rowData[desc.descriptionType] = desc.response;
                    }
                });
                
                uniqueDescriptions.set(formattedDate, rowData);
            }
        }
    });

    // Sort descriptions by date
    const sortedDescriptions = Array.from(uniqueDescriptions.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add empty rows for manual entry if there are fewer than 3 rows
    while (sortedDescriptions.length < 3) {
        sortedDescriptions.push({
            date: "",
            Behavior_Description: "",
            Trigger: "",
            Care_Giver_Intervention: "",
            Reported_Provider_And_Careteam: "",
            Outcome: ""
        });
    }
    
    // Maximum description rows per page
    const maxDescriptionsPerPage = 6;
    
    // Split descriptions into pages
    for (let i = 0; i < sortedDescriptions.length; i += maxDescriptionsPerPage) {
        const pageRows = sortedDescriptions.slice(i, i + maxDescriptionsPerPage);
        const pageNumber = Math.floor(i / maxDescriptionsPerPage) + 1;
        const totalPages = Math.ceil(sortedDescriptions.length / maxDescriptionsPerPage);
        
        let descriptionHTML = `
            ${headerHTML}
            <div style="text-align: center; font-size: 16px; font-weight: bold; margin: 10px 0;">
                Behavior Description (Page ${pageNumber} of ${totalPages})
            </div>
            <table border="1" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                <thead>
                    <tr style="background: #f0f0f0; text-align: center; font-size: 12px; font-weight: bold;">
                        <th style="width: 10%; padding: 5px; border: 1px solid #000;">Date</th>
                        <th style="width: 18%; padding: 5px; border: 1px solid #000;">Behavior Description</th>
                        <th style="width: 18%; padding: 5px; border: 1px solid #000;">Trigger</th>
                        <th style="width: 18%; padding: 5px; border: 1px solid #000;">Care Giver Intervention</th>
                        <th style="width: 18%; padding: 5px; border: 1px solid #000;">Reported Provider And Careteam</th>
                        <th style="width: 18%; padding: 5px; border: 1px solid #000;">Outcome</th>
                    </tr>
                </thead>
                <tbody>`;
        
        pageRows.forEach(row => {
            descriptionHTML += `
                <tr style="font-size: 12px;">
                    <td style="padding: 15px; border: 1px solid #000;">${row.date}</td>
                    <td style="padding: 15px; border: 1px solid #000;">${row.Behavior_Description}</td>
                    <td style="padding: 15px; border: 1px solid #000;">${row.Trigger}</td>
                    <td style="padding: 15px; border: 1px solid #000;">${row.Care_Giver_Intervention}</td>
                    <td style="padding: 15px; border: 1px solid #000;">${row.Reported_Provider_And_Careteam}</td>
                    <td style="padding: 15px; border: 1px solid #000;">${row.Outcome}</td>
                </tr>`;
        });
        
        descriptionHTML += `</tbody></table>`;
        
        // Add empty rows to fill the page
        if (pageRows.length < maxDescriptionsPerPage) {
            descriptionHTML += `
                <div style="margin-top: 20px; font-style: italic; font-size: 12px;">
                    Note: Additional rows available for manual entries as needed.
                </div>`;
        }
        
        // Render this description page
        await renderHTMLToPDF(descriptionHTML, pdf, true);
    }
    
    // Add report metadata
    pdf.setProperties({
        title: `Behavior Report - ${patientName}`,
        subject: `Behavior Report for ${selectedMonth} ${selectedYear}`,
        author: facilityName,
        keywords: `behavior report, ${patientName}, ${selectedMonth}, ${selectedYear}`
    });
    
    pdf.save(`Behavior_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};