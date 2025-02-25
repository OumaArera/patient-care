import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { fetchMedications } from "../services/fetchMedications";
import MedicationCard from "./MedicationCard";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";

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
    console.log("Medications: ", medications);
    
    const handleMedications =()=>{
        if (!formData.patient) {
            setMedications([]);
            return;
        }
        setLoadingMedications(true);
        fetchMedications(pageNumber, pageSize, formData.patient)
            .then((data) => {
                setMedications(data);
                setLoadingMedications(false);
            })
            .catch(() => {
                setError("Failed to fetch medications.");
                setLoadingMedications(false);
            });

    }
    useEffect(() => {
        handleMedications();
    }, [pageNumber, pageSize, formData.patient]);

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
                {/* Resident selection first */}
                <div className="flex flex-col">
                    <label className="text-sm mb-1 capitalize" htmlFor="patient">
                        Resident
                    </label>
                    <div>
                        {loadingPatients ? (
                            <div className="flex items-center space-x-2">
                                <Loader className="animate-spin text-gray-500" size={20} />
                                <p className="text-gray-500">Loading residents...</p>
                            </div>
                        ) : (
                            <select
                                name="patient"
                                value={formData.patient}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full bg-gray-700 text-white"
                                required
                            >
                                <option value="">Select a Resident</option>
                                {patients.map((patient) => (
                                    <option key={patient.patientId} value={patient.patientId}>
                                        {patient.firstName} {patient.lastName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                
                {/* Other fields */}
                {Object.keys(formData).map((key) => (
                    key !== "patient" && (
                        <div key={key} className="flex flex-col">
                            <label className="text-sm mb-1 capitalize" htmlFor={key}>
                                {key.replace(/([A-Z])/g, " $1").trim()}
                            </label>
                            {key === "instructions" ? (
                                <select
                                name={key}
                                value={formData[key]}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full bg-gray-700 text-white"
                                required
                            >
                                <option value="">Select Instructions</option>
                                <option value="t.i.d">t.i.d - Thrice daily</option>
                                <option value="q.i.d">q.i.d - Four times daily</option>
                                <option value="b.i.d">b.i.d - Twice daily</option>
                                <option value="PRN">PRN - As needed</option>
                                <option value="h.s">h.s - Hour of sleep</option>
                                <option value="am">am - Morning</option>
                                <option value="pm">pm - Evening</option>
                            </select>
                            ) : key === "diagnosis"?(
                                <textarea
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="border p-2 rounded w-full bg-gray-700 text-white"
                                    required
                                    placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`}
                                ></textarea>
                            ): key === "medicationTime" ?(
                                <div>
                                    {formData.instructions ? (
                                        formData.instructions === "t.i.d" ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                {[...Array(3)].map((_, index) => (
                                                    <input
                                                        key={index}
                                                        type="time"
                                                        name={`medicationTime${index}`}
                                                        value={formData.medicationTime[index] || ""}
                                                        onChange={(e) => {
                                                            const newTimes = [...(formData.medicationTime || [])];
                                                            newTimes[index] = e.target.value;
                                                            setFormData({ ...formData, medicationTime: newTimes });
                                                        }}
                                                        className="border p-2 rounded w-full bg-gray-700 text-white"
                                                        required
                                                    />
                                                ))}
                                            </div>
                                        ) : formData.instructions === "q.i.d" ? (
                                            <div className="grid grid-cols-4 gap-2">
                                                {[...Array(4)].map((_, index) => (
                                                    <input
                                                        key={index}
                                                        type="time"
                                                        name={`medicationTime${index}`}
                                                        value={formData.medicationTime[index] || ""}
                                                        onChange={(e) => {
                                                            const newTimes = [...(formData.medicationTime || [])];
                                                            newTimes[index] = e.target.value;
                                                            setFormData({ ...formData, medicationTime: newTimes });
                                                        }}
                                                        className="border p-2 rounded w-full bg-gray-700 text-white"
                                                        required
                                                    />
                                                ))}
                                            </div>
                                        ) : formData.instructions === "b.i.d" ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {[...Array(2)].map((_, index) => (
                                                    <input
                                                        key={index}
                                                        type="time"
                                                        name={`medicationTime${index}`}
                                                        value={formData.medicationTime[index] || ""}
                                                        onChange={(e) => {
                                                            const newTimes = [...(formData.medicationTime || [])];
                                                            newTimes[index] = e.target.value;
                                                            setFormData({ ...formData, medicationTime: newTimes });
                                                        }}
                                                        className="border p-2 rounded w-full bg-gray-700 text-white"
                                                        required
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <input
                                                type="time"
                                                name="medicationTime"
                                                value={formData.medicationTime[0] || ""}
                                                onChange={(e) => setFormData({ ...formData, medicationTime: [e.target.value] })}
                                                className="border p-2 rounded w-full bg-gray-700 text-white"
                                                required
                                            />
                                        )
                                    ) : (
                                        <p className="text-red-500">Select instructions first</p>
                                    )}
                                </div>
                            ):(
                                <input
                                    type="text"
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleInputChange}
                                    className="border p-2 rounded w-full bg-gray-700 text-white"
                                    required
                                    placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`}
                                />
                            )}
                        </div>
                    )
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
                <div className="flex items-center space-x-2 mt-4">
                    <Loader className="animate-spin text-gray-500" size={20} />
                    <p className="text-gray-500">Loading medications...</p>
                </div>
            ) : (
                <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {Array.isArray(medications) && medications.length > 0 ? (
                        medications.map((med) => <MedicationCard key={med.medicationId} handleMedication={handleMedications} medication={med} />)
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
