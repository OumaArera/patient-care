import { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import { fetchUsers } from "./fetchUsers";
// import { UserContext, UserProvider } from "./UserContext";

const Users = () => {
  const { users, setUsers, token } = useContext(UserContext);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const fetchNextPage = async () => {
    const nextPage = pageNumber + 1;
    const newUsers = await fetchUsers(nextPage, pageSize, token);

    if (newUsers.length === pageSize) {
      setUsers(newUsers);
      setPageNumber(nextPage);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full">
      <h2 className="text-xl font-bold text-blue-400 mb-4">Users List</h2>

      {/* Make table occupy most of the available width */}
      <div className="overflow-x-auto w-full">
        <table className="w-full max-w-none bg-gray-800 border border-gray-700">
          <thead>
            <tr className="text-white bg-gray-700">
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Full Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Sex</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="p-3">{user.userId}</td>
                <td className="p-3">{user.fullName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phoneNumber}</td>
                <td className="p-3">{user.sex}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      <button
        onClick={fetchNextPage}
        className={`mt-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded ${users.length < pageSize ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={users.length < pageSize}
      >
        Load More
      </button>
    </div>
  );
};

export default Users;
