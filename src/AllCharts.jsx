import React, { useState, useEffect, useRef } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCharts } from "../services/getCharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const AllCharts = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [charts, setCharts] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingCharts, setLoadingCharts] = useState(false);
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

    const downloadReport = () => {
        html2canvas(reportRef.current).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
            pdf.save("Behavior_Log.pdf");
        });
    };

    return (
        <div className="p-6 bg-white text-gray-900">
            <h2 className="text-2xl font-bold text-center mb-4">1st EDMONDS</h2>
            <div className="mb-4">
            {loadingPatients && <p>Loading patients...</p>}
                <label className="font-semibold">Select Patient: </label>
                <select
                    className="border px-4 py-2 ml-2"
                    onChange={handlePatientChange}
                    value={selectedPatient || ""}
                >
                    <option value="">-- Select --</option>
                    {patients.map((p) => (
                        <option key={p.patientId} value={p.patientId}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
                </select>
            </div>
            {loadingCharts && <p>Loading charts...</p>}
            {charts.length > 0 && (
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
                                {charts.reduce((acc, chart) => {
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
                    <button
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={downloadReport}
                    >
                        Download Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllCharts;
