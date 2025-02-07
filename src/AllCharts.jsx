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
                    <table id="behaviorTable" className="border w-full text-sm">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">Category</th>
                                <th className="border p-2">Log</th>
                                {/* Generate column headers based on days in the month */}
                                {[...Array(31)].map((_, i) => (
                                    <th key={i} className="border p-2">{i + 1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {charts.map((chart) =>
                                chart.behaviors.map((behavior, index) => (
                                    <tr key={index}>
                                        <td className="border p-2">{behavior.category}</td>
                                        <td className="border p-2">{behavior.behavior}</td>
                                        {[...Array(31)].map((_, i) => (
                                            <td key={i} className="border p-2 text-center">
                                                {new Date(chart.dateTaken).getDate() === i + 1 ?
                                                    (behavior.status === "Yes" ? "✔️" : "❌")
                                                    : ""}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <h3 className="text-lg font-semibold mt-6">Behavior Description</h3>
                    <table id="descriptionTable" className="border w-full text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Outcome</th>
                                <th className="border p-2">Trigger</th>
                                <th className="border p-2">Behavior Description</th>
                                <th className="border p-2">Care Giver Intervention</th>
                                <th className="border p-2">Reported Provider & Careteam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {charts.map((chart, index) => (
                                <tr key={index}>
                                    <td className="border p-2">{new Date(chart.dateTaken).toLocaleDateString()}</td>
                                    {chart.behaviorsDescription.map((desc, i) => (
                                        <td key={i} className="border p-2">{desc.response}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-6">
                        <h4 className="font-semibold">Caregiver Signature</h4>
                        <div className="flex gap-4 mt-2">
                            <div className="border p-4 w-1/2">Caregiver 1: __________________</div>
                            <div className="border p-4 w-1/2">Caregiver 2: __________________</div>
                        </div>
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
