import React, { useState } from "react";
import { Loader, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState("");

    const API_URL = "https://patient-care-server.onrender.com/api/v1/auth/change-password";

    // Password Validation Checks
    const isLongEnough = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const isNotSame = currentPassword !== newPassword;

    const isValidPassword = isLongEnough && hasUpperCase && hasLowerCase && hasNumber && isNotSame;

    // Handle Submit using fetch
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json(); // Convert response to JSON

            if (response.ok) {
                setSuccess("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
            } else {
                throw new Error(data.message || "An error occurred. Please try again.");
            }
        } catch (err) {
            setError(err.message || "Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-gray-900 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Change Password</h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div className="relative">
                    <label className="block text-sm mb-1">Current Password</label>
                    <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-2 border border-gray-700 bg-gray-800 rounded"
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* New Password */}
                <div className="relative">
                    <label className="block text-sm mb-1">New Password</label>
                    <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2 border border-gray-700 bg-gray-800 rounded"
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Password Strength Validation */}
                <div className="text-sm">
                    <p className="flex items-center gap-2">
                        {isLongEnough ? <CheckCircle className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />}
                        At least 8 characters
                    </p>
                    <p className="flex items-center gap-2">
                        {hasUpperCase ? <CheckCircle className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />}
                        At least one uppercase letter
                    </p>
                    <p className="flex items-center gap-2">
                        {hasLowerCase ? <CheckCircle className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />}
                        At least one lowercase letter
                    </p>
                    <p className="flex items-center gap-2">
                        {hasNumber ? <CheckCircle className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />}
                        At least one number
                    </p>
                    <p className="flex items-center gap-2">
                        {isNotSame ? <CheckCircle className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />}
                        New password must be different from current password
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full p-2 text-white rounded ${isValidPassword ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-600 cursor-not-allowed"}`}
                    disabled={!isValidPassword || loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <Loader className="animate-spin mr-2" size={20} />
                            Changing Password...
                        </span>
                    ) : (
                        "Change Password"
                    )}
                </button>

                {/* Success Message */}
                {success && <p className="text-green-500 text-center mt-2">{success}</p>}

                {/* Error Message */}
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default ChangePassword;
