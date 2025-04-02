import React, { useEffect, useState, useRef } from "react";
import { getData } from "../services/updatedata";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import { generateGroceryPDF } from "../services/generateGroceries";
import TableOverlayModal from "./TableOverlayModal";

const GROCERIES_URL = "https://patient-care-server.onrender.com/api/v1/groceries";

const ManageGroceries = () => {
    const [groceries, setGroceries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterDate, setFilterDate] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const [expandedCard, setExpandedCard] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState("cards");
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [selectedGrocery, setSelectedGrocery] = useState(null);
    const tableRef = useRef(null);
    const itemsPerPage = 6;

    useEffect(() => {
        getGroceries();
    }, []);

    const getGroceries = () => {
        setLoading(true);
        getData(GROCERIES_URL)
            .then((data) => {
                setGroceries(data?.responseObject || []);
            })
            .catch(() => setGroceries([]))
            .finally(() => setLoading(false));
    };

    const handleStatusChange = (groceryId, newStatus) => {
        setGroceries(groceries.map(grocery =>
            grocery.groceryId === groceryId ? { ...grocery, status: newStatus } : grocery
        ));
        handleUpdate(groceryId, newStatus);
    };

    const handleUpdate = async (groceryId, newStatus) => {
        if (!newStatus) return;

        // setIsSubmitting(true);
        const payload = { status: newStatus };
        const updatedURL = `${GROCERIES_URL}/${groceryId}`;

        try {
            const response = await updateData(updatedURL, payload);
            if (response?.error) {
                setErrors(errorHandler(response.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Status updated successfully");
                setTimeout(() => setMessage(""), 5000);
                getGroceries();
            }
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } 
    };

    const toggleCard = (groceryId) => {
        setExpandedCard(expandedCard === groceryId ? null : groceryId);
        setViewMode("cards"); // Reset view mode when toggling cards
    };

    // Open table modal with the selected grocery
    const openTableModal = (grocery) => {
        setSelectedGrocery(grocery);
        setIsTableModalOpen(true);
    };

    // Filter groceries based on search criteria
    const filteredGroceries = groceries.filter((grocery) => {
        const dateMatch = filterDate ? new Date(grocery.createdAt).toLocaleDateString("en-US").includes(filterDate) : true;
        const branchMatch = filterBranch ? grocery.branch.toLowerCase().includes(filterBranch.toLowerCase()) : true;
        const statusMatch = filterStatus ? grocery.status === filterStatus : true;
        return dateMatch && branchMatch && statusMatch;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredGroceries.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredGroceries.length / itemsPerPage);

    // Group items by category
    const getGroupedItems = (details) => {
        return details.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-yellow-600";
            case "approved": return "bg-green-600";
            case "declined": return "bg-red-600";
            case "delivered": return "bg-blue-600";
            default: return "bg-gray-600";
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg w-full max-w-6xl mx-auto shadow-lg">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Manage Groceries</h2>

            <div className="flex flex-wrap gap-4 mb-4">
                <input
                    type="date"
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Filter by Branch"
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                />
                <select
                    className="p-2 bg-gray-800 text-white rounded"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            {loading ? (
                <p className="text-center text-blue-400">Loading...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentItems.map((grocery) => (
                            <div 
                                key={grocery.groceryId} 
                                className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200"
                            >
                                <div 
                                    className="p-4 cursor-pointer hover:bg-gray-700 flex justify-between items-center"
                                    onClick={() => toggleCard(grocery.groceryId)}
                                >
                                    <div>
                                        <h3 className="font-bold text-lg">{grocery.branch}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {new Date(grocery.createdAt).toLocaleDateString("en-US")}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            Requested by: {grocery.staffName}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(grocery.status)}`}>
                                        {grocery.status}
                                    </div>
                                </div>

                                {expandedCard === grocery.groceryId && (
                                    <div className="p-4 bg-gray-700 border-t border-gray-600">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    className={`px-3 py-1 text-xs rounded ${viewMode === 'cards' ? 'bg-blue-600' : 'bg-gray-600'}`}
                                                    onClick={() => setViewMode('cards')}
                                                >
                                                    Category View
                                                </button>
                                                <button
                                                    className="px-3 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700"
                                                    onClick={() => openTableModal(grocery)}
                                                >
                                                    View Full Table
                                                </button>
                                            </div>
                                            <button
                                                className="px-3 py-1 text-xs rounded bg-green-600 flex items-center"
                                                onClick={() => generateGroceryPDF(grocery)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-9 3h12M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Download PDF
                                            </button>
                                        </div>

                                        {/* Always use category view in the card */}
                                        {Object.entries(getGroupedItems(grocery.details)).map(([category, items]) => (
                                            <div key={category} className="mb-3">
                                                <h4 className="font-semibold text-blue-400 mb-1">{category}</h4>
                                                <ul className="pl-4">
                                                    {items.map((item, i) => (
                                                        <li key={i} className="text-sm pb-1">
                                                            {item.item} ({item.quantity})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                        
                                        {grocery.feedback && (
                                            <div className="mt-2">
                                                <h4 className="font-semibold text-blue-400">Feedback</h4>
                                                <p className="text-sm mt-1">{grocery.feedback}</p>
                                            </div>
                                        )}
                                        
                                        {grocery.status !== "delivered" && (
                                            <div className="mt-4">
                                                <select
                                                    className="p-2 bg-gray-600 text-white rounded w-full"
                                                    onChange={(e) => handleStatusChange(grocery.groceryId, e.target.value)}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Update Status</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="declined">Declined</option>
                                                    <option value="delivered">Delivered</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="mx-1 px-3 py-1 rounded bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
                            >
                                Prev
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`mx-1 px-3 py-1 rounded ${
                                        currentPage === i + 1 ? 'bg-blue-600' : 'bg-gray-700'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="mx-1 px-3 py-1 rounded bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {message && <p className="text-green-400 mt-4">{message}</p>}
            {errors.length > 0 && (
                <ul className="text-red-400 mt-4">
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}

            {/* Table Overlay Modal */}
            <TableOverlayModal 
                isOpen={isTableModalOpen}
                onClose={() => setIsTableModalOpen(false)}
                details={selectedGrocery?.details || []}
                groceryInfo={selectedGrocery}
            />
        </div>
    );
};

export default ManageGroceries;