import { useState } from "react";

const BehaviorDescriptions = ({ behaviorDescription, handleChangeBehaviorDescription }) => {
  const [editedData, setEditedData] = useState({});
  const [behaviorsDescription, setBehaviorsDescription] = useState(behaviorDescription);

  const handleInputChange = (id, field, value) => {
    setEditedData((prev) => {
      const updatedRow = { ...prev[id], [field]: value };

      // Ensure that if a user starts inputting, they must complete the entire row
      if (Object.values(updatedRow).some((val) => val !== "")) {
        if (Object.keys(updatedRow).length < 6) return prev; // Enforce all fields
      }

      const newData = { ...prev, [id]: updatedRow };
      onUpdate(Object.values(newData)); // Pass updated data to parent (NewCharts)
      return newData;
    });
  };

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
          {behaviorsDescription.map((behavior, index) => (
            <tr key={behavior.id} className="border border-gray-700">
              <td className="p-3 border border-gray-700">
                <input
                  type="datetime-local"
                  className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                  value={editedData[behavior.id]?.date || behavior.date}
                  onChange={(e) => handleChangeBehaviorDescription(index, e.target.value)}
                />
              </td>
              {["behavior", "trigger", "caregiverIntervention", "reportedToProvider", "outcome"].map((field) => (
                <td key={field} className="p-3 border border-gray-700">
                  <input
                    type="text"
                    placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
                    className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                    value={editedData[behavior.id]?.[field] || behavior[field]}
                    onChange={(e) => handleChangeBehaviorDescription(index, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BehaviorDescriptions;
