import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCharts } from "../services/getCharts";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const AllCharts = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [charts, setCharts] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingCharts, setLoadingCharts] = useState(false);

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

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text("1st EDMONDS", 14, 15);
        doc.autoTable({ html: "#behaviorTable" });
        doc.autoTable({ html: "#descriptionTable" });
        doc.save("Behavior_Log.pdf");
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
                <>
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
                                        let existingRow = acc.find(row => row.category === behavior.category && row.behavior === behavior.behavior);
                                        if (!existingRow) {
                                            existingRow = { category: behavior.category, behavior: behavior.behavior, days: Array(31).fill("") };
                                            acc.push(existingRow);
                                        }
                                        existingRow.days[new Date(chart.dateTaken).getDate() - 1] = behavior.status === "Yes" ? "✔️" : "❌";
                                    });
                                    return acc;
                                }, []).map((row, index) => (
                                    <tr key={index}>
                                        <td className="border p-2">{row.category}</td>
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
                        onClick={generatePDF}
                    >
                        Download PDF
                    </button>
                </>
            )}
        </div>
    );
};

export default AllCharts;