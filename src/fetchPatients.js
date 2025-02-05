// fetchPatients.js
export const fetchPatients = async (pageNumber, pageSize) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://patient-care-server.onrender.com/api/v1/patients?page=${pageNumber}&size=${pageSize}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };