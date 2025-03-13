import { useState, useEffect } from "react";
import { FaUserLock, FaUserSlash, FaUserCheck } from "react-icons/fa";
import { getData } from "../services/updatedata";
import { Loader } from "lucide-react";

const PASSWORD_RESET_URL = "https://patient-care-server.onrender.com/api/v1/auth/reset-password";
const BLOCK_PASSWORD_URL = "https://patient-care-server.onrender.com/api/v1/auth/block-users";
const UNBLOCK_PASSWORD_URL = "https://patient-care-server.onrender.com/api/v1/auth/unblock-users";
const ALL_USERS = "https://patient-care-server.onrender.com/api/v1/users";

const ManageUser = () => {
  const [username, setUsername] = useState("");
  const [action, setAction] = useState("reset");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(()=>{
    setLoadingUsers(true);
    getData(ALL_USERS)
      .then((data) => {console.log("Users: ", data); setUsers(data?.responseObject);})
      .catch(() => {})
      .finally(()=> setLoadingUsers(false))
  }, [])
  console.log("Users: ", users)

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  const handleSubmit = async () => {
    if (!username) {
      setError("Please enter a username.");
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} the user ${username}?`;
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    let url = "";
    if (action === "reset") url = PASSWORD_RESET_URL;
    if (action === "block") url = BLOCK_PASSWORD_URL;
    if (action === "unblock") url = UNBLOCK_PASSWORD_URL;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: username.toLowerCase() }),
      });

      const data = await response.json();

      if (data.successful) {
        setUsername("");
        setMessage(`User ${username} has been ${action}ed successfully.`);
      } else {
        setError(data.message || `Failed to ${action} user. Try again.`);
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Manage User</h2>
      {loadingUsers && (
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin text-gray-500" size={20} />
          <p className="text-gray-500">Loading users...</p>
        </div>
      )}
      <label className="block mb-2 text-lg">Select Action:</label>
      <select
        value={action}
        onChange={(e) => setAction(e.target.value)}
        className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
      >
        <option value="reset">Reset User</option>
        <option value="block">Block User</option>
        <option value="unblock">Unblock User</option>
      </select>

      <label className="block mt-6 mb-2 text-lg">Enter Username:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
        className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
        placeholder="Enter username in lowercase"
      />

      {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      {message && <p className="text-green-400 text-center mt-4">{message}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-6 w-full flex items-center justify-center gap-3 p-4 rounded text-white text-lg ${
          action === "reset"
            ? "bg-blue-500 hover:bg-blue-600"
            : action === "block"
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {action === "reset" && <FaUserLock />}
        {action === "block" && <FaUserSlash />}
        {action === "unblock" && <FaUserCheck />}
        {loading ? "Processing..." : `${action.charAt(0).toUpperCase() + action.slice(1)} User`}
      </button>
    </div>
  );
};

export default ManageUser;