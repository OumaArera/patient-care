export const getMedicationAdmininstration = async (patient) => {
    const url = new URL(`https://patient-care-server.onrender.com/api/v1/medication-administrations?pageNumber=1&pageSize=366&patient=${patient}`);

    const token = localStorage.getItem("token");
    try {
        const response = await fetch(url,
        {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch medication administrations");
        }
        const data = await response.json();
        return data.responseObject || [];
    } catch (error) {
        console.error('Error fetching charts:', error);
        return null;
    }
};