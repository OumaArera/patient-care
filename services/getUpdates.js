const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getUpdates = async (patient) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/updates?patient=${patient}&pageSize=366`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };