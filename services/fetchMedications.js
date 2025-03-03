// fetchMedications.js
export const fetchMedications = async (pageNumber, pageSize, patient) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(
        `https://patient-care-server.onrender.com/api/v1/medications?pageNumber=${pageNumber}&pageSize=${pageSize}&patient=${patient}`,
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