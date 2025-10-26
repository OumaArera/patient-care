const BASE_URL = import.meta.env.VITE_BASE_URL;


export const getMedications = async (patient) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(
        `${BASE_URL}/medications?patient=${patient}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
        );
        const data = await response.json();
        return data.responseObject || [];
    } catch (error) {
        console.error("Failed to fetch medications", error);
        return [];
    }
  };