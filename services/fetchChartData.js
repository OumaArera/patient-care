export const fetchChartData = async (pageNumber = 1, pageSize = 10) => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `https://patient-care-server.onrender.com/api/v1/charts-data?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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
