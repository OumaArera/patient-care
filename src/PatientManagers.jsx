import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCareGivers } from "../services/getCareGivers";
import { postPatientManager } from "../services/postPatientManagers";
import { getpatientManagers } from "../services/getPatientManagers";
import ManagePatient from "./ManagePatients";
import { Loader } from "lucide-react";


const PatientManager = () => {
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingCareGivers, setLoadingCareGivers] = useState(false);
    const [patients, setPatients] = useState([]);
    const [careGivers, setCareGivers] = useState([]);
    const [errors, setErrors] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedCareGiver, setSelectedCareGiver] = useState(null);
    const [residents, setResidents] = useState(null);

    const fetchData = async () => {
        setLoadingPatients(true);
        setLoadingCareGivers(true);
        setErrors(null);

        try {
            const [patientManagersData, patientsData, careGiversData] = await Promise.all([
                getpatientManagers(),
                fetchPatients(),
                getCareGivers()
            ]);
            setResidents(Array.isArray(patientManagersData.responseObject) ? patientManagersData.responseObject : []);
            setPatients(Array.isArray(patientsData.responseObject) ? patientsData.responseObject : []);
            setCareGivers(Array.isArray(careGiversData.responseObject) ? careGiversData.responseObject : []);
            
        } catch (error) {
            setErrors("Failed to fetch data.");
        } finally {
            setLoadingPatients(false);
            setLoadingCareGivers(false);
        }
    };

    useEffect(() => {
        fetchData(); 
    }, []);
    


    const handleSubmit = async () => {
        if (!selectedPatient || !selectedCareGiver) return;
        setSubmitting(true);
        setErrors(null);
        const payload = { patient: selectedPatient.patientId, careGiver: selectedCareGiver.userId };
        try {
            const response = await postPatientManager(payload);
            if (response?.error) {
                setErrors(response?.error);
                setTimeout(() => setErrors(null), 5000);
            } else {
                fetchData();
                setMessage("Resident assigned successfully.");
            }
        } catch (err) {
            setErrors("Something went wrong. Please try again.");
            setTimeout(() => setErrors(null), 5000);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Resident Manager</h1>
            {errors && <p className="text-red-500">{errors}</p>}
            {message && <p className="text-green-500">{message}</p>}

            {/* Patient Selection */}
            <div className="mb-4">
                <label className="block mb-2">Select a Resident:</label>
                {loadingPatients ? <Loader className="animate-spin" /> : (
                    <select 
                        className="p-2 bg-gray-700 rounded w-full" 
                        onChange={(e) => setSelectedPatient(patients.find(p => p.patientId === Number(e.target.value)))}
                    >
                        <option value="">-- Choose a Resident --</option>
                        {[...patients]
                            .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                            .map((p) => (
                                <option key={p.patientId} value={p.patientId}>
                                    {p.firstName} {p.lastName}
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
                        {[...careGivers]
                            .sort((a, b) => a.fullName.localeCompare(b.fullName)) // Sorting caregivers alphabetically
                            .map(cg => (
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

            {residents && (
                <div className="mt-6"> {/* Add margin-top for spacing */}
                    <ManagePatient patientManagers={residents} fetchData={fetchData} />
                </div>
            )}
        </div>
    );
};

export default PatientManager;
