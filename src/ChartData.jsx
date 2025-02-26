import React, { useState, useEffect } from "react";
import { updateChartData } from "../services/createChartData";
import { errorHandler } from "../services/errorHandler";
import { fetchChartData } from "../services/fetchChartData";
import { Loader } from "lucide-react";

const ChartData = () => {
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [newBehavior, setNewBehavior] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setLoading(true)
        fetchChartData()
            .then((data) => {
                if (data?.responseObject) {
                    console.log("ID: ", data?.responseObject?.chartDataId);
                    const behaviorsArray = Object.values(data.responseObject).flatMap(obj => obj.behaviors);
                    setChartData(behaviorsArray);
                }
            })
            .catch((err) => {
                console.log("Error: ", err);
            })
            .finally(()=> setLoading(false))
    }, []);

    const handleSubmit = async () => {
        setSubmitting(true);
        setErrors([]);
        const payload = {
            behaviors: chartData,
        };
        setSubmitting(false);
        return Object.entries(payload).forEach(([key, value]) => 
            console.log(`${key} :`, JSON.stringify(value, null, 2))
        );
        // try {
        //     const response = await createChartData(payload);
        //     if (response?.error) {
        //         setErrors(errorHandler(response?.error));
        //         setTimeout(() => setErrors([]), 5000);
        //     }else{
        //         setMessage(["Chart data posted successfully."]);
        //         setTimeout(() => setMessage(""), 5000);
        //     }
        // } catch (err) {
        //     setErrors(["Something went wrong. Please try again."]);
        //     setTimeout(() => setErrors([]), 5000);
        // } finally {
        //     setSubmitting(false);
        // }
    };


    const categories = [...new Set(chartData.map(item => item.category))];
    
    // Function to delete behavior
    const deleteBehavior = (index) => {
        const updatedBehaviors = chartData.filter((_, i) => i !== index);
        console.log("Remaining behaviors:", updatedBehaviors);
        setChartData(updatedBehaviors);
    };
    
    // Function to add a new behavior
    const addBehavior = () => {
        if (newBehavior && selectedCategory) {
            const newEntry = {
                status: "Yes",
                behavior: newBehavior,
                category: selectedCategory
            };
            const updatedBehaviors = [...chartData, newEntry];
            console.log("Updated behaviors:", updatedBehaviors);
            setChartData(updatedBehaviors);
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
            {loading? (
                <div className="flex items-center space-x-2">
                    <Loader className="animate-spin text-gray-400" size={20} />
                    <p className="text-gray-400">Loading residents...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-800 text-left">
                    <thead>
                        <tr className="bg-gray-900">
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
                                            onClick={() => deleteBehavior(chartData.indexOf(item))} 
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
                <h3 className="text-xl font-semibold mt-6">Add New Behavior</h3>
                <div className="flex items-center gap-4 mt-4">
                    <select 
                        onChange={(e) => setSelectedCategory(e.target.value)} 
                        value={selectedCategory} 
                        className="border bg-gray-800 text-white p-2 rounded w-1/3"
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
            </div>
            )}
            
            
            
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