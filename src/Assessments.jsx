import React, { useState, useEffect } from "react";
import { getData } from "../services/updatedata";
import { Bell, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import AllAssessments from "./assessment/components/AllAssessments";

const ASSESSMENT_URL = "https://patient-care-server.onrender.com/api/v1/assessments";

const Assessment = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAssessments, setShowAssessments] = useState(false);
    const [hasDueAssessments, setHasDueAssessments] = useState(false);
    const [urgentCount, setUrgentCount] = useState(0);
    const [showAllAssessments, setShowAllAssessments] = useState(false);

    useEffect(() => {
        getDueAssessments();
    }, []);

    const getDueAssessments = () => {
        setLoading(true);
        getData(ASSESSMENT_URL)
            .then((data) => {
                const assessmentsData = data?.responseObject || [];
                setAssessments(assessmentsData);
                
                // Check if there are any due assessments
                const hasUrgent = checkForUrgentAssessments(assessmentsData);
                setHasDueAssessments(assessmentsData.length > 0);
                setUrgentCount(hasUrgent);
            })
            .catch(() => {
                setAssessments([]);
                setHasDueAssessments(false);
                setUrgentCount(0);
            })
            .finally(() => setLoading(false));
    };

    const checkForUrgentAssessments = (assessments) => {
        const today = new Date();
        let urgentCount = 0;
        
        assessments.forEach(assessment => {
            const assessmentNextDate = new Date(assessment.assessmentNextDate);
            const ncpNextDate = new Date(assessment.NCPNextDate);
            
            // Check if any due date is within 2 days
            const assessmentDaysRemaining = Math.ceil((assessmentNextDate - today) / (1000 * 60 * 60 * 24));
            const ncpDaysRemaining = Math.ceil((ncpNextDate - today) / (1000 * 60 * 60 * 24));
            
            if (assessmentDaysRemaining <= 2 || ncpDaysRemaining <= 2) {
                urgentCount++;
            }
        });
        
        return urgentCount;
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

    const toggleAssessments = () => {
        setShowAssessments(!showAssessments);
    };

    const handleViewAll = () => {
        setShowAssessments(false);  // Close the dropdown
        setShowAllAssessments(true);  // Open the "View All" modal
    };

    const handleCloseAllAssessments = () => {
        setShowAllAssessments(false);
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button 
                className="flex flex-col items-center cursor-pointer relative"
                onClick={toggleAssessments}
            >
                <Bell className="text-blue-400 text-xl" />
                <span className="text-sm text-gray-400">Assessments</span>
                
                {/* Notification Badge */}
                {hasDueAssessments && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {assessments.length}
                    </span>
                )}
                
                {/* Urgent Indicator (optional) */}
                {urgentCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        !
                    </span>
                )}
            </button>

            {/* Assessment Dropdown Panel */}
            {showAssessments && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
                    <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                        <h3 className="font-bold">Due Assessments</h3>
                        <button 
                            onClick={toggleAssessments}
                            className="text-white hover:text-gray-200"
                        >
                            ✖
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="p-4 text-center text-gray-600">
                            Loading assessments...
                        </div>
                    ) : assessments.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto">
                            {assessments.map((assessment) => {
                                const assessmentDays = getDaysRemaining(assessment.assessmentNextDate);
                                const ncpDays = getDaysRemaining(assessment.NCPNextDate);
                                const assessmentColor = getUrgencyColor(assessmentDays);
                                const ncpColor = getUrgencyColor(ncpDays);
                                
                                return (
                                    <div 
                                        key={assessment.assessmentId} 
                                        className="p-3 border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-800">{assessment.residentName}</h4>
                                            <span className="text-sm text-gray-500">SW: {assessment.socialWorker}</span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Calendar size={16} className="text-blue-500" />
                                            <span className="text-sm text-gray-700">
                                                Assessment: {assessment.assessmentNextDate}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${assessmentColor}`}>
                                                {assessmentDays < 0 ? 'Overdue' : `${assessmentDays} days left`}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Calendar size={16} className="text-purple-500" />
                                            <span className="text-sm text-gray-700">
                                                NCP: {assessment.NCPNextDate}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${ncpColor}`}>
                                                {ncpDays < 0 ? 'Overdue' : `${ncpDays} days left`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-600 flex flex-col items-center">
                            <CheckCircle size={32} className="text-green-500 mb-2" />
                            <p>No assessments due at this time.</p>
                        </div>
                    )}
                    
                    {/* Action buttons */}
                    {assessments.length > 0 && (
                        <div className="p-3 bg-gray-50 flex justify-end space-x-2">
                            <button 
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                onClick={handleViewAll}
                            >
                                View All
                            </button>
                            <button 
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm" 
                                onClick={toggleAssessments}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* All Assessments Modal */}
            {/* {showAllAssessments && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <AllAssessments onClose={handleCloseAllAssessments} />
                </div>
            )} */}

            {showAllAssessments &&(
            <div
                className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
                onClick={() => setShowAllAssessments(false)}
            >
                <div
                className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                >
                <AllAssessments onClose={handleCloseAllAssessments} />
                <button
                    className="absolute top-2 right-2 text-white hover:text-gray-400"
                    onClick={() => setShowAllAssessments(false)}
                >
                    ✖
                </button>
                </div>
            </div>
            )}
        </div>
    );
};

export default Assessment;