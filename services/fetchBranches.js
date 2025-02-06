export const fetchBranches = async (pageNumber, pageSize) => {
    const token = localStorage.getItem("token");
    if (!token) return { responseObject: [] };
  
    try {
      const response = await fetch(
        `https://patient-care-server.onrender.com/api/v1/branches?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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
  
  