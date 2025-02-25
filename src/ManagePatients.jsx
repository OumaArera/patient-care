import React, {useState} from "react";
import { deletePatientManagers } from "../services/deletePatient";


const ManagePatient = ({ patientManagers, fetchData }) => {
    const [errors, setErrors] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);



    const handleDelete = async (id) => {
        if (!id) return;
        setSubmitting(true);
        try {
            const result = await deletePatientManagers(id);
            if (result?.error) {
                setErrors(result.error);
                setTimeout(() => setErrors(""), 5000);
            } else {
                setMessage("Patient manager deleted successfully");
                setTimeout(() => setMessage(""), 5000)
                fetchData()
            }
            
        } catch (error) {
            setErrors("An error occured while, please try again.");
            setTimeout(() => setErrors(""), 5000);
        } finally{
            setSubmitting(false);
        }
        
    };

    return (
        <div className="overflow-x-auto">
            {errors && <p className="text-red-500">{errors}</p>}
            {message && <p className="text-green-500">{message}</p>}
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-700">
                        <th className="border border-gray-300 px-4 py-2">Patient Name</th>
                        <th className="border border-gray-300 px-4 py-2">Care Giver</th>
                        <th className="border border-gray-300 px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {patientManagers.map((manager) => (
                        <tr key={manager.patientManagerId} className="text-center">
                            <td className="border border-gray-300 px-4 py-2">
                                {manager.patient.firstName} {manager.patient.lastName}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                {manager.careGiver.firstName} {manager.careGiver.lastName}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <button
                                    onClick={() => handleDelete(manager.patientManagerId)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                >
                                    {submitting ? "Deleting..." : "Delete"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManagePatient;
