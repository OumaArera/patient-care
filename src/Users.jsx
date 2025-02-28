import { useState, useEffect } from "react";
import { fetchUsers } from "../services/fetchUsers";
import { Loader } from "lucide-react";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        loadUsers(pageNumber);
    }, [pageNumber]);

    const loadUsers = async (page) => {
        setLoading(true);
        const fetchedUsers = await fetchUsers(page, pageSize, token);
        setUsers(fetchedUsers);
        setLoading(false);
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto mt-10">
        <h2 className="text-xl font-bold text-blue-400 mb-4">User Management</h2>
        <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-700">
            <thead>
                <tr className="bg-gray-800 text-white">
                {/* <th className="p-3 border border-gray-700">ID</th> */}
                <th className="p-3 border border-gray-700">Full Name</th>
                <th className="p-3 border border-gray-700">Email</th>
                <th className="p-3 border border-gray-700">Phone</th>
                <th className="p-3 border border-gray-700">Sex</th>
                <th className="p-3 border border-gray-700">Role</th>
                <th className="p-3 border border-gray-700">Status</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                <tr>
                    <td colSpan="7" className="text-center p-4 text-white">
                        <Loader className="animate-spin text-gray-500" size={20} />
                        <p className="text-gray-500">Loading...</p>
                    </td>
                </tr>
                ) : users.length > 0 ? (
                users
                    .filter(user => 
                        !["johnouma999@gmail.com", "johnouma998@gmail.com", "aluoch.kalal@gmail.com"].includes(user.email)
                    )
                    .map((user) => (
                    <tr key={user.userId} className="text-white bg-gray-800">
                    {/* <td className="p-3 border border-gray-700">{user.userId}</td> */}
                    <td className="p-3 border border-gray-700">{user.fullName}</td>
                    <td className="p-3 border border-gray-700">{user.email}</td>
                    <td className="p-3 border border-gray-700">{user.phoneNumber}</td>
                    <td className="p-3 border border-gray-700">{user.sex}</td>
                    <td className="p-3 border border-gray-700">{user.role}</td>
                    <td className="p-3 border border-gray-700">{user.status}</td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-400">
                    No users found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>

        <div className="flex justify-between mt-4">
            <button
            disabled={pageNumber === 1 || loading}
            onClick={() => setPageNumber(pageNumber - 1)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:bg-gray-600"
            >
            Previous
            </button>
            <button
            disabled={users.length < pageSize || loading}
            onClick={() => setPageNumber(pageNumber + 1)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:bg-gray-600"
            >
            Next
            </button>
        </div>
        </div>
    );
};

export default Users;