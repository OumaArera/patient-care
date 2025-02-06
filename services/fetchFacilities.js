export const fetchFacilities = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await fetch(
        `https://patient-care-server.onrender.com/api/v1/facilities`,
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
  