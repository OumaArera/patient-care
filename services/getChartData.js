export const getChartsData = async (patient) => {
    const url = `https://patient-care-server.onrender.com/api/v1/charts-data?pageNumber=1&pageSize=360&patient=${patient}`;

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
            throw new Error("Failed to fetch charts data");
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching charts data:', error);
        return null;
    }
};