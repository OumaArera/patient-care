import React from "react";
import { Check, X } from "lucide-react";
import moment from "moment";

const ChartCard = ({ chart }) => {

  if (!chart) return null;

  const formattedDate = moment(chart.dateTaken).subtract(1, "days").format("MMMM D, YYYY");


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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg overflow-hidden">
      <div className="max-h-[80vh] overflow-y-auto p-4">
          <div
            className="p-4 max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <div className="p-6 relative">
              <div className="text-sm mb-4 font-bold  text-gray-900">
                <p>Resident Name: {chart.patientName}</p>
                <p>Date Taken: {formattedDate}</p>
                <p>Care Giver: {chart.careGiver}</p>
              </div>

              {/* Behaviors Table */}
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Behaviors</h3>
              <div className="overflow-x-auto mb-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
