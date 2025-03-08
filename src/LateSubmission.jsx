import React, { useEffect, useState } from "react";
import { getCareGivers } from "../services/getCareGivers";
import { Loader } from "lucide-react";
import { createData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
const URL = "https://patient-care-server.onrender.com/api/v1/late-submissions";

const LateSubmission = ({ patient, type }) => {
    const [careGivers, setCareGivers] = useState([]);
    const [selectedCareGiver, setSelectedCareGiver] = useState("");
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const [reason, setReason] = useState("");
    
    useEffect(() => {
        setLoading(true);
        getCareGivers()
            .then((data) => {
                setCareGivers(data?.responseObject || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async () => {
        if (!selectedCareGiver || !startTime || !duration || !reason) {
            alert("Please fill all fields before submitting.");
            return;
        }
        setIsSubmitting(true);
        const localDate = new Date(startTime);
        const utcDate = localDate.toISOString();
        
        const payload = {
            patient: patient.patientId ? patient.patientId : patient ,
            type,
            careGiver: selectedCareGiver,
            start: utcDate,
            duration: parseFloat(duration),
            reasonForLateSubmission: reason
        };
        try {
            const response = await createData(URL, payload);
                
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setSelectedCareGiver("");
                setStartTime("");
                setDuration("");
                setReason("");
                setMessage("Data created successfully");
                setTimeout(() => setMessage(""), 5000);
            }
            
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 shadow-lg rounded-2xl bg-gray-900 border border-gray-700 text-white">
            <h2 className="text-2xl font-semibold text-center text-blue-400 mb-6">Late Submission</h2>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center">
                    <Loader className="animate-spin text-blue-400" />
                    <p className="mt-2 text-gray-400">Loading caregivers...</p>
                </div>
            ) : (
                <>
                    {/* Caregiver Selection */}
                    <label className="block mb-2 text-blue-300 font-medium">Select Caregiver</label>
                    <select 
                        className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSelectedCareGiver(e.target.value)}
                    >
                        <option value="">Choose a caregiver</option>
                        {Object.entries(
                            careGivers.reduce((acc, careGiver) => {
                                acc[careGiver.branchName] = acc[careGiver.branchName] || [];
                                acc[careGiver.branchName].push(careGiver);
                                return acc;
                            }, {})
                        ).map(([branchName, caregivers]) => (
                            <optgroup key={branchName} label={branchName}>
                                {caregivers.map((careGiver) => (
                                    <option key={careGiver.userId} value={careGiver.userId.toString()}>
                                        {careGiver.fullName}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    
                    {/* Start Time Input */}
                    <label className="block mt-4 mb-2 text-blue-300 font-medium">Start Time</label>
                    <input
                        type="datetime-local"
                        className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                    
                    {/* Duration Selection */}
                    <label className="block mt-4 mb-2 text-blue-300 font-medium">Duration</label>
                    <select 
                        className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        <option value="">Select duration</option>
                        <option value="30">30 mins</option>
                        <option value="45">45 mins</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                        <option value="360">6 hours</option>
                        <option value="720">12 hours</option>
                        <option value="1440">24 hours</option>
                        <option value="2160">36 hours</option>
                        <option value="2880">48 hours</option>
                    </select>
                    <label className="block mt-4 mb-2 text-blue-300 font-medium">Reason for Late Submission</label>
                    <textarea
                        className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Enter reason here..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    ></textarea>
                    {errors.length > 0 && (
                        <div className="mb-4 p-3 rounded">
                            {errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-600">{error}</p>
                            ))}
                        </div>
                    )}
                    {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
                    
                    {/* Submit Button */}
                    <button 
                        className="w-full mt-6 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </>
            )}
        </div>
    );
};

export default LateSubmission;