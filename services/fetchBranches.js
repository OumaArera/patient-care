const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchBranches = async (pageNumber=1, pageSize=100) => {
    const token = localStorage.getItem("token");
    if (!token) return { responseObject: [] };
  
    try {
      const response = await fetch(
        `${BASE_URL}/branches?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching branches:", error);
      return { responseObject: [] };
    }
  };
  
  