import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createChartData } from "../services/createChartData";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";

const ChartData = () => {
    const [behaviors, setBehaviors] = useState({
        Resistive: {
            Meals: "Yes",
            Shower: "Yes",
            Grooming: "Yes",
            Medication: "Yes",
            Log_in_and_out: "Yes",
            Walk_activities: "Yes",
            Change_of_clothing: "Yes",
            Coming_back_late_hours: "Yes",
            To_speak_care_provider: "Yes"
        },
        Behavior: {
            Pacing: "Yes",
            Anxiety: "Yes",
            Agitated: "Yes",
            Drunkard: "Yes",
            Freezing: "Yes",
            Suicidal: "Yes",
            Elopement: "Yes",
            Long_naps: "Yes",
            Delusional: "Yes",
            Naked_Nude: "Yes",
            Gaslighting: "Yes",
            Short_memory: "Yes",
            Hallucination: "Yes",
            Sexual_acting_out: "Yes",
            Yelling_screaming: "Yes",
            Extreme_mood_swing: "Yes",
            Sleep_disturbances: "Yes",
            Disruptive_at_night: "Yes",
            Abusive_cursing_words: "Yes",
            Incontinent_urination: "Yes",
            Intentional_self_HARM: "Yes",
            Wandering_seeking_exit: "Yes"
        },
        Others: {
            BP_low: "Yes",
            BP_high: "Yes",
            Accident: "Yes",
            Dehydration: "Yes",
            Constipation: "Yes",
            Sick_911_call: "Yes",
            Blood_sugar_low: "Yes",
            Blood_sugar_high: "Yes"
        }
    });

    const [behaviorsDescription, setBehaviorsDescription] = useState({
        Date: true,
        Outcome: true,
        Trigger: true,
        Behavior_Description: true,
        Care_Giver_Intervention: true,
        Reported_Provider_And_Careteam: true,
    });
    const [timeToBeTaken, setTimeToBeTaken] = useState("");
    const [patients, setPatients] = useState([]);
    const [patient, setPatient] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState(null)
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients(pageNumber, pageSize)
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false);
            })
            .catch(() => {
                setError("Failed to fetch patients.");
                setLoadingPatients(false);
            });
    }, [pageNumber, pageSize]);

    const handleToggle = (category, key) => {
        setBehaviors((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: prev[category][key] === "Yes" ? "No" : "Yes"
            }
        }));
    };
    

    const handleSubmit = async () => {
        setSubmitting(true);
        setErrors([]);

        const behaviorsArray = Object.entries(behaviors).flatMap(([category, items]) =>
            Object.entries(items).map(([key, value]) => ({
                category,
                behavior: key.replace(/_/g, " "),
                status: value 
            }))
        );
        const behaviorsDescriptionArray = Object.entries(behaviorsDescription).map(([key, value]) => ({
            descriptionType: key,
            status: value,
            response: null
        }));

        const data = {
            patient,
            behaviors: behaviorsArray,
            behaviorsDescription: behaviorsDescriptionArray,
            timeToBeTaken
        };

        try {
            const response = await createChartData(data);
            if (response?.error) {
                setErrors(errorHandler(response.error));
            }else{
                setMessage(["Chart data posted successfully."]);
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (err) {
            setErrors(["Something went wrong. Please try again."]);
            setTimeout(() => setErrors(""), 5000);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <h2 className="text-2xl font-bold text-center mb-4 text-blue-400">Chart Data</h2>
            <label className="block text-gray-300">Time to be Taken:</label>
            <input 
                type="time" 
                value={timeToBeTaken} onChange={(e) => setTimeToBeTaken(e.target.value)} 
                className="border p-2 rounded w-full bg-gray-700 text-white" />
            
            <label className="block mt-2 text-gray-300">Select Patient:</label>
            {loadingPatients ? (
                <div className="flex items-center space-x-2">
                    <Loader className="animate-spin text-gray-400" size={20} />
                    <p className="text-gray-400">Loading patients...</p>
                </div>
            ) : (
                <select 
                value={patient} 
                onChange={(e) => setPatient(e.target.value)} 
                className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded">
                    <option className="" value="">Select a Patient</option>
                    {patients.map((p) => (
                        <option className="" key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
                </select>
            )}
            {/* <button 
                onClick={() => setPageNumber(pageNumber + 1)} 
                className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
            Load More Patients
            </button> */}
            
            <table className="w-full border-collapse border border-gray-700 text-white">
                <thead>
                    <tr>
                        <th className="p-3 border border-gray-600">Category</th>
                        <th className="p-3 border border-gray-600">Behavior</th>
                        <th className="p-3 border border-gray-600">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(behaviors).map(([category, items]) => {
                        const keys = Object.keys(items);
                        return keys.map((key, index) => (
                            <tr 
                                key={key}
                                className="bg-gray-900 text-gray-300"
                            >
                                {index === 0 && (
                                    <td 
                                        className="p-2 border border-gray-700" 
                                        rowSpan={keys.length}>
                                        {category}
                                    </td>
                                )}
                                <td className="p-2 border border-gray-700">{key.replace(/_/g, " ")}</td>
                                <td className="p-2 border border-gray-700">
                                    <button 
                                        onClick={() => handleToggle(category, key)} 
                                        className={`p-2 rounded ${items[key] === "Yes" ? "bg-gray-700" : "bg-red-500"} text-white`}
                                    >
                                        {items[key]}
                                    </button>
                                </td>
                            </tr>
                        ));
                    })}
                </tbody>
            </table>
            
            <button 
                onClick={handleSubmit} 
                className={`mt-4 p-2 rounded ${submitting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                disabled={submitting}
            >
                {submitting ? "Submitting..." : "Submit"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-600">{message}</p>}
            {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-800 rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-white">{error}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChartData;
