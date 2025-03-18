import React, { useState, useEffect } from "react";

const GroceriesCard = ({ groceries, handleGetGroceries }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [updatedGroceries, setUpdatedGroceries] = useState(groceries);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const itemsPerPage = 3;

    useEffect(() => {
        setUpdatedGroceries(groceries);
    }, [groceries]);

    const statusOrder = { pending: 1, delivered: 2, approved: 3, declined: 4 };
    const sortedGroceries = [...updatedGroceries].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    const filteredGroceries = sortedGroceries.filter((grocery) => {
        return (
            (filterStatus ? grocery.status === filterStatus : true) &&
            (filterBranch ? grocery.branch.toLowerCase().includes(filterBranch.toLowerCase()) : true) &&
            (filterDate ? grocery.createdAt?.startsWith(filterDate) : true)
        );
    });
    

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentGroceries = filteredGroceries.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => {
        if (indexOfLastItem < filteredGroceries.length) {
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
            <h2 className="text-xl flex text-center font-bold text-blue-500 mb-4">Groceries List</h2>

            <div className="flex flex-wrap gap-4 mb-4">
                <select
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="delivered">Delivered</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                </select>
                <input
                    type="text"
                    placeholder="Filter by Branch"
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                />
                <input
                    type="date"
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
            </div>

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
                                        {grocery.status === "delivered" ? (
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
                    {grocery.status === "delivered" && (
                        <div className="mt-3">
                            <textarea
                                className="w-full p-2 bg-gray-800 text-white rounded"
                                placeholder="Enter feedback..."
                                value={grocery.feedback || ""}
                                onChange={(e) => handleFeedbackChange(groceryIndex, e.target.value)}
                            />
                        </div>
                    )}
                    {grocery.status === "declined" || grocery.status === "delivered" && (
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
                    disabled={indexOfLastItem >= filteredGroceries.length}
                    className="bg-gray-700 px-3 py-1 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default GroceriesCard;


