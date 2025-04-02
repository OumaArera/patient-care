import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";


export const generateGroceryPDF = async (grocery) => {
    if (!grocery) return;

    // Create a container for the HTML structure
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#000";

    let tableHTML = `
        <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
            Grocery Request - ${grocery.branch}
        </div>
        <div style="font-size: 14px; margin-bottom: 15px;">
            <strong>Date:</strong> ${new Date(grocery.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} &nbsp;&nbsp;&nbsp;
            <strong>Requested by:</strong> ${grocery.staffName} &nbsp;&nbsp;&nbsp;
            <strong>Status:</strong> ${grocery.status}
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <thead>
                <tr style="background: #f0f0f0; text-align: center; font-size: 12px; font-weight: bold;">
                    <th style="padding: 8px; border: 1px solid #000;">Item</th>
                    <th style="padding: 8px; border: 1px solid #000;">Quantity</th>
                    <th style="padding: 8px; border: 1px solid #000;">Category</th>
                </tr>
            </thead>
            <tbody>`;

    // Process grocery items data
    grocery.details.forEach((item) => {
        tableHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #000;">${item.item}</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border: 1px solid #000;">${item.category}</td>
            </tr>`;
    });

    tableHTML += `</tbody></table>`;

    // Add feedback if available
    if (grocery.feedback) {
        tableHTML += `
            <div style="font-size: 14px; margin-top: 20px;">
                <strong>Feedback:</strong> ${grocery.feedback}
            </div>`;
    }

    // Sign-off section
    tableHTML += `
        <div style="font-size: 14px; margin-top: 20px;">
            <p>Requested by: ${grocery.staffName} ..........................   Sign: ........................</p>
            <p>Approved by: ..........................   Sign: ........................</p>
        </div>`;

    // Append the generated HTML to the container
    container.innerHTML = tableHTML;

    // Append container to body (temporarily)
    document.body.appendChild(container);

    // Capture only the table container using `html2canvas`
    const canvas = await html2canvas(container, { scale: 2 });

    // Remove container after capturing
    document.body.removeChild(container);

    // Convert canvas to PDF
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`Grocery_Request_${grocery.branch}_${new Date(grocery.createdAt).toLocaleDateString("en-US")}.pdf`);
};