import { useState } from "react";
const PASSWORD_RESET_URL ="https://patient-care-server.onrender.com/api/v1/auth/reset-password";


const ResetUser = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("")

  useEffect(() => {
      const token = localStorage.getItem("token");
      setToken(token)
      
    }, []);

  const handleReset = async () => {
    if (!username) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        PASSWORD_RESET_URL,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
          body: JSON.stringify({ username: username.toLowerCase() }),
        }
      );

      const data = await response.json();

      if (data.successful) {
        setMessage("Password reset link has been sent to your email.");
      } else {
        setError(data.message || "Failed to reset password. Try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black relative p-4">
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-blue-500 to-gray-900"></div>
      
      <div className="relative w-full max-w-md bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white text-center">Reset Password</h2>
        <p className="text-gray-300 text-center mt-2">Enter username to reset password.</p>

        <div className="mt-6">
          <label className="text-gray-300 block">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mt-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error && <p className="text-red-400 text-center mt-3">{error}</p>}
        {message && <p className="text-green-400 text-center mt-3">{message}</p>}

        <button
          onClick={handleReset}
          className="w-full p-3 mt-6 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg transition duration-200 shadow-md"
          disabled={loading}
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

export default ResetUser;
