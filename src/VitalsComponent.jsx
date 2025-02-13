import { useState } from "react";

const VitalsComponent = ({ vitals, handleVitalsChange, handleSubmit }) => {
  const [errors, setErrors] = useState({});

  const validateVitals = () => {
    const newErrors = {};

    vitals.forEach((vital, index) => {
      const value = vital.response.trim();

      if (vital.vitalsType === "Blood Pressure") {
        if (!/^\d{2,3}\/\d{2,3}$/.test(value)) {
          newErrors[index] = "Enter blood pressure in systolic/diastolic format (e.g., 120/80)";
        } else {
          const [systolic, diastolic] = value.split("/").map(Number);
          if (systolic > 180) newErrors[index] = "Systolic pressure is too high!";
          else if (systolic < 90) newErrors[index] = "Systolic pressure is too low!";
          if (diastolic > 120) newErrors[index] = "Diastolic pressure is too high!";
          else if (diastolic < 60) newErrors[index] = "Diastolic pressure is too low!";
        }
      } else if (vital.vitalsType === "Pulse") {
        const num = Number(value);
        if (num > 120) newErrors[index] = "Pulse rate is too high!";
        else if (num < 50) newErrors[index] = "Pulse rate is too low!";
      } else if (vital.vitalsType === "Temperature") {
        const num = Number(value);
        if (num > 39) newErrors[index] = "Temperature is too high!";
        else if (num < 35) newErrors[index] = "Temperature is too low!";
      } else if (vital.vitalsType === "Oxygen Saturation") {
        const num = Number(value);
        if (num > 100) newErrors[index] = "Oxygen saturation cannot exceed 100%!";
        else if (num < 90) newErrors[index] = "Oxygen saturation is too low!";
      }
    });

    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateVitals();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (window.confirm("Are you sure you want to submit the vitals?")) {
      handleSubmit();
    }
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
                  {errors[index] && (
                    <p className="text-red-500 text-sm mt-1">{errors[index]}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Submit Vitals
        </button>
      </form>
    </div>
  );
};

export default VitalsComponent;
