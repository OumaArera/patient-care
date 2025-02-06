import React, { useState, useEffect } from "react";
import { fetchChartData } from "../services/fetchChartData"; // Assuming fetchChartData is implemented.
import { updateChartData } from "../services/updateChartData"; // Assuming updateChartData is implemented.
import { errorHandler } from "../services/errorHandler"; // Assuming errorHandler is implemented.

const ChartDataCard = () => {
    const [chartData, setChartData] = useState([]);
    const [timeToBeTaken, setTimeToBeTaken] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(1);  // Ensure one patient's data is shown at a time.
    const [selectedPatientName, setSelectedPatientName] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchChartData(currentPage, itemsPerPage);
                if (data.successful && data.responseObject.length > 0) {
                    setChartData(data.responseObject);
                    setTimeToBeTaken(data.responseObject[0]?.timeToBeTaken || ""); // Set initial timeToBeTaken for the first item
                } else {
                    setErrors(["No data available."]);
                }
            } catch (error) {
                setErrors(["Failed to fetch chart data."]);
            }
        };
    
        fetchData();
    }, [currentPage, itemsPerPage]);
    
    // Fetch and display patient names only after data is fetched
    const handlePatientNameChange = (e) => {
        setSelectedPatientName(e.target.value);
    };
    
    // Dynamically generate patient name options in the select dropdown
    const patientNames = [...new Set(chartData.map((chart) => chart.patientName))];

    const handleToggle = (chartDataId, behavior, category) => {
        setChartData((prev) =>
            prev.map((chart) =>
                chart.chartDataId === chartDataId
                    ? {
                          ...chart,
                          behaviors: chart.behaviors.map((item) =>
                              item.behavior === behavior && item.category === category
                                  ? { ...item, status: !item.status } // Toggle status
                                  : item
                          ),
                      }
                    : chart
            )
        );
    };

    const handleTimeChange = (e) => {
        setTimeToBeTaken(e.target.value);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setErrors([]);

        // Update chart data with proper "Yes" or "No" status
        const updatedChartData = chartData.map((chart) => ({
            chartDataId: chart.chartDataId, // Include chartDataId
            ...chart,
            behaviors: chart.behaviors.map((behavior) => ({
                ...behavior,
                status: behavior.status ? "Yes" : "No", 
            })),
            timeToBeTaken,
        }));

        try {
            // Loop through the chart data and update each entry
            for (let chart of updatedChartData) {
                const response = await updateChartData(chart.chartDataId, chart);
                if (response?.error) {
                    setErrors(errorHandler(response.error));
                }
            }
            setErrors(["Chart data updated successfully."]);
        } catch (err) {
            setErrors(["Something went wrong. Please try again."]);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle next page navigation
    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    // Handle previous page navigation
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Chart Data</h2>
    
            {/* Errors */}
            {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-800 rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-white">
                            {error}
                        </p>
                    ))}
                </div>
            )}
    
            {/* Patient Selector */}
            <div className="mb-4">
                <select
                    onChange={handlePatientNameChange}
                    className="p-2 rounded bg-gray-800"
                    value={selectedPatientName || ""}
                >
                    <option value="">Select Patient</option>
                    {patientNames.length > 0 &&
                        patientNames.map((patientName, index) => (
                            <option key={index} value={patientName}>
                                {patientName}
                            </option>
                        ))}
                </select>
            </div>
    
            {/* Filtered Chart Data */}
            {chartData.length === 0 ? (
                <p>No chart data available for the selected patient.</p>
            ) : (
                chartData
                    .filter((chart) => chart.patientName === selectedPatientName)
                    .map((chart) => (
                        <div key={chart.chartDataId} className="mb-6">
                            <label className="block text-gray-300">Time to be Taken:</label>
                            <input
                                type="time"
                                value={timeToBeTaken}
                                onChange={handleTimeChange}
                                className="border p-2 rounded w-full text-white"
                            />
    
                            <table className="w-full mt-4 border-collapse border border-gray-700">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-600 p-2">Behavior</th>
                                        <th className="border border-gray-600 p-2">Category</th>
                                        <th className="border border-gray-600 p-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chart.behaviors.map((behavior) => (
                                        <tr key={behavior.behavior}>
                                            <td className="border border-gray-600 p-2">{behavior.behavior}</td>
                                            <td className="border border-gray-600 p-2">{behavior.category}</td>
                                            <td className="border border-gray-600 p-2">
                                                <button
                                                    onClick={() =>
                                                        handleToggle(chart.chartDataId, behavior.behavior, behavior.category)
                                                    }
                                                    className={`p-2 rounded ${
                                                        behavior.status === "Yes" ?  "bg-green-500" : "bg-red-500"
                                                    } text-white`}
                                                >
                                                    {behavior.status=== "Yes" ? "Yes" : "No"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
    
                            <button
                                onClick={handleSubmit}
                                className={`mt-4 p-2 rounded ${submitting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                                disabled={submitting}
                            >
                                {submitting ? "Submitting..." : "Update Chart Data"}
                            </button>
                        </div>
                    ))
            )}
    
            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded bg-blue-500 text-white"
                >
                    Previous
                </button>
                <span className="p-2 text-white">
                    Page {currentPage}
                </span>
                <button
                    onClick={handleNextPage}
                    className="p-2 rounded bg-blue-500 text-white"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ChartDataCard;
