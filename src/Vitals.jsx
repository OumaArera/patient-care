import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getVitals } from "../services/getVitals";
import { Loader } from "lucide-react";

const Vitals = () =>{
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingUpdates, setLoadingUpdates] = useState(false);
    const [patients, setPatients] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [loadingVitals, setLoadingVitals] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
            setLoadingPatients(true);
            fetchPatients()
                .then((data) => {
                    setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                    setLoadingPatients(false);
                })
                .catch(() => {
                    setLoadingPatients(false);
                });
        }, []);

    const fetchVitals = (patientId) => {
        setLoadingVitals(true);
            getVitals(patientId)
                .then((data) => {
                    console.log("Data: ", data);
                    setVitals(data || []);
                    setLoadingVitals(false);
                })
                .catch(() => setLoadingVitals(false));
    };
    const handlePatientChange = (event) => {
        const patientId = event.target.value;
        setSelectedPatient(patientId);
        fetchVitals(patientId);
    };
    
        return (
            <div className="p-6 bg-gray-900 text-white min-h-screen">
                <h2 className="text-2xl font-bold mb-4 text-blue-400">Resident Updates</h2>
                <div className="mb-4 flex space-x-4">
                {loadingPatients ? (
                    <div className="flex justify-center items-center">
                        <Loader className="animate-spin text-blue-400" size={24} />
                        <p className="text-gray-400">Loading residents...</p>
                    </div>
                ) : (
                    <select
                        className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
                        onChange={handlePatientChange}
                        value={selectedPatient || ""}
                    >
                        <option value="">Select a Resident</option>
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
            </div>
        )

}

export default Vitals;