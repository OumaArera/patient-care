export const createChartData = async (chartData) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    console.log("Data: ", chartData);
    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/charts-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(chartData),
        });

        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            let errorMessage = "An unexpected error occurred.";
            
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorMessage = errorData?.responseObject?.errors || "Unknown server error.";
            } else {
                console.error("Server returned non-JSON response:", await response.text());
                errorMessage = "Server error: Non-JSON response received.";
            }

            return { error: errorMessage };
        }

        const data = await response.json();
        return data;


        // const data = await response.json();

        // if (!response.ok) {
        //     let errorString = data?.responseObject?.errors || "Failed to create chart data";
        //     console.log("Errord, ", errorString);
        //     return { error: errorString };
        // }

        // return data;
    } catch (error) {
        console.error("Error creating chart data:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};
