const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchChartData = async () => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `${BASE_URL}/charts-data`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch chart data");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
        return null;
    }
};
