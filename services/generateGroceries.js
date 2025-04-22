import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateGroceryPDF = async (grocery) => {
    if (!grocery) return;

    // Create a container for the HTML structure
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#000";
    // Set a fixed width to ensure consistent scaling
    container.style.width = "780px";

    // Group items by their categories
    const groupItemsByCategory = (items) => {
        // Create a dynamic object to store all categories
        const categories = {};
        
        // First pass to identify all unique categories
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

    // Create the header with INCREASED font sizes
    let headerHTML = `
        <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 8px; text-decoration: underline;">
            ${grocery.branch.toUpperCase()} ADULT FAMILY HOME
        </div>
        <div style="text-align: center; font-size: 18px; margin-bottom: 8px;">
            ${grocery.address || "1507 128th ST SW EVERETT WA, 98204"}
        </div>
        <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px; text-decoration: underline;">
            REQUISITION FOR FOOD, CLEANING MATERIALS, DETERGENTS ETC
        </div>
        <div style="font-size: 18px; margin-bottom: 15px;">
            <strong>DATE:</strong> ${new Date(grocery.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
        </div>
        <div style="font-size: 18px; margin-bottom: 20px;">
            <strong>REQUESTED BY:</strong> ${grocery.staffName || ""}
        </div>`;

    // Determine how to split categories between left and right columns
    const categoryNames = Object.keys(categorizedItems);
    const midpoint = Math.ceil(categoryNames.length / 2);
    const leftColumnCategories = categoryNames.slice(0, midpoint);
    const rightColumnCategories = categoryNames.slice(midpoint);

    // Create a two-column table layout with INCREASED font sizes
    let tableHTML = `
        <table border="1" style="width: 100%; border-collapse: collapse; font-size: 16px;">
            <tr>
                <td style="width: 50%; vertical-align: top; padding: 0;">
                    <!-- Left Column -->
                    <table style="width: 100%; border-collapse: collapse;">`;
    
    // Add items for left column categories
    leftColumnCategories.forEach(category => {
        tableHTML += `
                        <tr>
                            <th colspan="3" style="text-align: left; padding: 8px; font-weight: bold; background-color: #f0f0f0; border-top: 1px solid #000; font-size: 30px;">${category}</th>
                        </tr>
                        <tr>
                            <th style="width: 70%; text-align: left; padding: 8px; border-top: 1px solid #ccc; font-size: 24px;">Item</th>
                            <th style="width: 15%; text-align: center; padding: 8px; border-top: 1px solid #ccc; font-size: 24px;">Qty</th>
                        </tr>`;
        
        categorizedItems[category].forEach(item => {
            tableHTML += `
                        <tr>
                            <td style="padding: 8px; border-top: 1px solid #ccc; font-size: 24px;">${item.item}</td>
                            <td style="padding: 8px; border-top: 1px solid #ccc; text-align: center; font-size: 24px;">${item.quantity || 1}</td>
                        </tr>`;
        });
    });

    // Close the left column and start the right column
    tableHTML += `
                    </table>
                </td>
                <td style="width: 50%; vertical-align: top; padding: 0;">
                    <!-- Right Column -->
                    <table style="width: 100%; border-collapse: collapse;">`;
    
    // Add items for right column categories
    rightColumnCategories.forEach(category => {
        tableHTML += `
                        <tr>
                            <th colspan="3" style="text-align: left; padding: 8px; font-weight: bold; background-color: #f0f0f0; border-top: 1px solid #000; font-size: 30px;">${category}</th>
                        </tr>
                        <tr>
                            <th style="width: 70%; text-align: left; padding: 8px; border-top: 1px solid #ccc; font-size: 24px;">Item</th>
                            <th style="width: 15%; text-align: center; padding: 8px; border-top: 1px solid #ccc; font-size: 24px;">Qty</th>
                        </tr>`;
        
        categorizedItems[category].forEach(item => {
            tableHTML += `
                        <tr>
                            <td style="padding: 8px; border-top: 1px solid #ccc; font-size: 24px;">${item.item}</td>
                            <td style="padding: 8px; border-top: 1px solid #ccc; text-align: center; font-size: 24px;">${item.quantity || 1}</td>
                        </tr>`;
        });
    });

    tableHTML += `
                    </table>
                </td>
            </tr>
        </table>`;
    
    // Add feedback section if it exists
    if (grocery.feedback) {
        tableHTML += `
            <div style="margin-top: 20px;">
                <div style="text-decoration: underline; font-weight: bold; font-size: 24px;">Notes/Feedback</div>
                <div style="margin-top: 8px; font-size: 16px;">${grocery.feedback}</div>
            </div>`;
    }

    // Add signature lines with larger fonts
    tableHTML += `
        <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 16px;">
            <div>
                <div style="margin-bottom: 35px;">Requested by: ________________________</div>
                <div>Date: _____________________</div>
            </div>
            <div>
                <div style="margin-bottom: 35px;">Approved by: ________________________</div>
                <div>Date: _____________________</div>
            </div>
        </div>`;

    // Append all HTML to the container
    container.innerHTML = headerHTML + tableHTML;

    // Append container to body (temporarily)
    document.body.appendChild(container);

    try {
        // Capture the container using html2canvas with higher scale for better quality
        const canvas = await html2canvas(container, { 
            scale: 3,
            logging: false,
            useCORS: true,
            letterRendering: true
        });

        // Remove container after capturing
        document.body.removeChild(container);

        // Create PDF with proper dimensions
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if content overflows
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`${grocery.branch}_Requisition_${new Date(grocery.createdAt).toLocaleDateString("en-US")}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        document.body.removeChild(container);
    }
};