export const updateAppointment = async (payload, id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`https://patient-care-server.onrender.com/api/v1/appointments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            return {error: data?.responseObject?.errors} ;
        };
        return data;
    } catch (error) {
        console.error("Error updating appointments:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};
