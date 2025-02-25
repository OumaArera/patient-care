import React, { useState } from "react";
import { deletePatientManagers } from "../services/deletePatient";

const ManagePatient = ({ patientManagers, fetchData }) => {
    const [errors, setErrors] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Calculate total pages
    const totalPages = Math.ceil(patientManagers.length / itemsPerPage);

    // Get the residents for the current page
    const paginatedManagers = patientManagers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                setTimeout(() => setMessage(""), 5000);
                fetchData();
            }
        } catch (error) {
            setErrors("An error occurred, please try again.");
            setTimeout(() => setErrors(""), 5000);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="overflow-x-auto mt-6">
            {errors && <p className="text-red-500">{errors}</p>}
            {message && <p className="text-green-500">{message}</p>}

            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-700 text-white">
                        <th className="border border-gray-300 px-4 py-2">Resident Name</th>
                        <th className="border border-gray-300 px-4 py-2">Care Giver</th>
                        <th className="border border-gray-300 px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedManagers.map((manager) => (
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

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4 space-x-2">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded ${currentPage === 1 ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
                >
                    Previous
                </button>
                <span className="text-white px-4 py-2">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded ${currentPage === totalPages ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ManagePatient;
