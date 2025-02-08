import React, { useState, useEffect, useRef } from "react";
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
    const reportRef = useRef();

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
                return date.getFullYear() === parseInt(selectedYear) && date.getMonth() + 1 === parseInt(selectedMonth);
            });
            setFilteredCharts(filtered);
        }
    };

    return (
        <div className="p-6 bg-white text-gray-900">
            <h2 className="text-2xl font-bold text-center mb-4">1st EDMONDS</h2>
            <div className="mb-4">
                {loadingPatients && (
                <div className="flex items-center space-x-2">
                    <Loader className="animate-spin text-gray-500" size={20} />
                    <p className="text-gray-500">Loading patients...</p>
                </div>)}
                
                <label className="font-semibold">Select Patient: </label>
                <select className="border px-4 py-2 ml-2" onChange={handlePatientChange} value={selectedPatient || ""}>
                    <option value="">-- Select --</option>
                    {patients.map((p) => (
                        <option key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
                </select>
            </div>
            {loadingCharts && (
                <div className="flex items-center space-x-2">
                    <Loader className="animate-spin text-gray-500" size={20} />
                    <p className="text-gray-500">Loading charts...</p>
                </div>)}
            {charts.length > 0 && (
                <div className="mb-4">
                    <label className="font-semibold">Select Year: </label>
                    <select className="border px-4 py-2 ml-2" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="">-- Select Year --</option>
                        {getAvailableYears().map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <label className="font-semibold ml-4">Select Month: </label>
                    <select className="border px-4 py-2 ml-2" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={!selectedYear}>
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
                
                    <>
                        <button className="mb-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => generatePDFReport(filteredCharts, selectedYear, selectedMonth)}>Download Report</button>
                    </>
                    <div className="border p-4 overflow-auto max-h-[600px]" ref={reportRef}>
                        <h3 className="font-semibold text-lg">Behavior Log</h3>
                        <div className="overflow-x-auto max-w-full">
                            <table id="behaviorTable" className="border w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border p-2">Category</th>
                                        <th className="border p-2">Log</th>
                                        {[...Array(31)].map((_, i) => (
                                            <th key={i} className="border p-2">{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCharts.reduce((acc, chart) => {
                                        chart.behaviors.forEach((behavior) => {
                                            let existingRow = acc.find(row => row.behavior === behavior.behavior);
                                            if (!existingRow) {
                                                existingRow = { category: behavior.category, behavior: behavior.behavior, days: Array(31).fill(""), rowspan: 1 };
                                                acc.push(existingRow);
                                            } else {
                                                existingRow.rowspan++;
                                            }
                                            existingRow.days[new Date(chart.dateTaken).getDate() - 1] = behavior.status === "Yes" ? "✔️" : "❌";
                                        });
                                        return acc;
                                    }, []).map((row, index, arr) => (
                                        <tr key={index}>
                                            {index === 0 || arr[index - 1].category !== row.category ? (
                                                <td className="border p-2" rowSpan={arr.filter(r => r.category === row.category).length}>{row.category}</td>
                                            ) : null}
                                            <td className="border p-2">{row.behavior}</td>
                                            {row.days.map((status, i) => (
                                                <td key={i} className="border p-2 text-center">{status}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AllCharts;
