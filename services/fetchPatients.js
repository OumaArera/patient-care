// fetchPatients.js
export const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://patient-care-server.onrender.com/api/v1/patients`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };