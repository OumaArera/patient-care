import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCareGivers } from "../services/getCareGivers";
import { postPatientManager } from "../services/postPatientManagers";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";

const PatientManager = () => {
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingCareGivers, setLoadingCareGivers] = useState(false);
    const [patients, setPatients] = useState([]);
    const [careGivers, setCareGivers] = useState([]);
    const [errors, setErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [patientManager, setPatientManager] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedCareGiver, setSelectedCareGiver] = useState(null);
    
    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients()
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false);
            })
            .catch(() => {
                setErrors(["Failed to fetch patients."]);
                setLoadingPatients(false);
            });
    }, []);

    useEffect(() => {
        setLoadingCareGivers(true);
        getCareGivers()
            .then((data) => {
                setCareGivers(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingCareGivers(false);
            })
            .catch(() => {
                setErrors(["Failed to fetch caregivers."]);
                setLoadingCareGivers(false);
            });
    }, []);


    const handleSubmit = async () => {
        if (!selectedPatient || !selectedCareGiver) return;
        setSubmitting(true);
        setErrors([]);

        const payload = { patient: selectedPatient.patientId, careGiver: selectedCareGiver.userId };
        console.log("Payload:", payload);
        try {
            const response = await postPatientManager(payload);
            if (response?.error) {
                setErrors(errorHandler(response.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setPatientManager(response.responseObject);
                setMessage("Chart data posted successfully.");
            }
        } catch (err) {
            setErrors(["Something went wrong. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Patient Manager</h1>
            {errors.length > 0 && (
                <div className="bg-red-100 p-3 rounded-md mb-4">
                    {errors.map((error, index) => (
                        <p key={index} className="text-red-700 text-sm">{error}</p>
                    ))}
                </div>
            )}
            {message && <p className="text-green-500">{message}</p>}

            {/* Patient Selection */}
            <div className="mb-4">
                <label className="block mb-2">Select a Patient:</label>
                {loadingPatients ? <Loader className="animate-spin" /> : (
                    <select 
                        className="p-2 bg-gray-700 rounded w-full" 
                        onChange={(e) => setSelectedPatient(patients.find(p => p.patientId === Number(e.target.value)))}
                    >
                        <option value="">-- Choose a Patient --</option>
                        {patients.map(patient => (
                            <option key={patient.patientId} value={patient.patientId}>
                                {patient.firstName} {patient.middleNames || ''} {patient.lastName}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Caregiver Selection */}
            <div className="mb-4">
                <label className="block mb-2">Select a Caregiver:</label>
                {loadingCareGivers ? <Loader className="animate-spin" /> : (
                    <select 
                        className="p-2 bg-gray-700 rounded w-full" 
                        onChange={(e) => setSelectedCareGiver(careGivers.find(cg => cg.userId === Number(e.target.value)))}
                    >
                        <option value="">-- Choose a Caregiver --</option>
                        {careGivers.map(cg => (
                            <option key={cg.userId} value={cg.userId}>{cg.fullName}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Submit Button */}
            <button 
                onClick={handleSubmit} 
                disabled={submitting} 
                className="bg-blue-500 px-4 py-2 rounded disabled:opacity-50"
            >
                {submitting ? "Submitting..." : "Submit"}
            </button>

            {/* Selected Patient Card */}
            {selectedPatient && (
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-4">
                    <h3 className="text-blue-400 font-bold text-xl">{selectedPatient.firstName} {selectedPatient.middleNames || ''} {selectedPatient.lastName}</h3>
                    <p>DOB: {selectedPatient.dateOfBirth}</p>
                    <p>Diagnosis: {selectedPatient.diagnosis}</p>
                    <p>Physician: {selectedPatient.physicianName}</p>
                </div>
            )}

            {/* Selected Caregiver Card */}
            {selectedCareGiver && (
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-4">
                    <h3 className="text-blue-400 font-bold text-xl">{selectedCareGiver.fullName}</h3>
                    <p>Email: {selectedCareGiver.email}</p>
                    <p>Phone: {selectedCareGiver.phoneNumber}</p>
                    <p>Role: {selectedCareGiver.role}</p>
                </div>
            )}

            {/* Assigned Patient Managers */}
            {patientManager.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold">Assigned Patient Managers</h2>
                    {patientManager.map(pm => (
                        <div key={pm.patientManagerId} className="bg-gray-700 p-4 rounded-lg mt-2">
                            <p>Patient: {pm.patient.firstName} {pm.patient.lastName}</p>
                            <p>Caregiver: {pm.careGiver.firstName} {pm.careGiver.lastName}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientManager;
