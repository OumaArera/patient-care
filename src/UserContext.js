import { createContext, useState, useEffect } from "react";
import { fetchUsers } from "./fetchUsers";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  
  useEffect(() => {
    const preloadUsers = async () => {
      if (token) {
        const data = await fetchUsers(1, 10, token); // Prefetch first page
        setUsers(data);
      }
    };
    preloadUsers();
  }, [token]);

  return (
    <UserContext.Provider value={{ users, setUsers, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};
