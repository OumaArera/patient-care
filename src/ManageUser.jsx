import { useState, useEffect } from "react";
import { FaUser, FaSearch } from "react-icons/fa";
import { getData } from "../services/updatedata";
import { Loader } from "lucide-react";

const ALL_USERS = "https://patient-care-server.onrender.com/api/v1/users";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4;

  useEffect(() => {
    setLoadingUsers(true);
    getData(ALL_USERS)
      .then((data) => {
        setUsers(data?.responseObject || []);
        setFilteredUsers(data?.responseObject || []);
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = users.filter((user) =>
      (user.fullName?.toLowerCase() || "").includes(lowerSearch) ||
      (user.email?.toLowerCase() || "").includes(lowerSearch) ||
      (user.supervisor?.toLowerCase() || "").includes(lowerSearch)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [search, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Manage Users</h2>
      
      {/* Search Input */}
      <div className="flex items-center bg-gray-800 p-3 rounded mb-6">
        <FaSearch className="text-gray-500 mr-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or supervisor..."
          className="bg-transparent w-full text-white outline-none"
        />
      </div>

      {loadingUsers ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader className="animate-spin text-gray-500" size={20} />
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentUsers.map((user) => (
            <div key={user.userId} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center gap-4">
                <FaUser className="text-gray-500 text-3xl" />
                <div>
                  <h3 className="text-lg font-semibold">{user.fullName}</h3>
                  <p className="text-gray-400">Role: {user.role}</p>
                  <p className="text-gray-400">DOB: {user.dateOfBirth}</p>
                </div>
              </div>
              <button
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
                onClick={() => setSelectedUser(user)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={indexOfLastUser >= filteredUsers.length}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Selected User Details */}
      {selectedUser && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold">User Details</h3>
          <p><strong>Name:</strong> {selectedUser.fullName}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
          <p><strong>Role:</strong> {selectedUser.role}</p>
          <p><strong>Supervisor:</strong> {selectedUser.supervisor}</p>
          <button className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded" onClick={() => setSelectedUser(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageUser;
