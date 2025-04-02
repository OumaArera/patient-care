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
        const categories = {
            'BREAKFAST': [],
            'LUNCH': [],
            'DINNER': [],
            'SNACKS': [],
            'CLEANING AND DETERGENTS': [],
            'OTHERS': []
        };
        
        // Map each item to its appropriate category
        items.forEach(item => {
            const category = determineCategory(item.category);
            categories[category].push(item);
        });
        
        return categories;
    };
    
    // Helper function to map item category to main categories
    const determineCategory = (itemCategory) => {
        itemCategory = itemCategory.toUpperCase();
        if (itemCategory.includes('BREAKFAST') || itemCategory === 'MORNING MEAL') {
            return 'BREAKFAST';
        } else if (itemCategory.includes('LUNCH') || itemCategory === 'MIDDAY MEAL') {
            return 'LUNCH';
        } else if (itemCategory.includes('DINNER') || itemCategory === 'EVENING MEAL') {
            return 'DINNER';
        } else if (itemCategory.includes('SNACK') || itemCategory.includes('FRUIT')) {
            return 'SNACKS';
        } else if (itemCategory.includes('CLEAN') || itemCategory.includes('DETERGENT') || 
                  itemCategory.includes('SANITIZER') || itemCategory.includes('PAPER') ||
                  itemCategory.includes('TISSUE') || itemCategory.includes('SOAP')) {
            return 'CLEANING AND DETERGENTS';
        } else {
            return 'OTHERS';
        }
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
        </div>`;

    // Create a two-column table layout
    let tableHTML = `
        <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
                <td style="width: 50%; vertical-align: top; padding: 0;">
                    <!-- Left Column -->
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th colspan="2" style="text-align: left; padding: 5px; font-weight: bold; background-color: #f0f0f0;">BREAKFAST</th>
                        </tr>`;
    
    // Add breakfast items
    categorizedItems['BREAKFAST'].forEach(item => {
        tableHTML += `
                        <tr>
                            <td style="padding: 5px; border-top: 1px solid #ccc;">${item.item}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">
                                ${item.status !== "declined" ? "✓" : "✗"}
                            </td>
                        </tr>`;
    });
    
    // Add lunch items
    tableHTML += `
                        <tr>
                            <th colspan="2" style="text-align: left; padding: 5px; font-weight: bold; background-color: #f0f0f0; border-top: 1px solid #000;">LUNCH</th>
                        </tr>`;
    
    categorizedItems['LUNCH'].forEach(item => {
        tableHTML += `
                        <tr>
                            <td style="padding: 5px; border-top: 1px solid #ccc;">${item.item}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">
                                ${item.status !== "declined" ? "✓" : "✗"}
                            </td>
                        </tr>`;
    });
    
    // Add dinner items
    tableHTML += `
                        <tr>
                            <th colspan="2" style="text-align: left; padding: 5px; font-weight: bold; background-color: #f0f0f0; border-top: 1px solid #000;">DINNER</th>
                        </tr>`;
    
    categorizedItems['DINNER'].forEach(item => {
        tableHTML += `
                        <tr>
                            <td style="padding: 5px; border-top: 1px solid #ccc;">${item.item}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">
                                ${item.status !== "declined" ? "✓" : "✗"}
                            </td>
                        </tr>`;
    });

    // Close the left column and start the right column
    tableHTML += `
                    </table>
                </td>
                <td style="width: 50%; vertical-align: top; padding: 0;">
                    <!-- Right Column -->
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th colspan="2" style="text-align: left; padding: 5px; font-weight: bold; background-color: #f0f0f0;">SNACKS</th>
                        </tr>`;
    
    // Add snacks items
    categorizedItems['SNACKS'].forEach(item => {
        tableHTML += `
                        <tr>
                            <td style="padding: 5px; border-top: 1px solid #ccc;">${item.item}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">
                                ${item.status !== "declined" ? "✓" : "✗"}
                            </td>
                        </tr>`;
    });
    
    // Add cleaning items
    tableHTML += `
                        <tr>
                            <th colspan="2" style="text-align: left; padding: 5px; font-weight: bold; background-color: #f0f0f0; border-top: 1px solid #000;">CLEANING AND DETERGENTS</th>
                        </tr>`;
    
    categorizedItems['CLEANING AND DETERGENTS'].forEach(item => {
        tableHTML += `
                        <tr>
                            <td style="padding: 5px; border-top: 1px solid #ccc;">${item.item}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">
                                ${item.status !== "declined" ? "✓" : "✗"}
                            </td>
                        </tr>`;
    });
    
    // Add other items
    tableHTML += `
                        <tr>
                            <th colspan="2" style="text-align: left; padding: 5px; font-weight: bold; background-color: #f0f0f0; border-top: 1px solid #000;">OTHERS</th>
                        </tr>`;
    
    categorizedItems['OTHERS'].forEach(item => {
        tableHTML += `
                        <tr>
                            <td style="padding: 5px; border-top: 1px solid #ccc;">${item.item}</td>
                            <td style="padding: 5px; border-top: 1px solid #ccc; text-align: center;">
                                ${item.status !== "declined" ? "✓" : "✗"}
                            </td>
                        </tr>`;
    });

    // Close the right column and the main table
    tableHTML += `
                    </table>
                </td>
            </tr>
        </table>`;
    
    // Add non-requested items section if feedback exists
    if (grocery.feedback) {
        tableHTML += `
            <div style="margin-top: 15px;">
                <div style="text-decoration: underline; font-weight: bold;">Non requested items</div>
                <div style="margin-top: 5px;">${grocery.feedback}</div>
            </div>`;
    }

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