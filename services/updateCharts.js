const BASE_URL = import.meta.env.VITE_BASE_URL;

export const updateChartStatus = async (chartId, status) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${BASE_URL}/charts/${chartId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            body: JSON.stringify({ status })
        });
        const data = await response.json();

        if (!response.ok) {
            let errorString = data?.responseObject?.errors || "Failed to create chart data";
            return { error: errorString };
        }

        return data;
    } catch (error) {
        console.error("Error creating chart data:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};