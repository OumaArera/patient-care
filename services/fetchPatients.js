// fetchPatients.js
export const fetchPatients = async (pageSize=20, pageNumber=1) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `https://patient-care-server.onrender.com/api/v1/patients?pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.json();
};