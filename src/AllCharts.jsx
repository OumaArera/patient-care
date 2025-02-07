import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import { Check, X } from "lucide-react";
import { jsPDF } from "jspdf";
import { fetchPatients } from "../services/fetchPatients";
import { getCharts } from "../services/getCharts";

const AllCharts = () => {
    const [patients, setPatients] = useState([]);
    const [charts, setCharts] = useState([]);
    const [filteredCharts, setFilteredCharts] = useState([]);
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingCharts, setLoadingCharts] = useState(false);
    const role = localStorage.getItem("role");
    const pdfRef = useRef();

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients()
            .then((data) => {
                setPatients(data?.responseObject || []);
                setLoadingPatients(false);
            })
            .catch(() => setLoadingPatients(false));
    }, []);

    const getAllCharts = (patientId) => {
        setLoadingCharts(true);
        getCharts(patientId)
            .then((data) => {
                setCharts(data?.responseObject || []);
                setLoadingCharts(false);
            })
            .catch(() => setLoadingCharts(false));
    };

    useEffect(() => {
        if (selectedMonth) {
            const filtered = charts.filter(chart => 
                moment(chart.dateTaken).year() === selectedYear &&
                moment(chart.dateTaken).month() + 1 === selectedMonth
            );
            setFilteredCharts(filtered);
        }
    }, [selectedYear, selectedMonth, charts]);

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Patient Chart Report", 10, 10);
        doc.save("chart-report.pdf");
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold">Patient Charts</h2>
            {loadingPatients ? (
                <p className="text-gray-500">Loading patients, please wait...</p>
            ) : (
                <select onChange={(e) => getAllCharts(e.target.value)}>
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                        <option key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
                </select>
            )}
            <select onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => moment().year() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <select onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                {Array.from({ length: selectedYear === moment().year() ? moment().month() + 1 : 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>{moment().month(month - 1).format("MMMM")}</option>
                ))}
            </select>
            <button onClick={downloadPDF} className="bg-blue-600 text-white px-4 py-2 rounded">Download PDF</button>
            {loadingCharts ? (
                <p className="text-gray-500 mt-4">Loading charts, please wait...</p>
            ) : (
                <div className="overflow-x-auto overflow-y-auto max-h-96 mt-4 border rounded p-4 bg-white" ref={pdfRef}>
                    <table className="w-full border">
                        <thead>
                            <tr>
                                <th className="border p-2">Category</th>
                                {Array.from({ length: moment(`${selectedYear}-${selectedMonth}`, "YYYY-MM").daysInMonth() }, (_, i) => i + 1).map(day => (
                                    <th key={day} className="border p-2">{day}</th>
                                ))}
                                {role === "superuser" && <th className="border p-2">Reason Not Filled</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCharts.filter(chart => !(role === "manager" && chart.status === "pending")).map(chart => (
                                <tr key={chart.chartId}>
                                    <td className="border p-2">{chart.behaviorsCategory}</td>
                                    {Array.from({ length: moment(`${selectedYear}-${selectedMonth}`, "YYYY-MM").daysInMonth() }, (_, i) => i + 1).map(day => {
                                        const entry = chart.behaviors.find(b => moment(b.dateTaken).date() === day);
                                        return <td key={day} className="border p-2">{entry ? (entry.status === "Yes" ? <Check className="text-green-500" /> : <X className="text-red-500" />) : (role === "superuser" ? "Missing" : "")}</td>;
                                    })}
                                    {role === "superuser" && <td className="border p-2">{chart.reasonNotFilled || ""}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AllCharts;