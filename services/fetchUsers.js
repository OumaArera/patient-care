const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchUsers = async (pageNumber, pageSize, token) => {
    const API_URL = `${BASE_URL}/users?pageSize=${pageSize}&pageNumber=${pageNumber}`;
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.successful) {
        return data.responseObject;
      } else {
        throw new Error(data.statusMessage || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };