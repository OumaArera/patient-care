export const fetchUsers = async (token) => {
    const API_URL = `https://patient-care-server.onrender.com/api/v1/users`;
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