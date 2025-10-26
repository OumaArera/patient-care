export const generateGroceryPDF = async (grocery) => {
    if (!grocery) return;

    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

    const pdfMake = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.vfs;

    const date = new Date(grocery.createdAt).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });

    // Group items by their categories
    const groupItemsByCategory = (items) => {
        const categories = {};
        items.forEach(item => {
            const category = item.category.toUpperCase();
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(item);
        });
        return categories;
    };

    const categorizedItems = groupItemsByCategory(grocery.details);
    
    // Create content array
    const content = [
        // Header
        { 
            text: `${grocery.branch.toUpperCase()} ADULT FAMILY HOME`, 
            style: 'mainHeader' 
        },
        { 
            text: grocery.address || "1507 128th ST SW EVERETT WA, 98204", 
            style: 'address' 
        },
        { 
            text: 'REQUISITION FOR FOOD, CLEANING MATERIALS, DETERGENTS ETC', 
            style: 'subHeader' 
        },
        { text: '\n' },
        
        // Date and Requested By
        {
            columns: [
                { 
                    text: `DATE: ${date}`, 
                    style: 'infoText',
                    width: '50%'
                },
                { 
                    text: `REQUESTED BY: ${grocery.staffName || ""}`, 
                    style: 'infoText',
                    width: '50%'
                }
            ]
        },
        { text: '\n' }
    ];

    // Split categories into two columns for better layout
    const categoryNames = Object.keys(categorizedItems);
    const midpoint = Math.ceil(categoryNames.length / 2);
    const leftColumnCategories = categoryNames.slice(0, midpoint);
    const rightColumnCategories = categoryNames.slice(midpoint);

    // Create left and right column content
    const createCategoryContent = (categories) => {
        const categoryContent = [];
        categories.forEach(category => {
            // Category header
            categoryContent.push({
                text: category,
                style: 'categoryHeader',
                margin: [0, 8, 0, 4]
            });

            // Create table for this category
            const tableBody = [
                [
                    { text: "Item", style: 'itemTableHeader' },
                    { text: "Qty", style: 'qtyTableHeader' }
                ]
            ];

            categorizedItems[category].forEach(item => {
                tableBody.push([
                    { text: item.item, style: 'itemCell' },
                    { text: (item.quantity || 1).toString(), style: 'qtyCell' }
                ]);
            });

            categoryContent.push({
                table: {
                    headerRows: 1,
                    widths: ['*', 60],
                    body: tableBody
                },
                layout: {
                    fillColor: (rowIndex) => (rowIndex === 0 ? '#f0f0f0' : (rowIndex % 2 === 0 ? '#FFFFFF' : '#f8f8f8')),
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: '#cccccc',
                    vLineColor: '#cccccc',
                },
                margin: [0, 0, 0, 10]
            });
        });
        return categoryContent;
    };

    // Add two-column layout for categories
    if (categoryNames.length > 0) {
        content.push({
            columns: [
                {
                    width: '48%',
                    stack: createCategoryContent(leftColumnCategories)
                },
                {
                    width: '4%',
                    text: '' // spacer
                },
                {
                    width: '48%',
                    stack: createCategoryContent(rightColumnCategories)
                }
            ]
        });
    }

    // Add feedback section if it exists
    if (grocery.feedback) {
        content.push(
            { text: '\n' },
            { 
                text: 'Notes/Feedback', 
                style: 'feedbackHeader' 
            },
            { 
                text: grocery.feedback, 
                style: 'feedbackText',
                margin: [0, 4, 0, 0]
            }
        );
    }

    // Add signature section
    content.push(
        { text: '\n\n' },
        {
            columns: [
                {
                    width: '45%',
                    stack: [
                        { 
                            text: 'Requested by: ________________________', 
                            style: 'signatureText',
                            margin: [0, 0, 0, 20]
                        },
                        { 
                            text: 'Date: _____________________', 
                            style: 'signatureText' 
                        }
                    ]
                },
                {
                    width: '10%',
                    text: '' // spacer
                },
                {
                    width: '45%',
                    stack: [
                        { 
                            text: 'Approved by: ________________________', 
                            style: 'signatureText',
                            margin: [0, 0, 0, 20]
                        },
                        { 
                            text: 'Date: _____________________', 
                            style: 'signatureText' 
                        }
                    ]
                }
            ]
        }
    );

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: content,
        styles: {
            mainHeader: {
                fontSize: 16,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 6],
                decoration: 'underline'
            },
            address: {
                fontSize: 12,
                alignment: 'center',
                margin: [0, 0, 0, 8]
            },
            subHeader: {
                fontSize: 14,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 12],
                decoration: 'underline'
            },
            infoText: {
                fontSize: 12,
                bold: true,
                margin: [0, 0, 0, 4]
            },
            categoryHeader: {
                fontSize: 14,
                bold: true,
                fillColor: '#e0e0e0',
                alignment: 'left',
                margin: [0, 8, 0, 4]
            },
            itemTableHeader: {
                bold: true,
                fontSize: 11,
                color: 'black',
                alignment: 'left'
            },
            qtyTableHeader: {
                bold: true,
                fontSize: 11,
                color: 'black',
                alignment: 'center'
            },
            itemCell: {
                fontSize: 10,
                alignment: 'left'
            },
            qtyCell: {
                fontSize: 10,
                alignment: 'center'
            },
            feedbackHeader: {
                fontSize: 12,
                bold: true,
                decoration: 'underline',
                margin: [0, 0, 0, 4]
            },
            feedbackText: {
                fontSize: 10,
                margin: [0, 4, 0, 0]
            },
            signatureText: {
                fontSize: 11,
                margin: [0, 0, 0, 0]
            }
        },
        defaultStyle: {
            // font: 'Helvetica'
        },
        info: {
            title: `Grocery Requisition - ${grocery.branch}`,
            author: "Care Facility",
            subject: `Grocery Requisition for ${date}`,
            keywords: `grocery, requisition, ${grocery.branch}, ${date}`,
            creator: "Grocery Management System"
        }
    };

    // Generate filename
    const filename = `${grocery.branch}_Requisition_${date.replace(/\//g, '-')}.pdf`;
    
    pdfMake.createPdf(docDefinition).download(filename);
};