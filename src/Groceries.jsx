import React, { useState } from "react";

const Groceries = () => {
    const [groceries, setGroceries] = useState([{ item: "", quantity: 1, delivered: false }]);
    
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

    const handleSubmit = () => {
        console.log("Submitted Groceries:", groceries);
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Grocery List</h2>
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
            <button
                onClick={handleSubmit}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
                Submit
            </button>
        </div>
    );
};

export default Groceries;
