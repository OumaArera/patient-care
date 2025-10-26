const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getCareGivers = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/users?pageSize=300&pageNumber=1&role=care%20giver`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };