export const getUpdates = async (patient) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://patient-care-server.onrender.com/api/v1/updates?patient=${patient}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };