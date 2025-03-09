import React, { useEffect, useState } from "react";
import { getVitals } from "../services/getVitals";
import { getData } from "../services/updatedata";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";

const URL = "https://patient-care-server.onrender.com/api/v1/vitals";

const PendingVitals = ({ patient }) => {
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedVital, setExpandedVital] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]); 
    console.log("Patient: ", patient);

    useEffect(() => {
        setLoading(true);
        getVitals(patient)
            .then((data) => {
                const filteredVitals = data?.filter(vital => vital.status !== "approved") || [];
                setVitals(filteredVitals);
                setLoading(false);
            })
            .catch(() => {
                setVitals([]);
                setLoading(false);
            });
    }, [patient]);

    const toggleDetails = (vitalId) => {
        setExpandedVital(expandedVital === vitalId ? null : vitalId);
    };

    const handleInputChange = (vitalId, field, value) => {
        setEditedData(prev => ({
            ...prev,
            [vitalId]: {
                ...prev[vitalId],
                [field]: value
            }
        }));
    };

    const handleSubmit = (vitalId) => {
        const updatedVital = editedData[vitalId];
        if (!updatedVital) return;

        const payload = {
            ...updatedVital,
            vitalId,
        };
        
        console.log("Submitting: ", payload);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "text-yellow-500";
            case "declined": return "text-red-500";
            case "updated": return "text-blue-500";
            default: return "text-gray-400";
        }
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">Pending Vitals</h2>
            {loading ? <Loader className="animate-spin" /> : (
                vitals.length > 0 ? vitals.map(vital => (
                    <div key={vital.vitalId} className="mb-4 p-4 bg-gray-800 rounded-lg">
                        <p><strong>Patient:</strong> {vital.patientName}</p>
                        <p className={getStatusColor(vital.status)}><strong>Status:</strong> {vital.status}</p>
                        <button
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => toggleDetails(vital.vitalId)}
                        >
                            {expandedVital === vital.vitalId ? "Hide Details" : "See Details"}
                        </button>
                        {expandedVital === vital.vitalId && (
                            <div className="mt-3">
                                <p><strong>Blood Pressure:</strong> {vital.bloodPressure}</p>
                                <p><strong>Temperature:</strong> {vital.temperature}°F</p>
                                <p><strong>Pulse:</strong> {vital.pulse}</p>
                                <p><strong>Oxygen Saturation:</strong> {vital.oxygenSaturation}%</p>
                                <p><strong>Pain:</strong> {vital.pain || "N/A"}</p>
                                {vital.status === "declined" && (
                                    <div className="mt-3">
                                        <label className="block">Blood Pressure:</label>
                                        <input type="text" className="w-full p-2 bg-gray-700 text-white rounded" defaultValue={vital.bloodPressure} onChange={(e) => handleInputChange(vital.vitalId, "bloodPressure", e.target.value)} />
                                        
                                        <label className="block mt-2">Temperature:</label>
                                        <input type="number" className="w-full p-2 bg-gray-700 text-white rounded" defaultValue={vital.temperature} onChange={(e) => handleInputChange(vital.vitalId, "temperature", parseFloat(e.target.value))} />
                                        
                                        <label className="block mt-2">Pulse:</label>
                                        <input type="number" className="w-full p-2 bg-gray-700 text-white rounded" defaultValue={vital.pulse} onChange={(e) => handleInputChange(vital.vitalId, "pulse", parseFloat(e.target.value))} />
                                        
                                        <label className="block mt-2">Oxygen Saturation:</label>
                                        <input type="number" className="w-full p-2 bg-gray-700 text-white rounded" defaultValue={vital.oxygenSaturation} onChange={(e) => handleInputChange(vital.vitalId, "oxygenSaturation", parseFloat(e.target.value))} />
                                        
                                        <label className="block mt-2">Pain:</label>
                                        <textarea className="w-full p-2 bg-gray-700 text-white rounded" defaultValue={vital.pain} onChange={(e) => handleInputChange(vital.vitalId, "pain", e.target.value)} />
                                        
                                        <button
                                            className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                                            onClick={() => handleSubmit(vital.vitalId)}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )) : <p>No pending vitals found.</p>
            )}
        </div>
    );
};

export default PendingVitals;
