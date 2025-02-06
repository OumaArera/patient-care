import { useState, useEffect } from "react";
import { fetchUsers } from "../services/fetchUsers";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const fetchedUsers = await fetchUsers(token);
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
                <th className="p-3 border border-gray-700">ID</th>
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
                    Loading...
                    </td>
                </tr>
                ) : users.length > 0 ? (
                users.map((user) => (
                    <tr key={user.userId} className="text-white bg-gray-800">
                    <td className="p-3 border border-gray-700">{user.userId}</td>
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
        </div>
    );
};

export default Users;