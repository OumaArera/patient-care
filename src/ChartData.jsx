import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { createChartData } from "../services/createChartData";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";
import { fetchChartData } from "../services/fetchChartData";
// import { data } from "react-router-dom";

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
    const [vitals, setVitals] = useState({
        Blood_Pressure: true,
        Pulse: true,
        Temperature: true,
        Oxygen_Saturation: true,
        Pain: true
    })
    const [timeToBeTaken, setTimeToBeTaken] = useState("");
    const [patients, setPatients] = useState([]);
    const [patient, setPatient] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [newBehavior, setNewBehavior] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients(pageNumber, pageSize)
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false);
            })
            .catch(() => {
                setErrors(["Failed to fetch patients."]);
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

    useEffect(() => {
        fetchChartData()
            .then((data) => {
                if (data?.responseObject) {
                    const behaviorsArray = Object.values(data.responseObject).flatMap(obj => obj.behaviors);
                    setChartData(behaviorsArray);
                }
            })
            .catch((err) => {
                console.log("Error: ", err);
            });
    }, []);
    
    
    console.log("Data: ", chartData);

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

        const vitalsArray = Object.entries(vitals).map(([key, value]) => ({
            vitalsType: key.replace(/_/g, " "),
            status: value,
            response: null
            })
        );

        const data = {
            patient,
            vitals: vitalsArray,
            behaviors: behaviorsArray,
            behaviorsDescription: behaviorsDescriptionArray,
            timeToBeTaken: timeToBeTaken.toString()
        };

        try {
            const response = await createChartData(data);
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            }else{
                setMessage(["Chart data posted successfully."]);
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (err) {
            setErrors(["Something went wrong. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setSubmitting(false);
        }
    };


    const categories = [...new Set(chartData.map(item => item.category))];
    
    // Function to delete behavior
    const deleteBehavior = (index) => {
        const updatedBehaviors = behaviors.filter((_, i) => i !== index);
        console.log("Remaining behaviors:", updatedBehaviors);
        setBehaviors(updatedBehaviors);
    };
    
    // Function to add a new behavior
    const addBehavior = () => {
        if (newBehavior && selectedCategory) {
            const newEntry = {
                status: "Yes",
                behavior: newBehavior,
                category: selectedCategory
            };
            const updatedBehaviors = [...behaviors, newEntry];
            console.log("Updated behaviors:", updatedBehaviors);
            setBehaviors(updatedBehaviors);
            setNewBehavior("");
        }
    };
    
    // Group behaviors by category
    const groupedData = chartData.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <h2 className="text-2xl font-bold text-center mb-4 text-blue-400">Chart Data</h2>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-left">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Category</th>
                            <th className="p-2 border">Behavior</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedData).map(([category, items]) => (
                            items.map((item, index) => (
                                <tr key={index} className="border">
                                    {index === 0 && (
                                        <td rowSpan={items.length} className="p-2 border font-semibold">{category}</td>
                                    )}
                                    <td className="p-2 border">{item.behavior}</td>
                                    <td className="p-2 border">{item.status}</td>
                                    <td className="p-2 border">
                                        <button 
                                            onClick={() => deleteBehavior(behaviors.indexOf(item))} 
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            </div>
            
            <h3 className="text-xl font-semibold mt-6">Add New Behavior</h3>
            <div className="flex items-center gap-4 mt-4">
                <select 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                    value={selectedCategory} 
                    className="border border-gray-300 p-2 rounded w-1/3"
                >
                    <option value="">Select Category</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
                <input 
                    type="text" 
                    placeholder="Enter behavior" 
                    value={newBehavior} 
                    onChange={(e) => setNewBehavior(e.target.value)}
                    className="border border-gray-300 p-2 rounded w-1/3"
                />
                <button 
                    onClick={addBehavior} 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add
                </button>
            </div>
            
            <button 
                onClick={handleSubmit} 
                className={`mt-4 p-2 rounded ${submitting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                disabled={submitting}
            >
                {submitting ? "Submitting..." : "Submit"}
            </button>
            {/* {error && <p className="text-red-500">{error}</p>} */}
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
