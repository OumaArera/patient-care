export const getCareGivers = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://patient-care-server.onrender.com/api/v1/users?pageSize=300&pageNumber=1&role=care%20giver`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };