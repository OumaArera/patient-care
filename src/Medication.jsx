import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { fetchMedications } from "../services/fetchMedications";
import MedicationCard from "./MedicationCard";
import { errorHandler } from "../services/errorHandler";

const Medication = () => {
    const [medications, setMedications] = useState([]);
    const [patients, setPatients] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingMedications, setLoadingMedications] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState([]);

    const [formData, setFormData] = useState({
        medicationName: "",
        medicationCode: "",
        equivalentTo: "",
        instructions: "",
        quantity: "",
        diagnosis: "",
        medicationTime: "",
        patient: "",
    });

    useEffect(() => {
        setLoadingMedications(true);
        fetchMedications(pageNumber, pageSize)
            .then((data) => {
                setMedications(data);
                setLoadingMedications(false);
            })
            .catch(() => {
                setError("Failed to fetch medications.");
                setLoadingMedications(false);
            });
    }, [pageNumber, pageSize]);

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients()
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false); 
            })
            .catch(() => {
                setError("Failed to fetch patients.");
                setLoadingPatients(false); 
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors("");
        setError("");
        setSuccessMessage("");

        const token = localStorage.getItem("token");

        console.log(JSON.stringify(formData, null, 2));

        try {
            const response = await fetch("https://patient-care-server.onrender.com/api/v1/medications", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok){
                let errorString = result?.responseObject?.errors;
                setErrors(errorHandler(errorString));
            }else{
                setMedications([...medications, result.responseObject]);
                setSuccessMessage("Medication added successfully!");
                setFormData({
                    medicationName: "",
                    medicationCode: "",
                    equivalentTo: "",
                    instructions: "",
                    quantity: "",
                    diagnosis: "",
                    medicationTime: "",
                    patient: "",
                });
            }
        } catch (error) {
            setError(error.message || "Failed to add medication.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Manage Medications</h2>

            {error && <div className="bg-red-500 text-white p-3 mb-3 rounded">{error}</div>}
            {successMessage && <div className="bg-green-500 text-white p-3 mb-3 rounded">{successMessage}</div>}
            {submitting && <div className="bg-yellow-500 text-white p-3 mb-3 rounded">Submitting data...</div>}

            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md grid gap-4">
                {Object.keys(formData).map((key) => (
                    <div key={key} className="flex flex-col">
                        <label className="text-sm mb-1 capitalize" htmlFor={key}>
                            {key.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        {key === "instructions" || key === "diagnosis" ? (
                            <textarea
                                name={key}
                                value={formData[key]}
                                onChange={handleInputChange}
                                rows="4"
                                className="border p-2 rounded w-full bg-gray-700 text-white"
                                required
                            ></textarea>
                        ) : key === "patient" ? (
                            <select
                                name={key}
                                value={formData[key]}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full bg-gray-700 text-white"
                                required
                                disabled={loadingPatients}
                            >
                                <option value="">{loadingPatients ? "Loading patients..." : "Select a Patient"}</option>
                                {patients.map((patient) => (
                                    <option key={patient.patientId} value={patient.patientId}>
                                        {patient.firstName} {patient.lastName}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={key === "medicationTime" ? "time" : "text"}
                                name={key}
                                value={formData[key]}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full bg-gray-700 text-white"
                                required
                            />
                        )}
                    </div>
                ))}
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 w-full"
                    disabled={submitting}
                >
                    {submitting ? "Submitting..." : "Submit"}
                </button>
                {errors.length > 0 && (
                    <div className="mb-4 p-3 rounded">
                        {errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-600">{error}</p>
                        ))}
                    </div>
                )}
            </form>

            {loadingMedications ? (
                <div className="bg-yellow-500 text-white p-3 mt-4 rounded">Loading medications...</div>
            ) : (
                <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {Array.isArray(medications) && medications.length > 0 ? (
                        medications.map((med) => <MedicationCard key={med.medicationId} medication={med} />)
                    ) : (
                        <p className="text-gray-400">No medications found.</p>
                    )}
                </div>
            )}

            <div className="flex justify-between mt-4">
                <button
                    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
                    disabled={pageNumber === 1 || loadingMedications}
                >
                    Previous
                </button>
                <button
                    onClick={() => setPageNumber((prev) => prev + 1)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
                    disabled={loadingMedications}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Medication;
