// fetchPatients.js
export const fetchPatients = async (pageNumber, pageSize) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://patient-care-server.onrender.com/api/v1/patients?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };