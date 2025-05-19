import React, { useState, useEffect } from "react";
import { getData, createData } from "../../services/updatedata";
import { errorHandler } from "../../services/errorHandler";
import { Loader, ArrowLeft } from "lucide-react";


const IncidentForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    incident: "",
    type: "",
    priority: "medium",
    assignedTo: null,
    comments: [],
    status: "pending"
  });
  
  const [customType, setCustomType] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [predefinedTypes] = useState(["Technical", "Authentication", "Network", "Software", "Hardware"]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getData("https://patient-care-server.onrender.com/api/v1/users");
      setUsers(response.responseObject || []);
    } catch (err) {
      setErrors(["Failed to fetch users"]);
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setFormData(prev => ({
        ...prev,
        type: customType
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        type: value
      }));
    }
  };

  const handleCustomTypeChange = (e) => {
    const value = e.target.value;
    setCustomType(value);
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleAssigneeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      assignedTo: value === "" ? null : parseInt(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.incident.trim()) {
      setErrors(["Incident details are required"]);
      return;
    }

    if (!formData.type.trim()) {
      setErrors(["Incident type is required"]);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const payload = {
        ...formData,
        createdAt: new Date().toISOString(),
      };

      const response = await createData("https://patient-care-server.onrender.com/api/v1/incidents", payload);
      
      setSuccess("Incident created successfully!");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setErrors(errorHandler(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onCancel} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Create New Incident</h2>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h3>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
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
              <p className="text-sm font-medium text-green-800">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="text-gray-950 mb-6">
          <label htmlFor="incident" className="block text-sm font-medium text-gray-700 mb-1">
            Incident Details *
          </label>
          <textarea
            id="incident"
            name="incident"
            rows={5}
            value={formData.incident}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the incident in detail..."
            required
          ></textarea>
        </div>

        <div className="text-gray-950 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Incident Type *
            </label>
            <select
              id="type"
              name="typeSelect"
              value={predefinedTypes.includes(formData.type) ? formData.type : "custom"}
              onChange={handleTypeChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Type</option>
              {predefinedTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="custom">Custom Type</option>
            </select>
          </div>

          {(!predefinedTypes.includes(formData.type) || formData.type === "custom") && (
            <div>
              <label htmlFor="customType" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Type
              </label>
              <input
                type="text"
                id="customType"
                name="customType"
                value={customType}
                onChange={handleCustomTypeChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter custom type..."
              />
            </div>
          )}

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
              Assign To (Optional)
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo === null ? "" : formData.assignedTo}
              onChange={handleAssigneeChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.fullName} {user.firstName === "Ouma" && user.lastName === "Arera" ? "(Developer)" : `(${user.position})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Incident"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;