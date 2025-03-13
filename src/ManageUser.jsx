import { useState, useEffect } from "react";
import { FaUser, FaSearch } from "react-icons/fa";
import { getData } from "../services/updatedata";
import { Loader } from "lucide-react";
import UpdateUser from "./UpdateUser";

const ALL_USERS = "https://patient-care-server.onrender.com/api/v1/users";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUser, setShowUser] = useState(false);
  const usersPerPage = 4;

  
  const getUsers =() =>{
    setLoadingUsers(true);
    getData(ALL_USERS)
      .then((data) => {
        setUsers(data?.responseObject || []);
        setFilteredUsers(data?.responseObject || []);
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }

  useEffect(() => {
    getUsers()
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

  const excludedEmails = [
    "johnouma999@gmail.com",
    "aluoch.kalal@gmail.com",
    "oumatedy@gmail.com",
    "davidomondi@yfgak.org",
    "bigted114@gmail.com",
  ];
  

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
        {currentUsers
          .filter((user) => !excludedEmails.includes(user.email))
          .map((user) => (
            <div key={user.userId} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center gap-4">
                <FaUser className="text-gray-500 text-3xl" />
                <div>
                  <h3 className="text-lg font-semibold">{user.fullName}</h3>
                  <p className="text-gray-400">Role: {user.role}</p>
                  <p className="text-gray-400">
                    DOB: {new Date(user.dateOfBirth + "T00:00:00").toLocaleDateString("en-US")}
                  </p>
                </div>
              </div>
              <button
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
                onClick={() => {
                  setSelectedUser(user);
                  setShowUser(true);
                }}
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
      {showUser && selectedUser &&(
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowUser(false)}
        >
          <div
          className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          >
          <UpdateUser user={selectedUser} handleUser={getUsers} />
          <button
            className="absolute top-2 right-2 text-white hover:text-gray-400"
            onClick={() =>setShowUser(false)}
          >
              ✖
          </button>
          </div>
        </div>
        )}

    
    </div>
  );
};

export default ManageUser;
