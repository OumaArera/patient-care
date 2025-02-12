export const postAppointments = async (payload) => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("https://patient-care-server.onrender.com/api/v1/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Error", data?.responseObject?.errors);
        if (!response.ok) {
            let errorString = data?.responseObject?.errors || "Failed to create appointments";
            return { error: errorString };
        }

        return data;
    } catch (error) {
        console.error("Error creating appointments:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};
