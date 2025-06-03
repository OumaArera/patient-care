export const generateVitalsPDFReport = async (vitals, selectedYear, selectedMonth) => {
    if (vitals.length === 0) return;

    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

    const pdfMake = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;

    const { patientName } = vitals[0];
    const date = new Date().toLocaleDateString('en-US');

    const tableBody = [
        [
            { text: "Date", style: 'tableHeader' },
            { text: "BP", style: 'tableHeader' },
            { text: "Temp", style: 'tableHeader' },
            { text: "Pulse", style: 'tableHeader' },
            { text: "O2 Sat", style: 'tableHeader' },
            { text: "Pain", style: 'tableHeader' },
        ]
    ];

    vitals.forEach(vital => {
        const formattedDate = new Date(vital.dateTaken).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit'
        });

        tableBody.push([
            { text: formattedDate, style: 'tableCell' },
            { text: vital.bloodPressure, style: 'tableCellBold' },
            { text: `${vital.temperature}°`, style: 'tableCell' },
            { text: vital.pulse, style: 'tableCell' },
            { text: `${vital.oxygenSaturation}%`, style: 'tableCell' },
            { text: vital.pain, style: 'tableCell' },
        ]);
    });

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: [
            { text: 'VITAL SIGNS REPORT', style: 'header' },
            { text: `Resident: ${patientName}`, style: 'subheader' },
            { text: `${selectedMonth} ${selectedYear}`, style: 'smallheader' },
            { text: '\n' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*', '*', '*', '*'],
                    body: tableBody
                },
                layout: {
                    fillColor: (rowIndex) => (rowIndex % 2 === 0 ? '#FFFFFF' : '#F8F8F8'),
                    hLineWidth: () => 0.8,
                    vLineWidth: () => 0.8,
                    hLineColor: '#000000',
                    vLineColor: '#000000',
                }
            },
            { text: `\nGenerated: ${date} | Records: ${vitals.length}`, style: 'footer' }
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
            tableHeader: {
                bold: true,
                fontSize: 11,
                color: 'black',
                fillColor: '#f0f0f0',
                alignment: 'center'
            },
            tableCell: {
                fontSize: 10,
                alignment: 'center'
            },
            tableCellBold: {
                fontSize: 10,
                bold: true,
                alignment: 'center'
            },
            footer: {
                fontSize: 9,
                alignment: 'center',
                color: '#666'
            }
        },
        defaultStyle: {
            font: 'Helvetica' // Built-in font (no need to declare in vfs)
        },
        info: {
            title: `Vitals Report - ${patientName}`,
            author: "Care Facility",
            subject: `Monthly Vitals for ${selectedMonth} ${selectedYear}`,
            keywords: `vitals, medical report, ${patientName}, ${selectedMonth}, ${selectedYear}`,
            creator: "Vitals Management System"
        }
    };

    pdfMake.createPdf(docDefinition).download(`Vitals_${patientName}_${selectedYear}_${selectedMonth}.pdf`);
};
