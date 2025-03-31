import React, { useState, useEffect } from "react";
import { getData } from "../services/updatedata";
import { Loader, FileDown, Eye, Filter, Calendar, RefreshCw } from "lucide-react";

const INCIDENT_URL = "https://patient-care-server.onrender.com/api/v1/incidents";

const ManageIncidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPreview, setCurrentPreview] = useState(null);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = () => {
        setLoading(true);
        getData(INCIDENT_URL)
            .then((data) => setIncidents(data?.responseObject || []))
            .catch(() => setErrors(["Failed to fetch incidents"]))
            .finally(() => setLoading(false));
    };

    const openPreview = (url) => {
        setCurrentPreview(url);
    };

    const closePreview = () => {
        setCurrentPreview(null);
    };

    const formatDateTime = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getDownloadFilename = (filepath) => {
        if (filepath.includes('/')) {
            const parts = filepath.split('/');
            return `incident_${parts[parts.length - 1]}.pdf`;
        }
        return filepath;
    };

    // Filter incidents based on date range and status
    const filteredIncidents = incidents.filter((incident) => {
        const incidentDate = new Date(incident.createdAt);
        const startDateFilter = startDate ? new Date(startDate) : null;
        const endDateFilter = endDate ? new Date(endDate) : null;

        const dateMatch = 
            (!startDateFilter || incidentDate >= startDateFilter) &&
            (!endDateFilter || incidentDate <= endDateFilter);
        
        const statusMatch = statusFilter ? incident.status === statusFilter : true;
        
        return dateMatch && statusMatch;
    });

    // Sort incidents by date, most recent first
    const sortedIncidents = [...filteredIncidents].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );


    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Manage Incidents</h2>

            {/* Filters */}
            <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Filter className="mr-2 h-5 w-5" />
                    Filter Incidents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            Start Date
                        </label>
                        <input
                            type="date"
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            End Date
                        </label>
                        <input
                            type="date"
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="updated">Updated</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button 
                        className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setStatusFilter("");
                        }}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Results count */}
            <div className="mb-4 text-gray-400">
                Showing {sortedIncidents.length} of {incidents.length} incidents
            </div>

            {loading ? (
                <div className="flex justify-center p-10">
                    <Loader className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {sortedIncidents.length === 0 ? (
                        <p className="text-center text-gray-400 py-10">No incidents found matching the criteria</p>
                    ) : (
                        sortedIncidents.map((incident) => (
                            <div key={incident.incidentId} className="bg-gray-800 rounded-lg overflow-hidden">
                                <div className="p-4">
                                    <div className="flex flex-wrap justify-between items-start mb-3">
                                        <div>
                                            <p className="text-gray-400 text-sm">
                                                Reported: {formatDateTime(incident.createdAt)}
                                            </p>
                                            {incident.staffName && (
                                                <p className="text-gray-400 text-sm">
                                                    Staff: {incident.staffName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-700 p-3 rounded mb-3">
                                        <h4 className="text-sm font-medium text-gray-300 mb-1"></h4>
                                        <p className="whitespace-pre-wrap">{incident.details}</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <button
                                            onClick={() => openPreview(incident.filePath)}
                                            className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                        >
                                            <Eye className="mr-1 h-4 w-4" />
                                            Preview
                                        </button>
                                        <a 
                                            href={incident.filePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={getDownloadFilename(incident.filePath)}
                                            className="flex items-center bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                                        >
                                            <FileDown className="mr-1 h-4 w-4" />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {currentPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-screen flex flex-col">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold">Document Preview</h3>
                            <button 
                                onClick={closePreview}
                                className="text-gray-400 hover:text-white"
                            >
                                Close
                            </button>
                        </div>
                        <div className="flex-grow overflow-auto p-1 bg-white">
                            <iframe
                                src={`${currentPreview}`}
                                className="w-full h-full min-h-screen"
                                title="PDF Preview"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
            {errors.length > 0 && (
                <div className="mt-4 p-3 rounded bg-red-900 bg-opacity-20">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-400">{error}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageIncidents;