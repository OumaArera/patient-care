import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { updateData } from "../services/updatedata";
import { createData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";

const RESET_URL = "https://patient-care-server.onrender.com/api/v1/auth/reset-password";
const USER_URL = 'https://patient-care-server.onrender.com/api/v1/users';

const UpdateUser = ({ user, handleUser }) => {
    const [formData, setFormData] = useState({ ...user });
    const [changedFields, setChangedFields] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setChangedFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!changedFields) return;
        setIsSubmitting(true);
        const updatedUrl = `${USER_URL}/${user.userId}`;
        try {
            const response = await updateData(updatedUrl, changedFields);
                
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("Data updated successfully");
                setTimeout(() => handleUser(), 5000);
                setTimeout(() => setMessage(""), 5000);
            }
            
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetUser = async () => {
        if (!formData.email) return
        setLoading(true);
        const payload ={
            username: formData.email
        }
        try {
            const response = await createData(RESET_URL, payload);
                
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setMessage("User reset successfully");
                setTimeout(() => setMessage(""), 5000);
            }
            
        } catch (error) {
            setErrors(["An error occurred. Please try again."]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4 text-center">Update User</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-gray-300 mb-1">First Name</label>
            <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="First Name"
                className="bg-gray-800 text-white p-2 rounded w-full"
            />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Middle Names</label>
            <input
                type="text"
                value={formData.middleNames || ""}
                onChange={(e) => handleChange("middleNames", e.target.value)}
                placeholder="Middle Names"
                className="bg-gray-800 text-white p-2 rounded w-full"
            />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Last Name</label>
            <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Last Name"
                className="bg-gray-800 text-white p-2 rounded w-full"
            />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email"
                className="bg-gray-800 text-white p-2 rounded w-full"
            />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Phone Number</label>
            <PhoneInput
                country=""
                value={formData.phoneNumber}
                onChange={(value) => handleChange("phoneNumber", value.startsWith("+") ? value : `+${value}`)}
                inputProps={{ required: true, placeholder: "+254123456789" }}
                enableSearch={true}
                inputStyle={{ width: "100%", backgroundColor: "#374151", borderColor: "#4b5563", color: "white", height: "45px" }}
                buttonStyle={{ backgroundColor: "#4b5563", borderColor: "#4b5563" }}
            />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Sex</label>
            <select value={formData.sex} onChange={(e) => handleChange("sex", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Date of Birth</label>
            <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full" />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Marital Status</label>
            <select value={formData.maritalStatus} onChange={(e) => handleChange("maritalStatus", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full">
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
            </select>
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Credentials</label>
            <input type="text" value={formData.credential} onChange={(e) => handleChange("credential", e.target.value)} placeholder="Credential" className="bg-gray-800 text-white p-2 rounded w-full" />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Credential Status</label>
            <select value={formData.credentialStatus} onChange={(e) => handleChange("credentialStatus", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Date of Employment</label>
            <input type="date" value={formData.dateEmployed} onChange={(e) => handleChange("dateEmployed", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full" />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Supervisor</label>
            <input type="text" value={formData.supervisor} onChange={(e) => handleChange("supervisor", e.target.value)} placeholder="Supervisor" className="bg-gray-800 text-white p-2 rounded w-full" />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Provider</label>
            <input type="text" value={formData.provider} onChange={(e) => handleChange("provider", e.target.value)} placeholder="Provider" className="bg-gray-800 text-white p-2 rounded w-full" />
        </div>
        <div>
            <label className="block text-gray-300 mb-1">Employment Status</label>
            <select value={formData.employmentStatus} onChange={(e) => handleChange("employmentStatus", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full">
                <option value="active">Active</option>
                <option value="resigned">Resigned</option>
                <option value="dismissed">Dismissed</option>
            </select>
        </div>
      </div>
        {errors.length > 0 && (
            <div className="mb-4 p-3 rounded">
                {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">{error}</p>
                ))}
            </div>
        )}
        {message && <p className="mt-3 text-center font-medium text-blue-400">{message}</p>}

      <button 
        onClick={handleSubmit} 
        className={`mt-6px-4 py-2 rounded w-full
            ${changedFields || !isSubmitting
                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                : "bg-gray-500 cursor-not-allowed"
            }` }
        disabled={!changedFields}
      >
        {isSubmitting ? "Submitting..." : "Save Changes"}
      </button>

      <button 
        onClick={handleResetUser} 
        className={`mt-3 px-4 py-2 rounded w-full
            ${formData.email || !loading
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gray-500 cursor-not-allowed"
            }
            `}
        disabled={!formData.email}
    >
        {loading? "Submitting...": "Reset User"}
      </button>
    </div>
  );
};

export default UpdateUser;
