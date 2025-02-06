export const updateChartData = async (chartDataId, updatedData) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`https://patient-care-server.onrender.com/api/v1/charts-data/${chartDataId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error("Failed to update chart data");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating chart data:", error);
        return null;
    }
};
