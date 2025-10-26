const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchFacilities = async (pageNumber, pageSize) => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await fetch(
        `${BASE_URL}/facilities?pageSize=${pageSize}&pageNumber=${pageNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch facilities");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching facilities:", error);
      return null;
    }
  };
  