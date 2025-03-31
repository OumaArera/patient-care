import React, { useState } from "react";
import { createData } from "../services/updatedata";
import { getData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";

const INCIDENT_URL = "https://patient-care-server.onrender.com/api/v1/incidents";

const Incident = () => {
    const [details, setDetails] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== "application/pdf") {
            setError("Only PDF files are allowed.");
            setFile(null);
            return;
        }
        if (selectedFile && selectedFile.size > 30 * 1024 * 1024) {
            setError("File size must be less than 30MB.");
            setFile(null);
            return;
        }
        setError("");
        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        if (!details.trim()) {
            setError("Incident details cannot be empty.");
            return;
        }

        if (!file) {
            setError("Please upload a PDF file.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        // Create FormData object
        const formData = new FormData();
        formData.append("details", details);
        formData.append("filePath", file);

        try {
            // Custom fetch for FormData
            const response = await fetch(INCIDENT_URL, {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                setErrors(errorHandler(responseData?.error || "Server error"));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Incident submitted successfully");
                setFile(null);
                setDetails("");
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Report an Incident</h2>
            
            <textarea
                className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded mb-4"
                rows="5"
                placeholder="Enter incident details..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
            ></textarea>
            
            <div className="mb-4">
                <input
                    type="file"
                    accept="application/pdf"
                    className="block w-full text-white bg-gray-800 border border-gray-700 rounded p-2"
                    onChange={handleFileChange}
                />
                {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
                {file && <p className="mt-1 text-sm text-green-400">File selected: {file.name}</p>}
            </div>
            
            {errors.length > 0 && (
                <div className="mt-4 p-3 rounded bg-red-900 bg-opacity-20">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-400">{error}</p>
                    ))}
                </div>
            )}
            
            {message && (
                <p className="mt-4 text-center font-medium text-blue-400">{message}</p>
            )}
            
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isSubmitting ? (
                    <>
                        <Loader className="animate-spin mr-2 h-4 w-4" />
                        Submitting...
                    </>
                ) : (
                    "Submit"
                )}
            </button>
        </div>
    );
};

export default Incident;