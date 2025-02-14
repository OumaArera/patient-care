import { useState } from "react";

const BehaviorDescriptions = ({ behaviorDescription, handleChangeBehaviorDescription }) => {
  const [editedData, setEditedData] = useState({});
  const [behaviorsDescription, setBehaviorsDescription] = useState(behaviorDescription);

  return (
    <div className="bg-gray-900 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold text-blue-400 mb-3">Behavior Descriptions</h3>
      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800 text-white">
            {behaviorsDescription.map((behavior, index) => (
              <th key={index} className="p-3 border border-gray-700">
                {behavior.descriptionType.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border border-gray-700">
            {behaviorsDescription.map((behavior, index) => (
              <td key={index} className="p-3 border border-gray-700">
                <input
                  type={behavior.descriptionType === "Date" ? "datetime-local" : "text"}
                  placeholder={`Enter ${behavior.descriptionType.replace(/_/g, " ")}`}
                  className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                  value={behavior.response}
                  onChange={(e) => handleChangeBehaviorDescription(index, e.target.value)}
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
