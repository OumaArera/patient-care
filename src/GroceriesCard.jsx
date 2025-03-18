import React, { useState, useEffect } from "react";

const GroceriesCard = ({ groceries, handleGetGroceries }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [updatedGroceries, setUpdatedGroceries] = useState(groceries);
    const itemsPerPage = 3;

    useEffect(() => {
        setUpdatedGroceries(groceries);
    }, [groceries]);


    // Sort groceries by status order: pending -> approved -> declined
    const statusOrder = { pending: 1, approved: 2, declined: 3 };
    const sortedGroceries = [...updatedGroceries].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentGroceries = sortedGroceries.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => {
        if (indexOfLastItem < sortedGroceries.length) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleDeliveredChange = (groceryIndex, detailIndex) => {
        const updated = [...updatedGroceries];
        updated[groceryIndex].details[detailIndex].delivered = true;
        setUpdatedGroceries(updated);
    };

    const handleFeedbackChange = (groceryIndex, feedback) => {
        const updated = [...updatedGroceries];
        updated[groceryIndex].feedback = feedback;
        setUpdatedGroceries(updated);
    };

    const handleItemEdit = (groceryIndex, detailIndex, field, value) => {
        const updated = [...updatedGroceries];
        updated[groceryIndex].details[detailIndex][field] = value;
        setUpdatedGroceries(updated);
    };

    const handleSubmit = (grocery) => {
        const status = grocery.details.some((d) => !d.delivered) ? "updated" : grocery.status;
        console.log({
            groceryId: grocery.groceryId,
            details: grocery.details,
            feedback: grocery.feedback,
            status,
        });
        handleGetGroceries()
    };

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg w-full max-w-4xl mx-auto shadow-lg">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Groceries List</h2>
            {currentGroceries.map((grocery, groceryIndex) => (
                <div key={grocery.groceryId} className="mb-6 p-4 border border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold">Home: {grocery?.branch || "-"}</h3>
                    <p className="text-gray-400">Status: {grocery.status}</p>
                    <table className="w-full mt-3 border border-gray-700 text-left">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="p-2 border border-gray-700">Item</th>
                                <th className="p-2 border border-gray-700">Quantity</th>
                                <th className="p-2 border border-gray-700">Delivered</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grocery.details.map((detail, detailIndex) => (
                                <tr key={detailIndex} className="border-gray-700">
                                    <td className="p-2 border border-gray-700">
                                        {grocery.status === "declined" ? (
                                            <input
                                                type="text"
                                                value={detail.item}
                                                onChange={(e) =>
                                                    handleItemEdit(groceryIndex, detailIndex, "item", e.target.value)
                                                }
                                                className="bg-gray-800 text-white p-1 rounded w-full"
                                            />
                                        ) : (
                                            detail.item
                                        )}
                                    </td>
                                    <td className="p-2 border border-gray-700">
                                        {grocery.status === "declined" ? (
                                            <input
                                                type="number"
                                                value={detail.quantity}
                                                onChange={(e) =>
                                                    handleItemEdit(groceryIndex, detailIndex, "quantity", e.target.value)
                                                }
                                                className="bg-gray-800 text-white p-1 rounded w-full"
                                                min="1"
                                            />
                                        ) : (
                                            detail.quantity
                                        )}
                                    </td>
                                    <td className="p-2 border border-gray-700 text-center">
                                        {grocery.status === "approved" ? (
                                            <input
                                                type="checkbox"
                                                checked={detail.delivered}
                                                onChange={() => handleDeliveredChange(groceryIndex, detailIndex)}
                                            />
                                        ) : detail.delivered ? (
                                            "Yes"
                                        ) : (
                                            "No"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {grocery.status === "approved" && (
                        <div className="mt-3">
                            <textarea
                                className="w-full p-2 bg-gray-800 text-white rounded"
                                placeholder="Enter feedback..."
                                value={grocery.feedback || ""}
                                onChange={(e) => handleFeedbackChange(groceryIndex, e.target.value)}
                            />
                        </div>
                    )}
                    {grocery.status === "declined" || grocery.status === "approved" && (
                        <button
                            onClick={() => handleSubmit(grocery)}
                            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                        >
                            Submit
                        </button>
                    )}
                    
                </div>
            ))}

            {/* Pagination Controls */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="bg-gray-700 px-3 py-1 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <button
                    onClick={nextPage}
                    disabled={indexOfLastItem >= sortedGroceries.length}
                    className="bg-gray-700 px-3 py-1 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default GroceriesCard;