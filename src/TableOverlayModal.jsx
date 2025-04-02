import React from 'react';

const TableOverlayModal = ({ isOpen, onClose, details, groceryInfo }) => {
    if (!isOpen || !groceryInfo) return null;

    // Group items by their categories
    const groupItemsByCategory = (items) => {
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

    const categorizedItems = groupItemsByCategory(details);
    const categoryNames = Object.keys(categorizedItems);
    const midpoint = Math.ceil(categoryNames.length / 2);
    const leftColumnCategories = categoryNames.slice(0, midpoint);
    const rightColumnCategories = categoryNames.slice(midpoint);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-screen overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white uppercase">{groceryInfo.branch} ADULT FAMILY HOME</h2>
                        <p className="text-gray-300 text-sm mb-2">
                            {groceryInfo.address || "1507 128th ST SW EVERETT WA, 98204"}
                        </p>
                        <div className="text-lg font-bold text-white mb-4 uppercase">
                            REQUISITION FOR FOOD, CLEANING MATERIALS, DETERGENTS ETC
                        </div>
                        <div className="text-left text-gray-300">
                            <div><strong>DATE:</strong> {new Date(groceryInfo.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}</div>
                            <div><strong>REQUESTED BY:</strong> {groceryInfo.staffName || ""}</div>
                        </div>
                    </div>

                    {/* Two-column table layout */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Left Column */}
                        <div className="w-full md:w-1/2">
                            <div className="bg-gray-900 rounded overflow-hidden">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {leftColumnCategories.map(category => (
                                            <React.Fragment key={category}>
                                                <tr className="bg-blue-900">
                                                    <th colSpan="3" className="text-left p-2 font-bold">{category}</th>
                                                </tr>
                                                <tr className="bg-gray-700">
                                                    <th className="w-3/5 text-left p-2 border-t border-gray-600">Item</th>
                                                    <th className="w-1/5 text-center p-2 border-t border-gray-600">Qty</th>
                                                    <th className="w-1/5 text-center p-2 border-t border-gray-600">Status</th>
                                                </tr>
                                                {categorizedItems[category].map((item, idx) => (
                                                    <tr key={idx} className="border-t border-gray-700">
                                                        <td className="p-2">{item.item}</td>
                                                        <td className="p-2 text-center">{item.quantity || 1}</td>
                                                        <td className="p-2 text-center">
                                                            {item.delivered ? "Delivered" : (item.status !== "declined" ? "Approved" : "Declined")}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="w-full md:w-1/2">
                            <div className="bg-gray-900 rounded overflow-hidden">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {rightColumnCategories.map(category => (
                                            <React.Fragment key={category}>
                                                <tr className="bg-blue-900">
                                                    <th colSpan="3" className="text-left p-2 font-bold">{category}</th>
                                                </tr>
                                                <tr className="bg-gray-700">
                                                    <th className="w-3/5 text-left p-2 border-t border-gray-600">Item</th>
                                                    <th className="w-1/5 text-center p-2 border-t border-gray-600">Qty</th>
                                                    <th className="w-1/5 text-center p-2 border-t border-gray-600">Status</th>
                                                </tr>
                                                {categorizedItems[category].map((item, idx) => (
                                                    <tr key={idx} className="border-t border-gray-700">
                                                        <td className="p-2">{item.item}</td>
                                                        <td className="p-2 text-center">{item.quantity || 1}</td>
                                                        <td className="p-2 text-center">
                                                            {item.delivered ? "Delivered" : (item.status !== "declined" ? "Approved" : "Declined")}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Feedback/Notes section */}
                    {groceryInfo.feedback && (
                        <div className="mt-4 p-3 bg-gray-700 rounded">
                            <h3 className="font-bold text-white border-b border-gray-500 pb-1 mb-2">Notes/Feedback</h3>
                            <p className="text-gray-300">{groceryInfo.feedback}</p>
                        </div>
                    )}

                    {/* Signature section */}
                    <div className="mt-8 flex flex-col md:flex-row justify-between text-gray-300">
                        <div>
                            <div className="mb-6 border-b border-gray-500 pb-1">Requested by: ________________________</div>
                            <div className="border-b border-gray-500 pb-1">Date: _____________________</div>
                        </div>
                        <div>
                            <div className="mb-6 border-b border-gray-500 pb-1">Approved by: ________________________</div>
                            <div className="border-b border-gray-500 pb-1">Date: _____________________</div>
                        </div>
                    </div>

                    {/* Close button */}
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableOverlayModal;