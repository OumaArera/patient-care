import React, { useState, useEffect, useRef } from "react";
import { Check, X, XCircle } from "lucide-react";
import moment from "moment";

const ChartCard = ({ chart, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const cardRef = useRef(null);

  if (!chart) return null;

  const formattedDate = moment(chart.dateTaken).format("MMMM D, YYYY");

  const behaviorsByCategory = chart.behaviors.reduce((acc, behavior) => {
    if (!acc[behavior.category]) {
      acc[behavior.category] = [];
    }
    acc[behavior.category].push(behavior);
    return acc;
  }, {});

  const behaviorDescriptions = chart.behaviorsDescription.reduce((acc, desc) => {
    acc[desc.descriptionType.replace(/_/g, " ")] = desc.response;
    return acc;
  }, {});

  // Close the card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onClose) onClose(); // Call the onClose callback if provided
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle manual close
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-50">
      <div
        ref={cardRef}
        className="p-4 max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
      >
        <div className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <div className="text-sm mb-4 font-bold  text-gray-900">
            <p>Resident Name: {chart.patientName}</p>
            <p>Date Taken: {formattedDate}</p>
            <p>Care Giver: {chart.careGiver}</p>
          </div>

          {/* Behaviors Table */}
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Behaviors</h3>
          <div className="overflow-x-auto max-h-[400px] mb-6">
            <table className="w-full border-collapse border border-gray-300 text-gray-800">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Category</th>
                  <th className="border border-gray-300 px-4 py-2">Log</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(behaviorsByCategory).map(([category, behaviors]) =>
                  behaviors.map((behavior, index) => (
                    <tr key={behavior.behavior} className="text-left hover:bg-gray-100">
                      {index === 0 && (
                        <td
                          rowSpan={behaviors.length}
                          className="border border-gray-300 px-4 py-2 font-semibold align-middle text-gray-800"
                        >
                          {category}
                        </td>
                      )}
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">
                        {behavior.behavior}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">
                        {behavior.status === "Yes" ? (
                          <Check className="text-green-500 inline" />
                        ) : (
                          <X className="text-red-500 inline" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Behavior Description Table */}
          <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800">Behavior Description</h3>
          <div className="overflow-x-auto max-h-[400px] mb-6">
            <table className="w-full border-collapse border border-gray-300 text-gray-800">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Outcome</th>
                  <th className="border border-gray-300 px-4 py-2">Trigger</th>
                  <th className="border border-gray-300 px-4 py-2">Behavior Description</th>
                  <th className="border border-gray-300 px-4 py-2">Care Giver Intervention</th>
                  <th className="border border-gray-300 px-4 py-2">Reported Provider And Careteam</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-left hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{formattedDate}</td>
                  <td className="border border-gray-300 px-4 py-2">{behaviorDescriptions["Outcome"]}</td>
                  <td className="border border-gray-300 px-4 py-2">{behaviorDescriptions["Trigger"]}</td>
                  <td className="border border-gray-300 px-4 py-2">{behaviorDescriptions["Behavior Description"]}</td>
                  <td className="border border-gray-300 px-4 py-2">{behaviorDescriptions["Care Giver Intervention"]}</td>
                  <td className="border border-gray-300 px-4 py-2">{behaviorDescriptions["Reported Provider And Careteam"]}</td>
                </tr>
              </tbody>
            </table>
          </div>
             {/* Vitals Section */}
          <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800">Vitals</h3>
          <div className="grid grid-cols-2 gap-4">
            {chart.vitals.map((vital, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded-md">
                <p className="font-semibold text-gray-700">{vital.vitalsType}</p>
                <p className="text-gray-900">{vital.response || "Not Provided"}</p>
              </div>
            ))}
          </div>   
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
