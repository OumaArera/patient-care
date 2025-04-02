import React from "react";

const TableOverlayModal = ({ isOpen, onClose, details, groceryInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">{groceryInfo?.branch} Grocery List</h3>
            <p className="text-gray-400 text-sm">
              {groceryInfo?.createdAt && new Date(groceryInfo.createdAt).toLocaleDateString("en-US")}
              {groceryInfo?.staffName && ` • Requested by: ${groceryInfo.staffName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-gray-700">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Category</th>
                </tr>
              </thead>
              <tbody>
                {details.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
                    <td className="px-4 py-3">{item.item}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableOverlayModal;