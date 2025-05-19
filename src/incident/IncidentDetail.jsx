import React, { useState, useEffect } from "react";
import { getData, updateData } from "../../services/updatedata";
import { errorHandler } from "../../services/errorHandler";
import { Loader, ArrowLeft, MessageSquare, AlertCircle } from "lucide-react";
import CommentSection from "./CommentSection";

const IncidentDetail = ({ incidentId, onBack }) => {
  const [incident, setIncident] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const role = localStorage.getItem("role") || "";
  const userId = parseInt(localStorage.getItem("userId")) || 0;
  const isSuperUser = role === "superuser";
  const currentUser = localStorage.getItem("fullName") || "";
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    assignedTo: null,
    priority: "",
    type: "",
  });

  useEffect(() => {
    if (incidentId) {
      fetchIncident();
      fetchUsers();
    }
  }, [incidentId]);

  useEffect(() => {
    if (incident) {
      setFormData({
        status: incident.status || "pending",
        assignedTo: incident.assignedToId || incident.assignedTo,
        priority: incident.priority || "medium",
        type: incident.type || "",
      });
    }
  }, [incident]);

  const fetchIncident = async () => {
    setLoading(true);
    try {
      const response = await getData(`https://patient-care-server.onrender.com/api/v1/incidents/${incidentId}`);
      setIncident(response.responseObject);
    } catch (err) {
      setError("Failed to fetch incident details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getData("https://patient-care-server.onrender.com/api/v1/users");
      setUsers(response.responseObject || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === "" ? null : name === "assignedTo" ? parseInt(value) : value
    }));
  };

  const handleSubmit = async () => {
    setUpdating(true);
    setError("");
    
    try {
      const payload = {
        ...incident,
        ...formData,
      };
      
      await updateData(`https://patient-care-server.onrender.com/api/v1/incidents/${incidentId}`, payload);
      
      setSuccess("Incident updated successfully");
      setEditMode(false);
      fetchIncident(); // Refresh data
      
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(errorHandler(err));
    } finally {
      setUpdating(false);
    }
  };

  // Updated to handle both conditions for closing an incident
  const closeIncident = async () => {
    setUpdating(true);
    setError("");
    
    try {
      const payload = {
        ...incident,
        status: "closed",
        resolvedAt: new Date().toISOString()
      };
      
      await updateData(`https://patient-care-server.onrender.com/api/v1/incidents/${incidentId}`, payload);
      
      setSuccess("Incident closed successfully");
      fetchIncident(); // Refresh data
      
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(errorHandler(err));
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in progress": return "bg-purple-100 text-purple-800";
      case "closed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-2">
              <button
                onClick={onBack}
                className="text-sm font-medium text-red-700 hover:text-red-600"
              >
                ← Back to all incidents
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12 text-gray-500">
        Incident not found
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack} 
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Incident #{incidentId}</h2>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="w-3/4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Details</h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap break-words">{incident.incident}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isSuperUser && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(incident.status)}`}>
                {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Priority</p>
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityClass(incident.priority)}`}>
                {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Type</p>
            <p className="font-medium text-gray-900">{incident.type}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Assigned To</p>
            <p className="font-medium text-gray-900">
              {incident.assignedTo ? (
                users.find(u => u.userId === incident.assignedToId || u.userId === incident.assignedTo)?.fullName || "Unknown"
              ) : (
                <span className="text-gray-400">Unassigned</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Raised By</p>
            <p className="font-medium text-gray-900">
              {incident.raisedBy || "Unknown"}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Created At</p>
            <p className="font-medium text-gray-900">
              {new Date(incident.createdAt).toLocaleString()}
            </p>
          </div>
          
          {incident.resolvedAt && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Resolved At</p>
              <p className="font-medium text-gray-900">
                {new Date(incident.resolvedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {editMode && (
          <div className="bg-gray-50 text-gray-950 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Incident</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo === null ? "" : formData.assignedTo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.fullName} {user.firstName === "Ouma" && user.lastName === "Arera" ? "(Developer)" : user.position ? `(${user.position})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={updating}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
              >
                {updating ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MessageSquare size={18} className="mr-2" />
          Comments
        </h3>
        
        {incident.status === "closed" ? (
          <div className="bg-gray-50 p-4 rounded-md text-gray-500 italic mb-4">
            This incident is closed. No new comments can be added.
          </div>
        ) : null}
        
        <CommentSection 
          incidentId={incidentId} 
          comments={incident.comments || []} 
          onCommentAdded={fetchIncident}
          isDisabled={incident.status === "closed"}
        />
      </div>
    </div>
  );
};

export default IncidentDetail;