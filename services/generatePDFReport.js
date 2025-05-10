import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (charts.length === 0) return;

    const { facilityName, branchName, patientName } = charts[0];
    
    // Create PDF in landscape orientation with precise settings
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',  // Use points for more precise control
        format: 'a4'
    });

    // Define page dimensions in points (1 pt = 1/72 inch)
    const pageWidth = pdf.internal.pageSize.getWidth();  // ~841.89 pts for A4 landscape
    const pageHeight = pdf.internal.pageSize.getHeight(); // ~595.28 pts for A4 landscape
    const margin = 30; // margins in points
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    /**
     * Renders HTML content to an image and adds it to the PDF
     * @param {string} htmlContent - The HTML content to render
     * @param {jsPDF} pdfDoc - The PDF document to add the image to
     * @param {boolean} addPage - Whether to add a new page before rendering
     * @param {string} contentType - Type of content being rendered (for debugging)
     * @returns {Promise<void>}
     */
    const renderHTMLToPDF = async (htmlContent, pdfDoc, addPage = false, contentType = "content") => {
        if (addPage) {
            pdfDoc.addPage();
        }
        
        // Create a temporary container with optimal dimensions
        const container = document.createElement("div");
        container.style.width = `${contentWidth * 1.5}px`; // Scale for better quality
        container.style.padding = "0";
        container.style.margin = "0";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.color = "#000";
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.innerHTML = htmlContent;
        
        document.body.appendChild(container);
        
        try {
            // Render at high quality with better scaling options
            const canvas = await html2canvas(container, { 
                scale: 2.5, // Higher scale for better print quality
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: "#FFFFFF"
            });
            
            // Get image data with high quality
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            
            // Calculate scaling to fit page while maintaining aspect ratio
            const imgProps = pdfDoc.getImageProperties(imgData);
            const imgWidth = contentWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            
            // If image would be too tall for page, scale it to fit
            if (imgHeight > contentHeight) {
                // Scale to fit height
                const scaleFactor = contentHeight / imgHeight;
                pdfDoc.addImage(
                    imgData, 
                    "JPEG", 
                    margin, 
                    margin, 
                    imgWidth * scaleFactor, 
                    contentHeight,
                    undefined,
                    'FAST'
                );
            } else {
                // Use normal dimensions
                pdfDoc.addImage(
                    imgData, 
                    "JPEG", 
                    margin, 
                    margin, 
                    imgWidth, 
                    imgHeight,
                    undefined,
                    'FAST'
                );
            }
            
        } catch (error) {
            console.error(`Error rendering ${contentType} to PDF:`, error);
            // Add error message to PDF for troubleshooting
            pdfDoc.text(`Error rendering ${contentType}. Please try again.`, margin, margin + 20);
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
                processedBehaviors[key].days[adjustedDay] = behavior.status === "Yes" ? "✓" : "";
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
    
    // Count total behaviors to determine if we need multiple pages
    const totalBehaviors = Object.values(categoryGroups).reduce(
        (total, behaviors) => total + behaviors.length, 0
    );
    
    // Determine if we need small or large table formatting
    const useSmallFormatting = totalBehaviors > 15;
    
    // Generate header content
    const headerHTML = `
        <div style="text-align: center; font-size: ${useSmallFormatting ? '16px' : '18px'}; font-weight: bold; margin-bottom: 10px;">
            ${facilityName} - ${branchName}
        </div>
        <div style="font-size: ${useSmallFormatting ? '13px' : '14px'}; margin-bottom: 5px;">
            <strong>Year:</strong> ${selectedYear} &nbsp;&nbsp;
            <strong>Month:</strong> ${selectedMonth} &nbsp;&nbsp;
            <strong>Resident Name:</strong> ${patientName}
        </div>`;
    
    // Dynamically adjust font and cell sizes based on number of behaviors
    const cellPadding = useSmallFormatting ? "3px" : "5px";
    const fontSize = useSmallFormatting ? "10px" : "12px";
    const headerFontSize = useSmallFormatting ? "11px" : "12px";
    
    // If we have a lot of behaviors, split them into multiple pages intelligently
    const maxBehaviorsPerPage = useSmallFormatting ? 30 : 15;
    
    // Calculate how many behaviors we can fit on each page
    const behaviorPages = [];
    let currentPage = [];
    let currentCount = 0;
    
    // Distribute behaviors across pages
    Object.entries(categoryGroups).forEach(([category, behaviors]) => {
        // If adding this category would exceed the limit, start a new page
        // But only if we already have some content on the current page
        if (currentCount + behaviors.length > maxBehaviorsPerPage && currentCount > 0) {
            behaviorPages.push(currentPage);
            currentPage = [];
            currentCount = 0;
        }
        
        // Add category to current page
        currentPage.push({
            category: category,
            behaviors: behaviors
        });
        currentCount += behaviors.length;
    });
    
    // Add the last page if there are remaining behaviors
    if (currentPage.length > 0) {
        behaviorPages.push(currentPage);
    }
    
    // If we have a small number of behaviors, try to combine all on one page
    if (behaviorPages.length === 1 || totalBehaviors <= maxBehaviorsPerPage) {
        // Generate a single page with all behaviors
        const allCategoriesHTML = `
            ${headerHTML}
            <div style="font-size: ${useSmallFormatting ? '14px' : '16px'}; margin: 8px 0; font-weight: bold;">
                Behavior Log
            </div>
            <table border="1" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                <thead>
                    <tr style="background: #f0f0f0; text-align: center; font-size: ${headerFontSize}; font-weight: bold;">
                        <th style="width: 12%; padding: ${cellPadding}; border: 1px solid #000;">Category</th>
                        <th style="width: 18%; padding: ${cellPadding}; border: 1px solid #000;">Log</th>
                        ${Array.from({ length: 31 }, (_, i) => 
                            `<th style="width: 2.25%; padding: ${cellPadding}; border: 1px solid #000;">${i + 1}</th>`
                        ).join("")}
                    </tr>
                </thead>
                <tbody>`;
        
        // Add all categories and behaviors
        Object.entries(categoryGroups).forEach(([category, behaviors]) => {
            behaviors.forEach((behavior, index) => {
                allCategoriesHTML += `<tr style="font-size: ${fontSize};">`;
                
                if (index === 0) {
                    allCategoriesHTML += `
                        <td style="padding: ${cellPadding}; border: 1px solid #000; text-align: center; font-weight: bold;" rowspan="${behaviors.length}">
                            ${category}
                        </td>`;
                }
                
                allCategoriesHTML += `
                    <td style="padding: ${cellPadding}; border: 1px solid #000; text-align: left;">${behavior.behavior}</td>
                    ${behavior.days.map(status => 
                        `<td style="padding: ${cellPadding}; border: 1px solid #000; text-align: center;">${status}</td>`
                    ).join("")}
                </tr>`;
            });
        });
        
        allCategoriesHTML += `</tbody></table>`;
        
        // Render single page with all behaviors
        await renderHTMLToPDF(allCategoriesHTML, pdf, false, "behavior log");
    } else {
        // Generate multiple pages for behaviors
        for (let i = 0; i < behaviorPages.length; i++) {
            const pageCategories = behaviorPages[i];
            
            let pageHTML = `
                ${headerHTML}
                <div style="font-size: ${useSmallFormatting ? '14px' : '16px'}; margin: 8px 0; font-weight: bold;">
                    Behavior Log (Page ${i + 1} of ${behaviorPages.length})
                </div>
                <table border="1" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                    <thead>
                        <tr style="background: #f0f0f0; text-align: center; font-size: ${headerFontSize}; font-weight: bold;">
                            <th style="width: 12%; padding: ${cellPadding}; border: 1px solid #000;">Category</th>
                            <th style="width: 18%; padding: ${cellPadding}; border: 1px solid #000;">Log</th>
                            ${Array.from({ length: 31 }, (_, i) => 
                                `<th style="width: 2.25%; padding: ${cellPadding}; border: 1px solid #000;">${i + 1}</th>`
                            ).join("")}
                        </tr>
                    </thead>
                    <tbody>`;
            
            // Add categories for this page
            pageCategories.forEach(categoryData => {
                const behaviors = categoryData.behaviors;
                
                behaviors.forEach((behavior, index) => {
                    pageHTML += `<tr style="font-size: ${fontSize};">`;
                    
                    if (index === 0) {
                        pageHTML += `
                            <td style="padding: ${cellPadding}; border: 1px solid #000; text-align: center; font-weight: bold;" rowspan="${behaviors.length}">
                                ${categoryData.category}
                            </td>`;
                    }
                    
                    pageHTML += `
                        <td style="padding: ${cellPadding}; border: 1px solid #000; text-align: left;">${behavior.behavior}</td>
                        ${behavior.days.map(status => 
                            `<td style="padding: ${cellPadding}; border: 1px solid #000; text-align: center;">${status}</td>`
                        ).join("")}
                    </tr>`;
                });
            });
            
            pageHTML += `</tbody></table>`;
            
            // Render this page
            await renderHTMLToPDF(pageHTML, pdf, i > 0, `behavior log page ${i+1}`);
        }
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
    
    // Adjust max descriptions per page based on total number of descriptions
    // If we have <= 6 descriptions, put them all on one page
    // Otherwise, split into pages of 4-6 each
    const maxDescriptionsPerPage = sortedDescriptions.length <= 6 ? 6 : 4;
    
    // Split descriptions into pages
    for (let i = 0; i < sortedDescriptions.length; i += maxDescriptionsPerPage) {
        const pageRows = sortedDescriptions.slice(i, i + maxDescriptionsPerPage);
        const pageNumber = Math.floor(i / maxDescriptionsPerPage) + 1;
        const totalPages = Math.ceil(sortedDescriptions.length / maxDescriptionsPerPage);
        
        // Adjust cell padding based on number of rows
        const descPadding = pageRows.length > 4 ? "10px" : "15px";
        const descFontSize = pageRows.length > 4 ? "11px" : "12px";
        
        let descriptionHTML = `
            ${headerHTML}
            <div style="text-align: center; font-size: ${useSmallFormatting ? '14px' : '16px'}; font-weight: bold; margin: 8px 0;">
                Behavior Description ${totalPages > 1 ? `(Page ${pageNumber} of ${totalPages})` : ''}
            </div>
            <table border="1" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                <thead>
                    <tr style="background: #f0f0f0; text-align: center; font-size: ${headerFontSize}; font-weight: bold;">
                        <th style="width: 10%; padding: ${cellPadding}; border: 1px solid #000;">Date</th>
                        <th style="width: 18%; padding: ${cellPadding}; border: 1px solid #000;">Behavior Description</th>
                        <th style="width: 18%; padding: ${cellPadding}; border: 1px solid #000;">Trigger</th>
                        <th style="width: 18%; padding: ${cellPadding}; border: 1px solid #000;">Care Giver Intervention</th>
                        <th style="width: 18%; padding: ${cellPadding}; border: 1px solid #000;">Reported Provider And Careteam</th>
                        <th style="width: 18%; padding: ${cellPadding}; border: 1px solid #000;">Outcome</th>
                    </tr>
                </thead>
                <tbody>`;
        
        pageRows.forEach(row => {
            descriptionHTML += `
                <tr style="font-size: ${descFontSize};">
                    <td style="padding: ${descPadding}; border: 1px solid #000;">${row.date}</td>
                    <td style="padding: ${descPadding}; border: 1px solid #000;">${row.Behavior_Description}</td>
                    <td style="padding: ${descPadding}; border: 1px solid #000;">${row.Trigger}</td>
                    <td style="padding: ${descPadding}; border: 1px solid #000;">${row.Care_Giver_Intervention}</td>
                    <td style="padding: ${descPadding}; border: 1px solid #000;">${row.Reported_Provider_And_Careteam}</td>
                    <td style="padding: ${descPadding}; border: 1px solid #000;">${row.Outcome}</td>
                </tr>`;
        });
        
        descriptionHTML += `</tbody></table>`;
        
        // Add empty rows note if needed
        if (pageRows.length < maxDescriptionsPerPage) {
            descriptionHTML += `
                <div style="margin-top: 15px; font-style: italic; font-size: 11px;">
                    Note: Additional rows available for manual entries as needed.
                </div>`;
        }
        
        // Render this description page
        await renderHTMLToPDF(descriptionHTML, pdf, true, `behavior descriptions page ${pageNumber}`);
    }
    
    // Add page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 60, pageHeight - 20);
    }
    
    // Add report metadata
    pdf.setProperties({
        title: `Behavior Report - ${patientName}`,
        subject: `Behavior Report for ${selectedMonth} ${selectedYear}`,
        author: facilityName,
        keywords: `behavior report, ${patientName}, ${selectedMonth}, ${selectedYear}`
    });
    
    // Save the PDF with higher quality
    pdf.save(`Behavior_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};