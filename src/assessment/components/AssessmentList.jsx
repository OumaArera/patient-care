import React, { useState, useEffect } from "react";
import { getData } from "../../../services/updatedata";
import { Search, Edit, Save, X, ArrowLeft } from "lucide-react";

const ASSESSMENT_URL = "https://patient-care-server.onrender.com/api/v1/assessments";

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    assessmentNextDate: "",
    NCPNextDate: "",
    socialWorker: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ show: false, success: false, message: "" });

  useEffect(() => {
    getAllAssessments();
  }, []);

  useEffect(() => {
    // Filter assessments when search term changes
    if (searchTerm.trim() === "") {
      setFilteredAssessments(assessments);
    } else {
      const filtered = assessments.filter(
        assessment => 
          assessment.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.socialWorker.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssessments(filtered);
    }
  }, [searchTerm, assessments]);

  const getAllAssessments = () => {
    setLoading(true);
    getData(ASSESSMENT_URL)
      .then((data) => {
        const assessmentsData = data?.responseObject || [];
        setAssessments(assessmentsData);
        setFilteredAssessments(assessmentsData);
      })
      .catch((error) => {
        console.error("Error fetching assessments:", error);
        setAssessments([]);
        setFilteredAssessments([]);
      })
      .finally(() => setLoading(false));
  };

  const handleEditClick = (assessment) => {
    setEditingId(assessment.assessmentId);
    setEditFormData({
      assessmentNextDate: assessment.assessmentNextDate,
      NCPNextDate: assessment.NCPNextDate,
      socialWorker: assessment.socialWorker
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      assessmentNextDate: "",
      NCPNextDate: "",
      socialWorker: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSubmitEdit = (assessmentId) => {
    setSubmitting(true);
    
    // Make PUT request to update the assessment
    updateAssessment(assessmentId, editFormData)
      .then(response => {
        // Update the local state to reflect changes
        const updatedAssessments = assessments.map(assessment => {
          if (assessment.assessmentId === assessmentId) {
            return { ...assessment, ...editFormData };
          }
          return assessment;
        });
        
        setAssessments(updatedAssessments);
        setFilteredAssessments(updatedAssessments);
        setEditingId(null);
        
        // Show success message
        setUpdateStatus({
          show: true,
          success: true,
          message: "Assessment updated successfully!"
        });
        
        // Hide message after 3 seconds
        setTimeout(() => {
          setUpdateStatus({ show: false, success: false, message: "" });
        }, 3000);
      })
      .catch(error => {
        console.error("Error updating assessment:", error);
        setUpdateStatus({
          show: true,
          success: false,
          message: "Failed to update assessment. Please try again."
        });
        
        setTimeout(() => {
          setUpdateStatus({ show: false, success: false, message: "" });
        }, 3000);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const updateAssessment = (assessmentId, updateData) => {
    return updateData(`${ASSESSMENT_URL}/${assessmentId}`, updateData);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    return daysRemaining;
  };

  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining < 0) return "text-red-500 bg-red-100";
    if (daysRemaining <= 2) return "text-orange-500 bg-orange-100";
    if (daysRemaining <= 5) return "text-yellow-500 bg-yellow-100";
    return "text-green-500 bg-green-100";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => window.history.back()} 
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">All Assessments</h2>
        </div>
        
        {/* Status message */}
        {updateStatus.show && (
          <div className={`px-4 py-2 rounded ${updateStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {updateStatus.message}
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by resident name or social worker..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
      </div>

      {/* Assessment list */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading assessments...</p>
        </div>
      ) : filteredAssessments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Resident</th>
                <th className="py-3 px-6 text-left">Social Worker</th>
                <th className="py-3 px-6 text-left">Assessment Date</th>
                <th className="py-3 px-6 text-left">NCP Date</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredAssessments.map((assessment) => {
                const assessmentDays = getDaysRemaining(assessment.assessmentNextDate);
                const ncpDays = getDaysRemaining(assessment.NCPNextDate);
                const isEditing = editingId === assessment.assessmentId;
                
                return (
                  <tr key={assessment.assessmentId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium">{assessment.residentName}</div>
                    </td>
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <input
                          type="text"
                          name="socialWorker"
                          value={editFormData.socialWorker}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        assessment.socialWorker
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <input
                          type="date"
                          name="assessmentNextDate"
                          value={editFormData.assessmentNextDate.split('T')[0]}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{formatDate(assessment.assessmentNextDate)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(assessmentDays)}`}>
                            {assessmentDays < 0 ? 'Overdue' : `${assessmentDays} days left`}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <input
                          type="date"
                          name="NCPNextDate"
                          value={editFormData.NCPNextDate.split('T')[0]}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{formatDate(assessment.NCPNextDate)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(ncpDays)}`}>
                            {ncpDays < 0 ? 'Overdue' : `${ncpDays} days left`}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {isEditing ? (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleSubmitEdit(assessment.assessmentId)}
                            disabled={submitting}
                            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(assessment)}
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No assessments found.</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentList;