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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const { bloodPressure, temperature, pulse, oxygenSaturation, dateTaken } = formData;

        if (!bloodPressure || !temperature || !pulse || !oxygenSaturation || !dateTaken) {
            alert("All fields except pain are required.");
            return;
        }

        if (Number(temperature) <= 0 || Number(pulse) <= 0 || Number(oxygenSaturation) <= 0) {
            alert("Temperature, Pulse, and Oxygen Saturation must be greater than zero.");
            return;
        }

        console.log({ ...formData, patient });
    };

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Resubmit Vitals</h2>
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
                onChange={handleChange}
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />
            <label className="block mb-2">Temperature:</label>
            <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />
            <label className="block mb-2">Pulse:</label>
            <input
                type="number"
                name="pulse"
                value={formData.pulse}
                onChange={handleChange}
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />
            <label className="block mb-2">Oxygen Saturation:</label>
            <input
                type="number"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded"
                required
            />
            <label className="block mb-2">Pain (Optional):</label>
            <textarea
                name="pain"
                value={formData.pain}
                onChange={handleChange}
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
