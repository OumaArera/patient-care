import React, { useState, useEffect } from "react";
import { createData } from "../services/updatedata";
import { getData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import GroceriesCard from "./GroceriesCard";
import { Loader } from "lucide-react";

const GROCERIES_URL = "https://patient-care-server.onrender.com/api/v1/groceries";
const BRANCHES_URL = `https://patient-care-server.onrender.com/api/v1/branches`


const Groceries = () => {
    const [groceries, setGroceries] = useState([{ item: "", quantity: 1, delivered: false }]);
    const [pendingGroceries, setPendingGroceries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");

    useEffect(() => {
        setLoading(true);
        getData(BRANCHES_URL)
          .then((data) => {
            setBranches(data.responseObject || []);
          })
          .catch(() => setErrors(["Failed to fetch branches."]))
          .finally(() => setLoading(false))
        getGroceries();
      }, []);

    const getGroceries = () => {
        setLoading(true);
        const staff = localStorage.getItem("userId");
        const queryParams = new URLSearchParams({ staff }).toString();
        
        getData(`${GROCERIES_URL}?${queryParams}`)
        .then((data) => {
            if (data?.responseObject) {
                setPendingGroceries(data.responseObject);
            } else {
                setPendingGroceries([]);
            }
        })
        .catch(() => setPendingGroceries([]))
        .finally(() => setLoading(false));
    };
    
    
    const handleInputChange = (index, field, value) => {
        const updatedGroceries = [...groceries];
        updatedGroceries[index][field] = field === "quantity" ? Number(value) : value;
        setGroceries(updatedGroceries);
    };

    const addRow = () => {
        setGroceries([...groceries, { item: "", quantity: 1, delivered: false }]);
    };

    const removeRow = (index) => {
        if (groceries.length > 1) {
            setGroceries(groceries.filter((_, i) => i !== index));
        }
    };

    const handleSubmit =async () => {
        if (!selectedBranch) return;
        setIsSubmitting(true);
        const payload ={ details:  groceries, branch: selectedBranch}
        try {
            
            const response = await createData(GROCERIES_URL, payload);
                
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Data created successfully");
                setTimeout(() => getGroceries(), 5000);
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
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Grocery List</h2>
            {loading && (
                <div className="text-center">
                    <Loader className="animate-spin text-gray-400 mx-auto" size={20} />
                    <p className="text-gray-400 mt-2">Loading groceries...</p>
                </div>
            )}
            <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="border p-2 rounded w-full bg-gray-700 text-white mb-4"
                required
            >
                <option value="">Select a Branch</option>
                {branches.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId}>
                        {branch.branchName}
                    </option>
                ))}
            </select>
            <table className="w-full border border-gray-700 text-left">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="p-2 border border-gray-700">Item</th>
                        <th className="p-2 border border-gray-700">Quantity</th>
                        <th className="p-2 border border-gray-700">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {groceries.map((grocery, index) => (
                        <tr key={index} className="border-gray-700">
                            <td className="p-2 border border-gray-700">
                                <input
                                    type="text"
                                    value={grocery.item}
                                    onChange={(e) => handleInputChange(index, "item", e.target.value)}
                                    className="bg-gray-800 text-white p-1 rounded w-full"
                                    placeholder="Enter item"
                                />
                            </td>
                            <td className="p-2 border border-gray-700">
                                <input
                                    type="number"
                                    value={grocery.quantity}
                                    onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
                                    className="bg-gray-800 text-white p-1 rounded w-full"
                                    min="1"
                                />
                            </td>
                            <td className="p-2 border border-gray-700">
                                <button onClick={addRow} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">+</button>
                                {groceries.length > 1 && (
                                    <button onClick={() => removeRow(index)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">-</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {errors.length > 0 && (
                <div className="mb-4 p-3 rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                </div>
            )}
            {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
            <button
                onClick={handleSubmit}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
                {isSubmitting ? "Submitting ...": "Submit"}
            </button>
            {pendingGroceries.length > 0 && <GroceriesCard groceries={pendingGroceries} handleGetGroceries={getGroceries} />}
        </div>
    );
};

export default Groceries;
