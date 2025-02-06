import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createChartData } from "../services/createChartData";
import { errorHandler } from "../services/errorHandler";

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
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState(null)
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients()
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false);
            })
            .catch(() => {
                setError("Failed to fetch patients.");
                setLoadingPatients(false);
            });
    }, []);

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
            status: value
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
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Chart Data</h2>
            <label className="block text-gray-300">Time to be Taken:</label>
            <input type="time" value={timeToBeTaken} onChange={(e) => setTimeToBeTaken(e.target.value)} className="border p-2 rounded w-full text-white" />
            
            <label className="block mt-2 text-gray-300">Select Patient:</label>
            <select value={patient} onChange={(e) => setPatient(e.target.value)} className="border p-2 rounded w-full bg-black" disabled={loadingPatients}>
                <option className="text-white"  value="">{loadingPatients ? "Loading patients..." : "Select a Patient"}</option>
                {patients.map((p) => (
                    <option className="text-white" key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</option>
                ))}
            </select>
            
            <table className="w-full mt-4 border-collapse border border-gray-700">
                <thead>
                    <tr>
                        <th className="border border-gray-600 p-2">Category</th>
                        <th className="border border-gray-600 p-2">Behavior</th>
                        <th className="border border-gray-600 p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(behaviors).map(([category, items]) => {
                        const keys = Object.keys(items);
                        return keys.map((key, index) => (
                            <tr key={key}>
                                {index === 0 && (
                                    <td className="border border-gray-600 p-2 font-bold bg-gray-800" rowSpan={keys.length}>
                                        {category}
                                    </td>
                                )}
                                <td className="border border-gray-600 p-2">{key.replace(/_/g, " ")}</td>
                                <td className="border border-gray-600 p-2">
                                    <button 
                                        onClick={() => handleToggle(category, key)} 
                                        className={`p-2 rounded ${items[key] === "Yes" ? "bg-green-500" : "bg-red-500"} text-white`}
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
