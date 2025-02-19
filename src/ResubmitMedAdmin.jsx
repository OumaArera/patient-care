import React, { useState } from "react";

const ResubmitMedAdmin = ({ patient, medication }) => {
    const [administeredTime, setAdministeredTime] = useState("");

    const handleSubmit = () => {
        const resubmissionData = {
            patient,
            medication,
            administeredTime,
        };

        console.log("Resubmission Data:", resubmissionData);
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Resubmit Medication Administration</h2>

            <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">

                <div className="mb-4">
                    <label className="block font-semibold mb-2">Date & Time Administered:</label>
                    <input
                        type="datetime-local"
                        className="w-full p-2 bg-gray-700 text-white rounded"
                        value={administeredTime}
                        onChange={(e) => setAdministeredTime(e.target.value)}
                    />
                </div>

                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default ResubmitMedAdmin;
