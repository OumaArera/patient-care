import { useState } from "react";

const ChartVitals = () => {
  const [formData, setFormData] = useState({
    bloodPressure: "",
    temperature: "",
    pulse: "",
    oxygenSaturation: "",
    pain: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateInputs = () => {
    let newErrors = {};

    // Validate Blood Pressure (Format: 120/80)
    if (!/^\d{2,3}\/\d{2,3}$/.test(formData.bloodPressure)) {
      newErrors.bloodPressure = "Enter in format 120/80";
    }

    // Validate numerical fields (must be greater than 0)
    ["temperature", "pulse", "oxygenSaturation"].forEach((field) => {
      if (!formData[field] || isNaN(formData[field]) || formData[field] <= 0) {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1")} must be a number greater than 0`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const payload = {
      bloodPressure: formData.bloodPressure,
      temperature: parseFloat(formData.temperature),
      pulse: parseInt(formData.pulse, 10),
      oxygenSaturation: parseInt(formData.oxygenSaturation, 10),
      pain: formData.pain || "N/A", 
    };

    console.log("Submitted Payload:", payload);
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Chart Vitals</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Blood Pressure */}
        <div>
          <label className="block text-gray-300">Blood Pressure (e.g. 120/80)</label>
          <input
            type="text"
            name="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="120/80"
          />
          {errors.bloodPressure && <p className="text-red-400 text-sm">{errors.bloodPressure}</p>}
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-gray-300">Temperature (°C)</label>
          <input
            type="number"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="37"
            min="1"
          />
          {errors.temperature && <p className="text-red-400 text-sm">{errors.temperature}</p>}
        </div>

        {/* Pulse */}
        <div>
          <label className="block text-gray-300">Pulse (bpm)</label>
          <input
            type="number"
            name="pulse"
            value={formData.pulse}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="75"
            min="1"
          />
          {errors.pulse && <p className="text-red-400 text-sm">{errors.pulse}</p>}
        </div>

        {/* Oxygen Saturation */}
        <div>
          <label className="block text-gray-300">Oxygen Saturation (%)</label>
          <input
            type="number"
            name="oxygenSaturation"
            value={formData.oxygenSaturation}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="98"
            min="1"
          />
          {errors.oxygenSaturation && <p className="text-red-400 text-sm">{errors.oxygenSaturation}</p>}
        </div>

        {/* Pain Level (Optional) */}
        <div>
          <label className="block text-gray-300">Pain (Optional)</label>
          <textarea
            name="pain"
            value={formData.pain}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Describe pain level..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg"
        >
          Submit Vitals
        </button>
      </form>
    </div>
  );
};

export default ChartVitals;
