import { useState } from "react";

const VitalsComponent = ({ vitalsData, handleVitalsChange }) => {
  const [errors, setErrors] = useState({});
  const vitals = vitalsData;

  const validateVitals = () => {
    const newErrors = {};

    vitals.forEach((vital, index) => {
      const value = vital.response.trim();
      if (!value && vital.vitalsType !== "Pain") {
        newErrors[index] = "This field is required";
        return;
      }

      if (vital.vitalsType === "Blood Pressure") {
        if (!/^(\d{2,3})\/(\d{2,3})$/.test(value)) {
          newErrors[index] = "Enter blood pressure in systolic/diastolic format (e.g., 120/80)";
        } else {
          const [systolic, diastolic] = value.split("/").map(Number);
          if (systolic < 71 || systolic > 150) newErrors[index] = "Systolic pressure must be between 71 and 150";
          if (diastolic < 51 || diastolic > 90) newErrors[index] = "Diastolic pressure must be between 51 and 90";
        }
      } else if (vital.vitalsType === "Pulse") {
        const num = Number(value);
        if (num < 60 || num > 100) newErrors[index] = "Pulse must be between 60 and 100";
      } else if (vital.vitalsType === "Temperature") {
        const num = Number(value);
        if (num > 99) newErrors[index] = "Temperature cannot be greater than 99";
      } else if (vital.vitalsType === "Oxygen Saturation") {
        const num = Number(value);
        if (num < 95 || num > 100) newErrors[index] = "Oxygen saturation must be between 95 and 100";
      }
    });
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateVitals();
    setErrors(validationErrors);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold text-blue-400 mb-3">Vitals</h3>
      <form onSubmit={handleFormSubmit}>
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 border border-gray-700">Vitals Type</th>
              <th className="p-3 border border-gray-700">Response</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((vital, index) => (
              <tr key={index} className="border border-gray-700">
                <td className="p-3 border border-gray-700">{vital.vitalsType}</td>
                <td className="p-3 border border-gray-700">
                  {vital.vitalsType === "Pain" ? (
                    <textarea
                      className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                      placeholder="Describe pain level (optional)"
                      value={vital.response}
                      onChange={(e) => handleVitalsChange(index, e.target.value)}
                    />
                  ) : (
                    <input
                      type={vital.vitalsType === "Blood Pressure" ? "text" : "number"}
                      className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                      placeholder={`Enter ${vital.vitalsType}`}
                      value={vital.response}
                      onChange={(e) => handleVitalsChange(index, e.target.value)}
                    />
                  )}
                  {errors[index] && <p className="text-red-500 text-sm mt-1">{errors[index]}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default VitalsComponent;
