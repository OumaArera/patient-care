import React from "react";
import { Calendar, Eye, Download } from "lucide-react";

const ActionButtons = ({ 
  onViewReport, 
  onDownloadPDF, 
  hasData = false,
  onBack,
  showBackOnly = false
}) => {
  if (showBackOnly) {
    return (
      <div className="mb-6">
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Calendar size={18} className="mr-2" />
          Back to Sleep Tracking
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      <button
        onClick={onViewReport}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center"
        disabled={!hasData}
      >
        <Eye size={16} className="mr-2" />
        View Report
      </button>
      <button
        onClick={onDownloadPDF}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center"
        disabled={!hasData}
      >
        <Download size={16} className="mr-2" />
        Download PDF
      </button>
    </div>
  );
};

export default ActionButtons;