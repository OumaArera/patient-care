import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCareGivers } from "../services/getCareGivers";
import { Loader } from "lucide-react";

const PatientManager = () => {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [careGivers, setCareGivers] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [selectedCareGiver, setSelectedCareGiver] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [patientsData, careGiversData] = await Promise.all([
                    fetchPatients(),
                    getCareGivers()
                ]);
                
                const patientsList = patientsData.responseObject || [];
                const careGiversList = careGiversData.responseObject || [];
                setPatients(patientsList);
                setCareGivers(careGiversList);
                
                // Group by branchName
                const grouped = {};
                careGiversList.forEach(cg => {
                    if (!grouped[cg.branchName]) {
                        grouped[cg.branchName] = { caregivers: [], patients: [] };
                    }
                    grouped[cg.branchName].caregivers.push(cg);
                });
                
                patientsList.forEach(p => {
                    if (!grouped[p.branchName]) {
                        grouped[p.branchName] = { caregivers: [], patients: [] };
                    }
                    grouped[p.branchName].patients.push(p);
                });
                
                setGroupedData(grouped);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogSelection = () => {
        console.log("Selected Caregiver:", selectedCareGiver);
        console.log("Selected Branch:", selectedBranch);
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Resident Manager</h1>
            {loading && <Loader className="animate-spin" />}
            {!loading && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-600">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="border p-2">Branch</th>
                                <th className="border p-2">Caregivers</th>
                                <th className="border p-2">Residents</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedData).map(([branch, data], index) => (
                                <tr key={branch} className="border border-gray-600">
                                    <td className="border p-2" rowSpan={Math.max(data.caregivers.length, data.patients.length) || 1}>{branch}</td>
                                    <td className="border p-2">
                                        {data.caregivers.map(cg => (
                                            <div key={cg.userId}>{cg.fullName}</div>
                                        ))}
                                    </td>
                                    <td className="border p-2">
                                        {data.patients.map(p => (
                                            <div key={p.patientId}>{p.firstName} {p.lastName}</div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4">
                {/* Branch Selection */}
                <label className="block mb-2">Select a Branch:</label>
                <select 
                    className="p-2 bg-gray-700 rounded w-full" 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                >
                    <option value="">-- Choose a Branch --</option>
                    {Object.keys(groupedData).map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                    ))}
                </select>
            </div>
            
            <div className="mt-4">
                {/* Caregiver Selection */}
                <label className="block mb-2">Select a Caregiver:</label>
                <select 
                    className="p-2 bg-gray-700 rounded w-full" 
                    onChange={(e) => setSelectedCareGiver(e.target.value)}
                >
                    <option value="">-- Choose a Caregiver --</option>
                    {careGivers
                        .filter(cg => !selectedBranch || cg.branchName === selectedBranch)
                        .map(cg => (
                            <option key={cg.userId} value={cg.userId}>{cg.fullName}</option>
                        ))}
                </select>
            </div>

            <button 
                onClick={handleLogSelection} 
                className="mt-4 bg-blue-500 px-4 py-2 rounded disabled:opacity-50"
            >
                Log Selection
            </button>
        </div>
    );
};

export default PatientManager;
