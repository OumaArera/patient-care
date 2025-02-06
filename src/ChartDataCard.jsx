import React, { useState, useEffect } from "react";
import { fetchChartData } from "../services/fetchChartData";
import { updateChartData } from "../services/updateChartData";
import { fetchPatients } from "../services/fetchPatients";

const ChartDataCard = () => {
    const [chartData, setChartData] = useState([]);
    const [patients, setPatients] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadChartData();
        loadPatients();
    }, [pageNumber]);

    const loadChartData = async () => {
        setLoading(true);
        const response = await fetchChartData(pageNumber, pageSize);
        setChartData(response);
        setLoading(false);
    };

    const loadPatients = async () => {
        const response = await fetchPatients(pageNumber, pageSize);
        setPatients(response);
    };

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
        await updateChartData(chartId, updatedChart);
        alert("Chart data updated successfully");
    };

    return (
        <div className="p-4 bg-gray-100">
            <h2 className="text-xl font-bold mb-4">Chart Data Overview</h2>
            {loading ? <p>Loading...</p> : null}
            {chartData.map((chart) => (
                <div key={chart.chartDataId} className="mb-4 p-4 bg-white rounded shadow">
                    <h3 className="text-lg font-bold">Patient ID: {chart.patientId}</h3>
                    <label>Select Patient:</label>
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
                        className="border p-2 rounded w-full"
                    >
                        {patients.map((p) => (
                            <option key={p.patientId} value={p.patientId}>
                                {p.firstName} {p.lastName}
                            </option>
                        ))}
                    </select>
                    <table className="w-full mt-4 border-collapse border border-gray-400">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-2">Category</th>
                                <th className="border border-gray-300 p-2">Behavior</th>
                                <th className="border border-gray-300 p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(chart.behaviors).map(([category, items]) =>
                                Object.entries(items).map(([key, value]) => (
                                    <tr key={key}>
                                        <td className="border border-gray-300 p-2">{category}</td>
                                        <td className="border border-gray-300 p-2">{key.replace(/_/g, " ")}</td>
                                        <td className="border border-gray-300 p-2">
                                            <button
                                                onClick={() => handleToggle(chart.chartDataId, category, key)}
                                                className={`p-2 rounded ${value ? "bg-green-500" : "bg-red-500"} text-white`}
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
                        className="mt-4 p-2 bg-blue-500 text-white rounded"
                    >
                        Update Chart Data
                    </button>
                </div>
            ))}
            <button
                onClick={() => setPageNumber(pageNumber + 1)}
                className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
                Load More
            </button>
        </div>
    );
};

export default ChartDataCard;
