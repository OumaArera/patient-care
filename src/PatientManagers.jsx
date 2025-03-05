import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { getCareGivers } from "../services/getCareGivers";
import { fetchBranches } from "../services/fetchBranches";
import { updateData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";
const URL = "https://patient-care-server.onrender.com/api/v1/users"

const PatientManager = () => {
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [careGivers, setCareGivers] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [selectedCareGiver, setSelectedCareGiver] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [edting, setEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const fetchData = async () => {
        setLoading(true);
        try {
            const [patientsData, careGiversData, branchesData] = await Promise.all([
                fetchPatients(),
                getCareGivers(),
                fetchBranches()
            ]);

            const patientsList = patientsData.responseObject || [];
            const careGiversList = careGiversData.responseObject || [];
            const branchesList = branchesData.responseObject || [];

            // Sort caregivers alphabetically
            careGiversList.sort((a, b) => a.fullName.localeCompare(b.fullName));

            setBranches(branchesList);
            setCareGivers(careGiversList);

            // Group patients and caregivers by branchName
            const grouped = {};
            careGiversList.forEach(cg => {
                if (!grouped[cg.branchName]) {
                    grouped[cg.branchName] = { caregivers: [], patients: [] };
                }
                grouped[cg.branchName].caregivers.push(cg.fullName);
            });

            patientsList.forEach(p => {
                if (!grouped[p.branchName]) {
                    grouped[p.branchName] = { caregivers: [], patients: [] };
                }
                grouped[p.branchName].patients.push(`${p.firstName} ${p.lastName}`);
            });

            setGroupedData(grouped);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async () => {
        if (!selectedBranch || !selectedCareGiver) return;
        setEditing(true);
        const updatedURL = `${URL}/${selectedCareGiver}`;
        try {
            const response = await updateData(updatedURL, {branch: selectedBranch});
                    
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Data updated successfully");
                setSelectedBranch(null);
                setSelectedCareGiver(null);
                setTimeout(() => fetchData(), 5000);
                setTimeout(() => setMessage(""), 5000);
                
            }
            
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setEditing(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Resident Manager</h1>

            {/* Branch Selection */}
            <div className="mb-4">
                <label className="block mb-2">Select a Branch:</label>
                <select
                    className="p-2 bg-gray-700 rounded w-full"
                    onChange={(e) => setSelectedBranch(e.target.value)}
                >
                    <option value="">-- Choose a Branch --</option>
                    {branches.map(branch => (
                        <option key={branch.branchId} value={branch.branchId}>
                            {branch.branchName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Caregiver Selection */}
            <div className="mb-4">
                <label className="block mb-2">Select a Caregiver:</label>
                <select
                    className="p-2 bg-gray-700 rounded w-full"
                    onChange={(e) => setSelectedCareGiver(e.target.value)}
                >
                    <option value="">-- Choose a Caregiver --</option>
                    {careGivers.map(cg => (
                        <option key={cg.userId} value={cg.userId}>{cg.fullName}</option>
                    ))}
                </select>
            </div>
            {errors.length > 0 && (
                <div className="mb-4 p-3 rounded">
                    {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                </div>
                )}
            {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}
            {/* Assign Button */}
            <button
                onClick={handleAssign}
                className="mb-4 bg-blue-500 px-4 py-2 rounded disabled:opacity-50"
                disabled={!selectedCareGiver || !selectedBranch}
            >
                {edting ? "Submitting...." : "Assign"}
            </button>

            {loading && <Loader className="animate-spin" />}

            {!loading && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-600">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="border p-2 w-1/4">Branch</th>
                                <th className="border p-2">Caregivers</th>
                                <th className="border p-2">Residents</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedData).map(([branch, data]) => (
                                <tr key={branch} className="border border-gray-600">
                                    <td className="border p-2">{branch}</td>
                                    <td className="border p-2">
                                        {data.caregivers.length > 0 ? (
                                            data.caregivers.map((cg, index) => (
                                                <div key={index}>{cg}</div>
                                            ))
                                        ) : (
                                            <span className="text-gray-400">No caregivers</span>
                                        )}
                                    </td>
                                    <td className="border p-2">
                                        {data.patients.length > 0 ? (
                                            data.patients.map((p, index) => (
                                                <div key={index}>{p}</div>
                                            ))
                                        ) : (
                                            <span className="text-gray-400">No residents</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PatientManager;