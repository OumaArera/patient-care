import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateGroceryPDF = async (grocery) => {
    if (!grocery) return;

    // Create a container for the HTML structure
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#000";

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

    // Create the header
    let headerHTML = `
        <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 5px; text-decoration: underline;">
            ${grocery.branch.toUpperCase()} ADULT FAMILY HOME
        </div>
        <div style="text-align: center; font-size: 14px; margin-bottom: 5px;">
            ${grocery.address || "1507 128th ST SW EVERETT WA, 98204"}
        </div>
        <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 15px; text-decoration: underline;">
            REQUISITION FOR FOOD, CLEANING MATERIALS, DETERGENTS ETC
        </div>
        <div style="font-size: 14px; margin-bottom: 15px;">
            <strong>DATE:</strong> ${new Date(grocery.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
        </div>
        <div style="font-size: 14px; margin-bottom: 15px;">
            <strong>REQUESTED BY:</strong> ${grocery.staffName || ""}
        </div>`;

    // Determine how to split categories between left and right columns
    const categoryNames = Object.keys(categorizedItems);
    const midpoint = Math.ceil(categoryNames.length / 2);
    const leftColumnCategories = categoryNames.slice(0, midpoint);
    const rightColumnCategories = categoryNames.slice(midpoint);

    // Create a two-column table layout
    let tableHTML = `
        <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
                <td style="width: 50%; vertical-align: top; padding: 0;">
                    <!-- Left Column -->
                    <table style="width: 100%; border-collapse: collapse;">`;
    
    // Add items for left column categories
    leftColumnCategories.forEach(category => {
        tableHTML += `
                        <tr>
                            <th colspan="3" style="text-align: left; padding: 5px; font-weight: bold; background-color: #f0f0f0; border-top: 1px solid #000;">${category}</th>
                        </tr>
                        <tr>
                            <th style="width: 70%; text-align: left; padding: 5px; border-top: 1px solid #ccc;">Item</th>
                            <th style="width: 15%; text-align: center; padding: 5px; border-top: 1px solid #ccc;">Qty</th>
                            <th style="width: 15%; text-align: center; padding: 5px; border-top: 1px solid #ccc;">Status</th>
                        </tr>`;
        
        categorizedItems[category].forEach(item => {
            tableHTML += `
                        <tr>
                            <td style="padding: 5px; border-top: 1px solid #ccc;">${item.item}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">${item.quantity || 1}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">
                                ${item.delivered ? "Delivered" : (item.status !== "declined" ? "Approved" : "Declined")}
                            </td>
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
                            <th colspan="3" style="text-align: left; padding: 5px; font-weight: bold; background-color: #f0f0f0; border-top: 1px solid #000;">${category}</th>
                        </tr>
                        <tr>
                            <th style="width: 70%; text-align: left; padding: 5px; border-top: 1px solid #ccc;">Item</th>
                            <th style="width: 15%; text-align: center; padding: 5px; border-top: 1px solid #ccc;">Qty</th>
                            <th style="width: 15%; text-align: center; padding: 5px; border-top: 1px solid #ccc;">Status</th>
                        </tr>`;
        
        categorizedItems[category].forEach(item => {
            tableHTML += `
                        <tr>
                            <td style="padding: 5px; border-top: 1px solid #ccc;">${item.item}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">${item.quantity || 1}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">
                                ${item.delivered ? "Delivered" : (item.status !== "declined" ? "Approved" : "Declined")}
                            </td>
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
            <div style="margin-top: 15px;">
                <div style="text-decoration: underline; font-weight: bold;">Notes/Feedback</div>
                <div style="margin-top: 5px;">${grocery.feedback}</div>
            </div>`;
    }

    // Add signature lines
    tableHTML += `
        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
            <div>
                <div style="margin-bottom: 25px;">Requested by: ________________________</div>
                <div>Date: _____________________</div>
            </div>
            <div>
                <div style="margin-bottom: 25px;">Approved by: ________________________</div>
                <div>Date: _____________________</div>
            </div>
        </div>`;

    // Append all HTML to the container
    container.innerHTML = headerHTML + tableHTML;

    // Append container to body (temporarily)
    document.body.appendChild(container);

    // Capture the container using html2canvas
    const canvas = await html2canvas(container, { scale: 2 });

    // Remove container after capturing
    document.body.removeChild(container);

    // Convert canvas to PDF
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`${grocery.branch}_Requisition_${new Date(grocery.createdAt).toLocaleDateString("en-US")}.pdf`);
};