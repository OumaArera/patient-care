import React, { useState, useEffect } from "react";
import { getData } from "../services/updatedata";
import { Calendar, User, Save, X, Edit, AlertTriangle } from "lucide-react";
import EditAssessment from "./EditAssessment";

const ASSESSMENT_URL = "https://patient-care-server.onrender.com/api/v1/assessments";

const AllAssessments = ({ onClose }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  useEffect(() => {
    fetchAllAssessments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assessments, searchTerm, filterOption]);

  const fetchAllAssessments = async () => {
    setLoading(true);
    try {
      const data = await getData(ASSESSMENT_URL);
      const assessmentsData = data?.responseObject || [];
      setAssessments(assessmentsData);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assessments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        assessment =>
          assessment.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.socialWorker.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    const today = new Date();
    switch (filterOption) {
      case "overdue":
        filtered = filtered.filter(assessment => {
          const assessmentDate = new Date(assessment.assessmentNextDate);
          const ncpDate = new Date(assessment.NCPNextDate);
          return assessmentDate < today || ncpDate < today;
        });
        break;
      case "upcoming":
        filtered = filtered.filter(assessment => {
          const assessmentDate = new Date(assessment.assessmentNextDate);
          const ncpDate = new Date(assessment.NCPNextDate);
          const twoDaysFromNow = new Date(today);
          twoDaysFromNow.setDate(today.getDate() + 7);
          
          return (assessmentDate >= today && assessmentDate <= twoDaysFromNow) || 
                 (ncpDate >= today && ncpDate <= twoDaysFromNow);
        });
        break;
      case "all":
      default:
        // No additional filtering
        break;
    }

    // Sort by urgency - overdue first, then by earliest due date
    filtered.sort((a, b) => {
      const aAssessDate = new Date(a.assessmentNextDate);
      const bAssessDate = new Date(b.assessmentNextDate);
      const aNCPDate = new Date(a.NCPNextDate);
      const bNCPDate = new Date(b.NCPNextDate);
      
      const aEarliest = aAssessDate < aNCPDate ? aAssessDate : aNCPDate;
      const bEarliest = bAssessDate < bNCPDate ? bAssessDate : bNCPDate;
      
      return aEarliest - bEarliest;
    });

    setFilteredAssessments(filtered);
  };

  const handleEditClick = (assessmentId) => {
    setEditingAssessmentId(assessmentId);
  };

  const handleUpdateSuccess = (updatedAssessment) => {
    setAssessments(prevAssessments => 
      prevAssessments.map(assessment => 
        assessment.assessmentId === updatedAssessment.assessmentId ? updatedAssessment : assessment
      )
    );
    setEditingAssessmentId(null);
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
    <div className="bg-gray-900 text-white rounded-lg shadow-lg w-full max-w-4xl">
      <div className="bg-blue-600 p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-bold">All Assessments</h2>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by resident or social worker..."
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <option value="all">All Assessments</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Due Soon (7 days)</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center p-6 text-gray-400">
            <AlertTriangle size={40} className="mx-auto mb-2" />
            <p>No assessments found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-96 pr-2">
            {filteredAssessments.map((assessment) => {
              const assessmentDays = getDaysRemaining(assessment.assessmentNextDate);
              const ncpDays = getDaysRemaining(assessment.NCPNextDate);
              const isEditing = editingAssessmentId === assessment.assessmentId;

              if (isEditing) {
                return (
                  <EditAssessment
                    key={assessment.assessmentId}
                    assessment={assessment}
                    onCancel={() => setEditingAssessmentId(null)}
                    onSuccess={handleUpdateSuccess}
                  />
                );
              }

              return (
                <div 
                  key={assessment.assessmentId}
                  className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{assessment.residentName}</h3>
                    <button 
                      onClick={() => handleEditClick(assessment.assessmentId)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-blue-400" />
                        <span className="text-gray-300">Social Worker:</span>
                        <span>{assessment.socialWorker}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-400" />
                        <span className="text-gray-300">Assessment Due:</span> 
                        <span className={assessmentDays < 0 ? "text-red-400" : "text-white"}>
                          {new Date(assessment.assessmentNextDate).toLocaleDateString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(assessmentDays)}`}>
                          {assessmentDays < 0 ? `${Math.abs(assessmentDays)}d overdue` : `${assessmentDays}d left`}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-purple-400" />
                        <span className="text-gray-300">NCP Due:</span>
                        <span className={ncpDays < 0 ? "text-red-400" : "text-white"}>
                          {new Date(assessment.NCPNextDate).toLocaleDateString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(ncpDays)}`}>
                          {ncpDays < 0 ? `${Math.abs(ncpDays)}d overdue` : `${ncpDays}d left`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="bg-gray-800 p-3 rounded-b-lg flex justify-end">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AllAssessments;