const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchPatients = async (pageSize=20, pageNumber=1) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${BASE_URL}/patients?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.json();
};