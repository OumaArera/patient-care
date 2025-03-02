import React, { useState } from "react";

const ResubmitVitals = ({ patient }) => {
    const [formData, setFormData] = useState({
        bloodPressure: "",
        temperature: "",
        pulse: "",
        oxygenSaturation: "",
        pain: "",
        dateTaken: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent negative values for number inputs
        if (["temperature", "pulse", "oxygenSaturation"].includes(name) && Number(value) < 1) {
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(""); // Clear any previous errors
    };

    const validateBloodPressure = (bp) => {
        const bpRegex = /^\d+\/\d+$/; // Ensure format is "number/number"
        return bpRegex.test(bp);
    };

    const handleSubmit = () => {
        const { bloodPressure, temperature, pulse, oxygenSaturation, dateTaken } = formData;

        if (!bloodPressure || !temperature || !pulse || !oxygenSaturation || !dateTaken) {
            setError("All fields except pain are required.");
            return;
        }

        if (!validateBloodPressure(bloodPressure)) {
            setError("Invalid blood pressure format. Use 'number/number' e.g., 120/80.");
            return;
        }

        console.log({ ...formData, patient });
    };

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Resubmit Vitals</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <label className="block mb-2">Date:</label>
            <input
                type="date"
                name="dateTaken"
                value={formData.dateTaken}
                onChange={handleChange}
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />

            <label className="block mb-2">Blood Pressure:</label>
            <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                placeholder="Enter blood pressure e.g 120/80"
                onChange={handleChange}
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />

            <label className="block mb-2">Temperature:</label>
            <input
                type="number"
                name="temperature"
                value={formData.temperature}
                placeholder="Enter Temperature e.g 98"
                onChange={handleChange}
                min="1"
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />

            <label className="block mb-2">Pulse:</label>
            <input
                type="number"
                name="pulse"
                value={formData.pulse}
                onChange={handleChange}
                placeholder="Enter pulse reading e.g 72"
                min="1"
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />

            <label className="block mb-2">Oxygen Saturation:</label>
            <input
                type="number"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                placeholder="Enter Oxygen saturation reading e.g 99"
                onChange={handleChange}
                min="1"
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />

            <label className="block mb-2">Pain (Optional):</label>
            <textarea
                name="pain"
                value={formData.pain}
                onChange={handleChange}
                placeholder="Enter Pain description, or leave blank"
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
            ></textarea>

            <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
                Submit
            </button>
        </div>
    );
};

export default ResubmitVitals;
