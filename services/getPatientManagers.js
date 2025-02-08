export const getpatientManagers = async (careGiver) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://patient-care-server.onrender.com/api/v1/patient-managers?careGiver=${careGiver}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };