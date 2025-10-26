const BASE_URL = import.meta.env.VITE_BASE_URL;

export const postCharts = async (payload) => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${BASE_URL}/charts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
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
