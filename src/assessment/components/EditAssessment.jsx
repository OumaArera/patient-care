import React, { useState } from "react";
import { Calendar, User, Save, X } from "lucide-react";
import { updateData } from "../../../services/updatedata";
import { errorHandler } from "../../../services/errorHandler";

const ASSESSMENT_URL = "https://patient-care-server.onrender.com/api/v1/assessments";

const EditAssessment = ({ assessment, fetchAllAssessments, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        assessmentNextDate: assessment.assessmentNextDate.split('T')[0], 
        NCPNextDate: assessment.NCPNextDate.split('T')[0], 
        socialWorker: assessment.socialWorker
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const updatedAssessment = {
                ...assessment,
                ...formData
            };

            const updatedURL = `${ASSESSMENT_URL}/${assessment.assessmentId}`;
            const result = await updateData(updatedURL, updatedAssessment);
            if (result?.error) {
                setErrors(errorHandler(response.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                onSuccess(result);
                fetchAllAssessments()
                setMessage(["Assessment updated successfully."]);
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (err) {
            setErrors(["Failed to update assessment. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
            console.error("Update failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-blue-500">
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
            <h3 className="font-semibold text-lg text-blue-300">{assessment.residentName}</h3>
            <p className="text-sm text-gray-400">Editing assessment details</p>
            </div>
            {message && <p className="text-green-600">{message}</p>}
            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-800 rounded">
                {errors.map((error, index) => (
                    <p key={index} className="text-sm text-white">{error}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
                <div>
                <label className="block text-sm text-gray-300 mb-1">
                    <User size={16} className="inline mr-1 text-blue-400" />
                    Social Worker
                </label>
                <input
                    type="text"
                    name="socialWorker"
                    value={formData.socialWorker}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    required
                />
                </div>
                
                <div>
                <label className="block text-sm text-gray-300 mb-1">
                    <Calendar size={16} className="inline mr-1 text-blue-400" />
                    Assessment Due Date
                </label>
                <input
                    type="date"
                    name="assessmentNextDate"
                    value={formData.assessmentNextDate}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    required
                />
                </div>
            </div>
            
            <div>
                <label className="block text-sm text-gray-300 mb-1">
                <Calendar size={16} className="inline mr-1 text-purple-400" />
                NCP Due Date
                </label>
                <input
                type="date"
                name="NCPNextDate"
                value={formData.NCPNextDate}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                required
                />
            </div>
            </div>

            <div className="flex justify-end space-x-3">
            <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 flex items-center"
                disabled={submitting}
            >
                <X size={16} className="mr-1" /> Cancel
            </button>
            <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center"
                disabled={submitting}
            >
                {submitting ? (
                <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                </>
                ) : (
                <>
                    <Save size={16} className="mr-1" /> Save Changes
                </>
                )}
            </button>
            </div>
        </form>
        </div>
    );
};

export default EditAssessment;