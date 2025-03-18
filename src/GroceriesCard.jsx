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

    // Sort groceries by status order: pending -> delivered -> approved -> declined
    const statusOrder = { pending: 1, delivered: 2, approved: 3, declined: 4 };
    const sortedGroceries = [...updatedGroceries].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // Filtering logic
    const filteredGroceries = sortedGroceries.filter((grocery) => {
        return (
            (filterStatus ? grocery.status === filterStatus : true) &&
            (filterBranch ? grocery.branch === filterBranch : true) &&
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

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg w-full max-w-4xl mx-auto shadow-lg">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Groceries List</h2>
            
            {/* Filtering Controls */}
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
                    <p className="text-gray-400">Date: {grocery.createdAt}</p>
                    
                    {/* Grocery details */}
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
                                    <td className="p-2 border border-gray-700">{detail.item}</td>
                                    <td className="p-2 border border-gray-700">{detail.quantity}</td>
                                    <td className="p-2 border border-gray-700 text-center">
                                        {detail.delivered ? "Yes" : "No"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
