import React, { useState, useEffect } from "react";
import { fetchChartData } from "../services/fetchChartData";
import { updateChartData } from "../services/updateChartData";
import { fetchPatients } from "../services/fetchPatients";
import { errorHandler } from "../services/errorHandler";

const ChartDataCard = () => {
    const [chartData, setChartData] = useState([]);
    const [patients, setPatients] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        setLoading(true);
        fetchChartData(pageNumber, pageSize)
            .then((data) => {
                setChartData(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch chart data.");
                setLoading(false);
            });
    }, [pageNumber, pageSize]);

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients(pageNumber, pageSize)
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false);
            })
            .catch(() => {
                setError("Failed to fetch patients.");
                setLoadingPatients(false);
            });
    }, [pageNumber, pageSize]);

    const handleToggle = (chartId, category, key) => {
        setChartData((prevData) =>
            prevData.map((chart) =>
                chart.chartDataId === chartId
                    ? {
                          ...chart,
                          behaviors: {
                              ...chart.behaviors,
                              [category]: {
                                  ...chart.behaviors[category],
                                  [key]: !chart.behaviors[category][key],
                              },
                          },
                      }
                    : chart
            )
        );
    };

    const handleUpdate = async (chartId) => {
        const updatedChart = chartData.find((chart) => chart.chartDataId === chartId);
        const response = await updateChartData(chartId, updatedChart);
        if (response?.error) {
            setErrors(errorHandler(response.error));
        } else {
            alert("Chart data updated successfully");
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Chart Data Overview</h2>

            {loading && <p className="text-yellow-400">Loading chart data...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {loadingPatients && <p className="text-yellow-400">Loading patients, please wait...</p>}

            {chartData.map((chart) => (
                <div key={chart.chartDataId} className="mb-6 p-6 bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-blue-300">Patient ID: {chart.patientId}</h3>

                    <label className="block mt-2 text-gray-300">Select Patient:</label>
                    <select
                        value={chart.patientId}
                        onChange={(e) =>
                            setChartData((prev) =>
                                prev.map((item) =>
                                    item.chartDataId === chart.chartDataId
                                        ? { ...item, patientId: e.target.value }
                                        : item
                                )
                            )
                        }
                        className="border p-2 rounded w-full text-black"
                    >
                        {patients.map((p) => (
                            <option key={p.patientId} value={p.patientId}>
                                {p.firstName} {p.lastName}
                            </option>
                        ))}
                    </select>

                    <table className="w-full mt-4 border-collapse border border-gray-700">
                        <thead>
                            <tr>
                                <th className="border border-gray-600 p-2">Category</th>
                                <th className="border border-gray-600 p-2">Behavior</th>
                                <th className="border border-gray-600 p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(chart.behaviors).map(([category, items]) =>
                                Object.entries(items).map(([key, value]) => (
                                    <tr key={key}>
                                        <td className="border border-gray-600 p-2">{category}</td>
                                        <td className="border border-gray-600 p-2">{key.replace(/_/g, " ")}</td>
                                        <td className="border border-gray-600 p-2">
                                            <button
                                                onClick={() => handleToggle(chart.chartDataId, category, key)}
                                                className={`p-2 rounded ${
                                                    value ? "bg-green-500" : "bg-red-500"
                                                } text-white`}
                                            >
                                                {value.toString()}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <button
                        onClick={() => handleUpdate(chart.chartDataId)}
                        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Update Chart Data
                    </button>


                </div>
            ))}

            {errors.length > 0 && (
                <div className="mb-4 p-3 rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                </div>
            )}

            <button
                onClick={() => setPageNumber(pageNumber + 1)}
                className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Load More
            </button>
        </div>
    );
};

export default ChartDataCard;
