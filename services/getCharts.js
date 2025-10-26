const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getCharts = async (patient) => {
    const url = new URL(`${BASE_URL}/charts?pageNumber=1&pageSize=366&patient=${patient}`);

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
            throw new Error("Failed to fetch charts");
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching charts:', error);
        return null;
    }
};