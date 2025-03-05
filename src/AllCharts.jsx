import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCharts } from "../services/getCharts";
import { generatePDFReport } from "../services/generatePDFReport";

import { Loader } from "lucide-react";

const AllCharts = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [charts, setCharts] = useState([]);
    const [filteredCharts, setFilteredCharts] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingCharts, setLoadingCharts] = useState(false);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients()
            .then((data) => {
                setPatients(data?.responseObject || []);
                setLoadingPatients(false);
            })
            .catch(() => setLoadingPatients(false));
    }, []);

    const handlePatientChange = (e) => {
        const patientId = e.target.value;
        setSelectedPatient(patientId);
        setSelectedYear("");
        setSelectedMonth("");
        setFilteredCharts([]);
        if (patientId) {
            fetchCharts(patientId);
        }
    };

    const fetchCharts = (patientId) => {
        setLoadingCharts(true);
        getCharts(patientId)
            .then((data) => {
                setCharts(data?.responseObject || []);
                setLoadingCharts(false);
            })
            .catch(() => setLoadingCharts(false));
    };

    const getAvailableYears = () => {
        const years = [...new Set(charts.map(chart => new Date(chart.dateTaken).getFullYear()))];
        return years.sort((a, b) => b - a);
    };

    const getAvailableMonths = () => {
        if (!selectedYear) return [];
        const months = [...new Set(
            charts
                .filter(chart => new Date(chart.dateTaken).getFullYear() === parseInt(selectedYear))
                .map(chart => new Date(chart.dateTaken).getMonth() + 1)
        )];
        return months.sort((a, b) => a - b);
    };

    const filterCharts = () => {
        if (selectedYear && selectedMonth) {
            const filtered = charts.filter(chart => {
                const date = new Date(chart.dateTaken);
                date.setDate(date.getDate() - 2);
                return date.getFullYear() === parseInt(selectedYear) && date.getMonth() + 1 === parseInt(selectedMonth);
            });
            setFilteredCharts(filtered);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-400">1st EDMONDS</h2>
        <div className="mb-4">
            {loadingPatients && (
                <div className="flex items-center space-x-2">
                    <Loader className="animate-spin text-gray-400" size={20} />
                    <p className="text-gray-400">Loading residents...</p>
                </div>
            )}


            {/* Branch Selection Dropdown */}
            <label className="font-semibold">Select Branch: </label>
            <select
                className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded"
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch || ""}
            >
                <option value="">-- All Branches --</option>
                {[...new Set(patients.map((p) => p.branchName))] // Extract unique branch names
                    .sort()
                    .map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                    ))}
            </select>

            {/* Resident Selection Dropdown */}
            <label className="font-semibold ml-4">Select Resident: </label>
            <select
                className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded"
                onChange={handlePatientChange}
                value={selectedPatient || ""}
            >
                <option value="">-- Select --</option>
                {patients
                    .filter((p) => !selectedBranch || p.branchName === selectedBranch) // Filter by branch
                    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                    .map((p) => (
                        <option key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
            </select>
        </div>

        {loadingCharts && (
            <div className="flex items-center space-x-2">
                <Loader className="animate-spin text-gray-400" size={20} />
                <p className="text-gray-400">Loading charts...</p>
            </div>)}
        {charts.length > 0 && (
            <div className="mb-4">
                <label className="font-semibold">Select Year: </label>
                <select className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    <option value="">-- Select Year --</option>
                    {getAvailableYears().map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <label className="font-semibold ml-4">Select Month: </label>
                <select className="border px-4 py-2 ml-2 bg-gray-700 text-white rounded" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={!selectedYear}>
                    <option value="">-- Select Month --</option>
                    {getAvailableMonths().map(month => (
                        <option key={month} value={month}>{month}</option>
                    ))}
                </select>

                <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={filterCharts}>Filter</button>
            </div>
        )}
        {filteredCharts.length > 0 && (
            <>
                <div className="flex space-x-4">
                    <button 
                        className="mb-4 mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => generatePDFReport(filteredCharts, selectedYear, selectedMonth)}
                    >
                        Download Charts
                    </button>
                    
                </div>

                <div className="bg-gray-800 p-4 rounded-lg overflow-auto max-w-[80vw]">
                    <h3 className="font-semibold text-lg text-blue-300">Behavior Log</h3>
                    <div className="overflow-x-auto max-w-full">
                        <div className="w-full overflow-x-auto">
                            <table id="behaviorTable" className="w-max border-collapse border border-gray-700 text-white">
                                <thead>
                                    <tr className="bg-gray-700">
                                        <th className="p-3 border border-gray-600">Category</th>
                                        <th className="p-3 border border-gray-600">Log</th>
                                        {[...Array(31)].map((_, i) => (
                                            <th key={i} className="p-3 border border-gray-600">{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(
                                        filteredCharts.reduce((acc, chart) => {
                                            chart.behaviors.forEach((behavior) => {
                                                if (!acc[behavior.category]) {
                                                    acc[behavior.category] = [];
                                                }
                                                let existingRow = acc[behavior.category].find(row => row.behavior === behavior.behavior);
                                                if (!existingRow) {
                                                    existingRow = {
                                                        behavior: behavior.behavior,
                                                        days: Array(31).fill(""),
                                                    };
                                                    acc[behavior.category].push(existingRow);
                                                }
                                                const chartDate = new Date(chart.dateTaken);
                                                const utcYear = chartDate.getUTCFullYear();
                                                const utcMonth = chartDate.getUTCMonth();
                                                const utcDay = chartDate.getUTCDate();

                                                const adjustedDate = new Date(Date.UTC(utcYear, utcMonth, utcDay));
                                                existingRow.days[adjustedDate.getUTCDate() - 1] = behavior.status === "Yes" ? "✔️" : "❌";
                                            });
                                            return acc;
                                        }, {})
                                    ).map(([category, behaviors], categoryIndex) =>
                                        behaviors.map((row, behaviorIndex) => (
                                            <tr key={`${categoryIndex}-${behaviorIndex}`} className="bg-gray-900 text-gray-300">
                                                {behaviorIndex === 0 && (
                                                    <td className="p-2 border border-gray-700 text-center font-bold" rowSpan={behaviors.length}>
                                                        {category}
                                                    </td>
                                                )}
                                                <td className="p-2 border border-gray-700">{row.behavior}</td>
                                                {row.days.map((status, i) => (
                                                    <td key={i} className="p-2 border border-gray-700 text-center">{status}</td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>

    );
};

export default AllCharts;
