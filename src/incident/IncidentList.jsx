import React, { useState, useEffect } from "react";
import { getData, updateData } from "../../services/updatedata";
import { Search, Filter, Loader } from "lucide-react";

const IncidentList = ({ onViewIncident, onCreateIncident }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closingIncident, setClosingIncident] = useState(null);
  const [filters, setFilters] = useState({
    raisedBy: "",
    assignedTo: "",
    type: "",
    priority: "",
    status: "",
  });
  const [users, setUsers] = useState([]);
  const [types, setTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const role = localStorage.getItem("role") || "";
  const userId = parseInt(localStorage.getItem("userId")) || 0;

  useEffect(() => {
    fetchIncidents();
    fetchUsers();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const queryParams = Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
      
      const endpoint = `https://patient-care-server.onrender.com/api/v1/incidents${
        queryParams ? `?${queryParams}` : ""
      }`;
      
      const response = await getData(endpoint);
      setIncidents(response.responseObject || []);
      
      // Extract unique types for filter
      if (response.responseObject && response.responseObject.length > 0) {
        const uniqueTypes = [...new Set(response.responseObject.map(incident => incident.type))];
        setTypes(uniqueTypes);
      }
    } catch (err) {
      setError("Failed to fetch incidents");
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchIncidents();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      raisedBy: "",
      assignedTo: "",
      type: "",
      priority: "",
      status: "",
    });
  };

  // Updated close incident function to work for all authorized users
  const closeIncident = async (incidentId) => {
    setClosingIncident(incidentId);
    try {
      const endpoint = `https://patient-care-server.onrender.com/api/v1/incidents/${incidentId}`;
      const payload = { 
        status: "closed",
        resolvedAt: new Date().toISOString()
      };
      
      await updateData(endpoint, payload);
      
      // Refresh the incidents list
      fetchIncidents();
    } catch (err) {
      console.error("Failed to close incident:", err);
      setError("Failed to close incident");
    } finally {
      setClosingIncident(null);
    }
  };

  // Updated function to determine if user can close incident
  const canCloseIncident = (incident) => {
    // Allow closing if user is assigned to the incident OR if they're a superuser
    const isSuperUser = role === "superuser";
    return (incident.assignedToId === userId || isSuperUser) && incident.status !== "closed";
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Incident Reports</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200"
          >
            <Filter size={16} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={onCreateIncident}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Incident
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 text-gray-950 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raised By
            </label>
            <select
              name="raisedBy"
              value={filters.raisedBy}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {users.map(user => (
                <option key={user.userId} value={user.userId}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              name="assignedTo"
              value={filters.assignedTo}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All</option>
              <option value="null">Unassigned</option>
              {users.map(user => (
                <option key={user.userId} value={user.userId}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {types.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No incidents found. Create a new incident to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 w-1/4 max-w-xs">Incident</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Priority</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Raised By</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Assigned To</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Created At</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incidents.map((incident) => (
                <tr key={incident.incidentId} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 truncate max-w-xs">
                    <div className="max-w-xs truncate" title={incident.incident}>
                      {incident.incident}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{incident.type}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityClass(incident.priority)}`}>
                      {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(incident.status)}`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {incident.raisedBy || "Unknown"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {incident.assignedTo || (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(incident.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewIncident(incident.incidentId)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View
                      </button>
                      {canCloseIncident(incident) && (
                        <button
                          onClick={() => closeIncident(incident.incidentId)}
                          disabled={closingIncident === incident.incidentId}
                          className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                        >
                          {closingIncident === incident.incidentId ? "Closing..." : "Close"}
                        </button>
                      )}
                    </div>
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

export default IncidentList;