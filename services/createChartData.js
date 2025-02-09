export const createChartData = async (chartData) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    console.log("Data: ", chartData);
    try {
        const response = await fetch("https://patient-care-server.onrender.com/api/v1/charts-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(chartData),
        });

        const data = await response.json();

        if (!response.ok) {
            let errorString = data?.responseObject?.errors || "Failed to create chart data";
            console.log("Errord, ", errorString);
            return { error: errorString };
        }

        return data;
    } catch (error) {
        console.error("Error creating chart data:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};
