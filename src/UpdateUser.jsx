import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const UpdateUser = ({ user, handleUser }) => {
  const [formData, setFormData] = useState({ ...user });
  const [changedFields, setChangedFields] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setChangedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload = { userId: user.userId, ...changedFields };
    console.log("Updated Payload:", payload);
    handleUser()
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4 text-center">Update User</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="block text-gray-300 mb-1">First Name</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          placeholder="First Name"
          className="bg-gray-800 text-white p-2 rounded w-full"
        />
        <label className="block text-gray-300 mb-1">Middle Names</label>
        <input
          type="text"
          value={formData.middleNames || ""}
          onChange={(e) => handleChange("middleNames", e.target.value)}
          placeholder="Middle Names"
          className="bg-gray-800 text-white p-2 rounded w-full"
        />
        <label className="block text-gray-300 mb-1">Last Names</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          placeholder="Last Name"
          className="bg-gray-800 text-white p-2 rounded w-full"
        />
        <label className="block text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Email"
          className="bg-gray-800 text-white p-2 rounded w-full"
        />
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
        <label className="block text-gray-300 mb-1">Sex</label>
        <select value={formData.sex} onChange={(e) => handleChange("sex", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full">
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <label className="block text-gray-300 mb-1">Date of Birth</label>
        <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full" />
        <label className="block text-gray-300 mb-1">Marital Status</label>
        <select value={formData.maritalStatus} onChange={(e) => handleChange("maritalStatus", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full">
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
        </select>
        <label className="block text-gray-300 mb-1">Credentials</label>
        <input type="text" value={formData.credential} onChange={(e) => handleChange("credential", e.target.value)} placeholder="Credential" className="bg-gray-800 text-white p-2 rounded w-full" />
        <label className="block text-gray-300 mb-1">Credential Status</label>
        <select value={formData.credentialStatus} onChange={(e) => handleChange("credentialStatus", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <label className="block text-gray-300 mb-1">Date of Employment</label>
        <input type="date" value={formData.dateEmployed} onChange={(e) => handleChange("dateEmployed", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full" />
        <label className="block text-gray-300 mb-1">Supervisior</label>
        <input type="text" value={formData.supervisor} onChange={(e) => handleChange("supervisor", e.target.value)} placeholder="Supervisor" className="bg-gray-800 text-white p-2 rounded w-full" />
        <label className="block text-gray-300 mb-1">Provider</label>
        <input type="text" value={formData.provider} onChange={(e) => handleChange("provider", e.target.value)} placeholder="Provider" className="bg-gray-800 text-white p-2 rounded w-full" />
        <label className="block text-gray-300 mb-1">Employment Status</label>
        <select value={formData.employmentStatus} onChange={(e) => handleChange("employmentStatus", e.target.value)} className="bg-gray-800 text-white p-2 rounded w-full">
          <option value="active">Active</option>
          <option value="resigned">Resigned</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <button onClick={handleSubmit} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full">
        Save Changes
      </button>
    </div>
  );
};

export default UpdateUser;
