import React from "react";
import { ChevronLeft, FileText, Download } from "lucide-react";

const ActionButtons = ({ onBack, onViewReport, onDownloadPDF, showBackOnly, hasData }) => {
  return (
    <div className="flex space-x-2 mb-4">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </button>
      )}
      
      {!showBackOnly && (
        <>
          {onViewReport && (
            <button
              onClick={onViewReport}
              disabled={!hasData}
              className={`flex items-center px-3 py-1.5 rounded-md ${
                hasData 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FileText size={16} className="mr-1" />
              View Report
            </button>
          )}
          
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              disabled={!hasData}
              className={`flex items-center px-3 py-1.5 rounded-md ${
                hasData 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Download size={16} className="mr-1" />
              Download PDF
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ActionButtons;