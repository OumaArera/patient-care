export const generatePDFReport = async (charts, selectedYear, selectedMonth) => {
    if (!charts || charts.length === 0) return;

    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

    const pdfMake = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.vfs;

    const { facilityName, branchName, patientName } = charts[0];
    const date = new Date().toLocaleDateString('en-US');

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
            
            // Use the actual date without backdating
            const behaviorDate = new Date(chart.dateTaken);
            const dayOfMonth = behaviorDate.getDate();
            const adjustedDay = dayOfMonth - 1; // Convert to 0-based index for array
            
            if (adjustedDay >= 0 && adjustedDay < 31) {
                // SOLUTION 1: Use simple X (most reliable)
                processedBehaviors[key].days[adjustedDay] = behavior.status === "Yes" ? "X" : "";

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

    // Create table headers for behavior log
    const behaviorTableHeaders = [
        { text: "Category", style: 'tableHeader', rowSpan: 1 },
        { text: "Log", style: 'tableHeader', rowSpan: 1 },
        ...Array.from({ length: 31 }, (_, i) => ({ 
            text: (i + 1).toString(), 
            style: 'tableHeaderSmall' 
        }))
    ];

    // Create table body for behavior log
    const behaviorTableBody = [behaviorTableHeaders];
    
    Object.entries(categoryGroups).forEach(([category, behaviors]) => {
        behaviors.forEach((behavior, index) => {
            const row = [];
            
            // Add category cell (with rowspan for first row of each category)
            if (index === 0) {
                row.push({
                    text: category,
                    style: 'tableCellBold',
                    rowSpan: behaviors.length
                });
            } else {
                row.push({}); // Empty cell for rowspan continuation
            }
            
            // Add behavior name
            row.push({
                text: behavior.behavior,
                style: 'tableCell'
            });
            
            // Add day cells with enhanced styling for checkmarks
            behavior.days.forEach(status => {
                row.push({
                    text: status,
                    style: status ? 'tableCellCheckmark' : 'tableCellCenter'
                });
            });
            
            behaviorTableBody.push(row);
        });
    });

    // Process behavior description data
    const uniqueDescriptions = new Map();
    charts.forEach(chart => {
        const chartDate = new Date(chart.dateTaken);
        const formattedDate = chartDate.toLocaleDateString('en-US');
        
        // Check if this date has any meaningful description data
        const hasData = chart.behaviorsDescription.some(desc => 
            desc.descriptionType !== "Date" && desc.response && desc.response.trim() !== ""
        );
        
        if (hasData) {
            if (!uniqueDescriptions.has(formattedDate)) {
                let rowData = {
                    date: formattedDate,
                    behaviorDescription: "",
                    trigger: "",
                    careGiverIntervention: "",
                    reportedProviderAndCareteam: "",
                    outcome: ""
                };
                
                chart.behaviorsDescription.forEach(desc => {
                    if (desc.descriptionType !== "Date" && desc.response) {
                        switch(desc.descriptionType) {
                            case "Behavior_Description":
                                rowData.behaviorDescription = desc.response;
                                break;
                            case "Trigger":
                                rowData.trigger = desc.response;
                                break;
                            case "Care_Giver_Intervention":
                                rowData.careGiverIntervention = desc.response;
                                break;
                            case "Reported_Provider_And_Careteam":
                                rowData.reportedProviderAndCareteam = desc.response;
                                break;
                            case "Outcome":
                                rowData.outcome = desc.response;
                                break;
                        }
                    }
                });
                
                uniqueDescriptions.set(formattedDate, rowData);
            }
        }
    });

    // Sort descriptions by date and create table body
    const sortedDescriptions = Array.from(uniqueDescriptions.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add empty rows for manual entry if there are fewer than 3 rows
    while (sortedDescriptions.length < 3) {
        sortedDescriptions.push({
            date: "",
            behaviorDescription: "",
            trigger: "",
            careGiverIntervention: "",
            reportedProviderAndCareteam: "",
            outcome: ""
        });
    }

    // Create behavior description table
    const descriptionTableHeaders = [
        { text: "Date", style: 'tableHeader' },
        { text: "Behavior Description", style: 'tableHeader' },
        { text: "Trigger", style: 'tableHeader' },
        { text: "Care Giver Intervention", style: 'tableHeader' },
        { text: "Reported Provider And Careteam", style: 'tableHeader' },
        { text: "Outcome", style: 'tableHeader' }
    ];

    const descriptionTableBody = [descriptionTableHeaders];
    
    sortedDescriptions.forEach(row => {
        descriptionTableBody.push([
            { text: row.date, style: 'tableCell' },
            { text: row.behaviorDescription, style: 'tableCell' },
            { text: row.trigger, style: 'tableCell' },
            { text: row.careGiverIntervention, style: 'tableCell' },
            { text: row.reportedProviderAndCareteam, style: 'tableCell' },
            { text: row.outcome, style: 'tableCell' }
        ]);
    });

    // Document definition
    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [40, 60, 40, 60],
        content: [
            // Page 1: Header and Behavior Log
            { text: 'BEHAVIOR REPORT', style: 'header' },
            { text: `${facilityName} - ${branchName}`, style: 'subheader' },
            { text: `Resident: ${patientName}`, style: 'subheader' },
            { text: `${selectedMonth} ${selectedYear}`, style: 'smallheader' },
            { text: '\n' },
            { text: 'Behavior Log', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: [
                        'auto', 'auto', 
                        ...Array(31).fill('*')
                    ],
                    body: behaviorTableBody
                },
                layout: {
                    fillColor: (rowIndex) => (rowIndex % 2 === 0 ? '#FFFFFF' : '#F8F8F8'),
                    hLineWidth: () => 0.8,
                    vLineWidth: () => 0.8,
                    hLineColor: '#000000',
                    vLineColor: '#000000',
                }
            },
            
            // Page break
            { text: '', pageBreak: 'after' },
            
            // Page 2: Behavior Description
            { text: 'BEHAVIOR DESCRIPTION', style: 'header' },
            { text: `${facilityName} - ${branchName}`, style: 'subheader' },
            { text: `Resident: ${patientName}`, style: 'subheader' },
            { text: `${selectedMonth} ${selectedYear}`, style: 'smallheader' },
            { text: '\n' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', '*', '*', '*', '*'],
                    body: descriptionTableBody
                },
                layout: {
                    fillColor: (rowIndex) => (rowIndex % 2 === 0 ? '#FFFFFF' : '#F8F8F8'),
                    hLineWidth: () => 0.8,
                    vLineWidth: () => 0.8,
                    hLineColor: '#000000',
                    vLineColor: '#000000',
                }
            },
            { text: `\nGenerated: ${date} | Records: ${charts.length}`, style: 'footer' }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 6]
            },
            subheader: {
                fontSize: 14,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 4]
            },
            smallheader: {
                fontSize: 12,
                alignment: 'center',
                margin: [0, 0, 0, 12]
            },
            sectionHeader: {
                fontSize: 14,
                bold: true,
                margin: [0, 10, 0, 5]
            },
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: 'black',
                fillColor: '#f0f0f0',
                alignment: 'center'
            },
            tableHeaderSmall: {
                bold: true,
                fontSize: 8,
                color: 'black',
                fillColor: '#f0f0f0',
                alignment: 'center'
            },
            tableCell: {
                fontSize: 9,
                alignment: 'left'
            },
            tableCellCenter: {
                fontSize: 9,
                alignment: 'center'
            },
            tableCellBold: {
                fontSize: 9,
                bold: true,
                alignment: 'center'
            },
            // New style for checkmarks
            tableCellCheckmark: {
                fontSize: 12,
                alignment: 'center',
                bold: true,
                color: '#2563eb' // Blue color for better visibility
            },
            footer: {
                fontSize: 9,
                alignment: 'center',
                color: '#666'
            }
        },
        defaultStyle: {
            // font: 'Helvetica'
        },
        info: {
            title: `Behavior Report - ${patientName}`,
            author: facilityName,
            subject: `Behavior Report for ${selectedMonth} ${selectedYear}`,
            keywords: `behavior report, ${patientName}, ${selectedMonth}, ${selectedYear}`,
            creator: "Behavior Management System"
        }
    };

    pdfMake.createPdf(docDefinition).download(`Behavior_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};