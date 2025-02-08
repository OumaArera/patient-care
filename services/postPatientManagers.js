export const postPatientManager = async (payload) => {
    const token = localStorage.getItem("token");
    print("Hello world: ", payload);

    try {
        const response = await fetch("https://patient-care-server.onrender.com/api/v1/patient-managers", {
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
