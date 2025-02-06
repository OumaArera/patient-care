import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createChartData } from "../services/createChartData";
import { errorHandler } from "../services/errorHandler";

const ChartData = () => {
    const [behaviors, setBehaviors] = useState({
        Resistive: {
            Meals: true,
            Shower: true,
            Grooming: true,
            Medication: true,
            Log_in_and_out: true,
            Walk_activities: true,
            Change_of_clothing: true,
            Coming_back_late_hours: true,
            To_speak_care_provider: true
        },
        Behavior: {
            Pacing: true,
            Anxiety: true,
            Agitated: true,
            Drunkard: true,
            Freezing: true,
            Suicidal: true,
            Elopement: true,
            Long_naps: true,
            Delusional: true,
            Naked_Nude: true,
            Gaslighting: true,
            Short_memory: true,
            Hallucination: true,
            Sexual_acting_out: true,
            Yelling_screaming: true,
            Extreme_mood_swing: true,
            Sleep_disturbances: true,
            Disruptive_at_night: true,
            Abusive_cursing_words: true,
            Incontinent_urination: true,
            Intentional_self_HARM: true,
            Wandering_seeking_exit: true
        },
        Others: {
            BP_low: true,
            BP_high: true,
            Accident: true,
            Dehydration: true,
            Constipation: true,
            Sick_911_call: true,
            Blood_sugar_low: true,
            Blood_sugar_high: true
        }
    });
    
    const [behaviorsDescription, setBehaviorsDescription] = useState({
        Date: true,
        Outcome: true,
        Trigger: true,
        Behavior_Description: true,
        Care_Giver_Intervention: true,
        Reported_Provider_And_Careteam: true
    });
    
    const [timeToBeTaken, setTimeToBeTaken] = useState("");
    const [patients, setPatients] = useState([]);
    const [patient, setPatient] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [errors, setErrors] = useState([]);
    const [error, setError] = useState("")
    

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
                [key]: !prev[category][key]
            }
        }));
    };
    
    const handleSubmit = async () => {
        const data = {
            patientId: patient,
            behaviors,
            behaviorsDescription,
            timeToBeTaken
        };

        const response = await createChartData(data);

        if (response?.error) {
            setErrors(errorHandler(response.error));
        }
    };
    
    return (
        <div className="p-4 bg-gray-100">
            <h2 className="text-xl font-bold mb-4">Chart Data</h2>
            {error && <p className="text-red-500">{error}</p>}
            <label>Time to be Taken:</label>
            <input type="time" value={timeToBeTaken} onChange={(e) => setTimeToBeTaken(e.target.value)} className="border p-2 rounded w-full" />
            
            <label>Select Patient:</label>
            <select value={patient} onChange={(e) => setPatient(e.target.value)} className="border p-2 rounded w-full" disabled={loadingPatients}>
                <option value="">{loadingPatients ? "Loading patients..." : "Select a Patient"}</option>
                {patients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</option>
                ))}
            </select>
            <button onClick={() => setPageNumber(pageNumber + 1)} className="mt-2 p-2 bg-blue-500 text-white rounded">Load More Patients</button>
            
            <table className="w-full mt-4 border-collapse border border-gray-400">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">Category</th>
                        <th className="border border-gray-300 p-2">Behavior</th>
                        <th className="border border-gray-300 p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(behaviors).map(([category, items]) => (
                        Object.entries(items).map(([key, value]) => (
                            <tr key={key}>
                                <td className="border border-gray-300 p-2">{category}</td>
                                <td className="border border-gray-300 p-2">{key.replace(/_/g, " ")}</td>
                                <td className="border border-gray-300 p-2">
                                    <button onClick={() => handleToggle(category, key)} className={`p-2 rounded ${value ? "bg-green-500" : "bg-red-500"} text-white`}>
                                        {value.toString()}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ))}
                </tbody>
            </table>
            
            <button onClick={handleSubmit} className="mt-4 p-2 bg-blue-500 text-white rounded">Submit</button>
            {errors.length > 0 && (
                <div className="mb-4 p-3 rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChartData;
