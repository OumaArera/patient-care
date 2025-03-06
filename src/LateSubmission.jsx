import React, { useEffect, useState } from "react";
import { getCareGivers } from "../services/getCareGivers";
import { Loader } from "lucide-react";

const LateSubmission = ({ patient, type }) => {
    const [careGivers, setCareGivers] = useState([]);
    const [selectedCareGiver, setSelectedCareGiver] = useState("");
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        getCareGivers()
            .then((data) => {
                setCareGivers(data?.responseObject || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = () => {
        if (!selectedCareGiver || !startTime || !duration) {
            alert("Please fill all fields before submitting.");
            return;
        }
        
        const payload = {
            patient,
            type,
            careGiverId: selectedCareGiver,
            startTime,
            duration: parseInt(duration),
        };

        console.log("Submitting Late Submission Data:", payload);
    };

    return (
        <div className="max-w-md mx-auto p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
            <h2 className="text-2xl font-semibold text-center text-black mb-6">Late Submission</h2>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center">
                    <Loader className="animate-spin text-gray-700" />
                    <p className="mt-2 text-gray-600">Loading caregivers...</p>
                </div>
            ) : (
                <>
                    {/* Caregiver Selection */}
                    <label className="block mb-2 text-black font-medium">Select Caregiver</label>
                    <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSelectedCareGiver(e.target.value)}
                    >
                        <option value="">Choose a caregiver</option>
                        {careGivers.map((careGiver) => (
                            <option key={careGiver.userId} value={careGiver.userId.toString()}>
                                {careGiver.fullName} - {careGiver.branchName}
                            </option>
                        ))}
                    </select>
                    
                    {/* Start Time Input */}
                    <label className="block mt-4 mb-2 text-black font-medium">Start Time</label>
                    <input
                        type="datetime-local"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                    
                    {/* Duration Selection */}
                    <label className="block mt-4 mb-2 text-black font-medium">Duration</label>
                    <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        <option value="">Select duration</option>
                        <option value="30">30 mins</option>
                        <option value="45">45 mins</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                    </select>
                    
                    {/* Submit Button */}
                    <button 
                        className="w-full mt-6 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </>
            )}
        </div>
    );
};

export default LateSubmission;
