  // UserManagement.js
  const UserManagement = () => {
    const users = [
      { id: 1, name: "Admin User", role: "Super User" },
      { id: 2, name: "Moderator", role: "Moderator" },
    ];
    return (
      <div>
        <h2 className="text-xl font-bold">User Management</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id} className="p-2 border-b">{user.name} - {user.role}</li>
          ))}
        </ul>
      </div>
    );
  };
  export default UserManagement;