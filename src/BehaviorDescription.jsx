import { useState } from "react";

const BehaviorDescriptions = ({ behaviorDescription, handleChangeBehaviorDescription }) => {
  const [editedData, setEditedData] = useState({});

  return (
    <div className="bg-gray-900 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold text-blue-400 mb-3">Behavior Descriptions</h3>
      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-3 border border-gray-700">Date</th>
            <th className="p-3 border border-gray-700">Behavior Description</th>
            <th className="p-3 border border-gray-700">Triggers</th>
            <th className="p-3 border border-gray-700">Caregiver Intervention</th>
            <th className="p-3 border border-gray-700">Reported to Provider & Care Team</th>
            <th className="p-3 border border-gray-700">Outcome</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border border-gray-700">
            <td className="p-3 border border-gray-700">
              <input
                type="datetime-local"
                className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                value={editedData.date || behaviorDescription[0]?.date || ""}
                onChange={(e) => handleChangeBehaviorDescription(0, "date", e.target.value)}
              />
            </td>
            {["behavior", "trigger", "caregiverIntervention", "reportedToProvider", "outcome"].map((field) => (
              <td key={field} className="p-3 border border-gray-700">
                <input
                  type="text"
                  placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
                  className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                  value={editedData[field] || behaviorDescription[0]?.[field] || ""}
                  onChange={(e) => handleChangeBehaviorDescription(0, field, e.target.value)}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BehaviorDescriptions;
