const BASE_URL = import.meta.env.VITE_BASE_URL;


export const updateChartData = async (chartDataId, updatedData) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${BASE_URL}/charts-data/${chartDataId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data?.message || "Failed to update chart data" };
        }

        return data;
    } catch (error) {
        console.error("Error updating chart data:", error);
        return { error: "An unexpected error occurred while updating." };
    }
};
