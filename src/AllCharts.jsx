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

    const filterCharts = () => {
        if (selectedYear && selectedMonth) {
            const filtered = charts.filter(chart => {
                const date = new Date(chart.dateTaken);
                return date.getFullYear() === parseInt(selectedYear) && date.getMonth() + 1 === parseInt(selectedMonth);
            });
            setFilteredCharts(filtered);
        }
    };

    const downloadReport = () => {
        html2canvas(reportRef.current, { scale: 2 }).then(canvas => {
            const link = document.createElement("a");
            document.body.appendChild(link);
            link.href = canvas.toDataURL("image/png");
            link.download = "Behavior_Log.png";
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <div className="p-6 bg-white text-gray-900">
            <h2 className="text-2xl font-bold text-center mb-4">1st EDMONDS</h2>
            <div className="mb-4">
                {loadingPatients && <p>Loading patients...</p>}
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
            {charts.length > 0 && (
                <div className="mb-4">
                    <label className="font-semibold">Select Year: </label>
                    <select className="border px-4 py-2 ml-2" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="">-- Select Year --</option>
                        {[...Array(10)].map((_, i) => {
                            const year = new Date().getFullYear() - i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>
                    <label className="font-semibold ml-4">Select Month: </label>
                    <select className="border px-4 py-2 ml-2" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        <option value="">-- Select Month --</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={filterCharts}>Filter</button>
                </div>
            )}
            {filteredCharts.length > 0 && (
                <>
                    <button className="mb-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={downloadReport}>Download Report</button>
                    <div className="border p-4 overflow-auto max-h-[600px]" ref={reportRef}>
                        <h3 className="font-semibold text-lg">Behavior Log</h3>
                    </div>
                </>
            )}
        </div>
    );
};

export default AllCharts;
