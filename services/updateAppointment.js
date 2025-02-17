export const updateAppointment = async (payload, id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    console.log("ID: ", id);
    console.log("Payload: ", payload);
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/appointments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.log(data?.responseObject?.errors);
            return {error: data?.responseObject?.errors} ;
        };
        console.log("Data: ", data);
        return data;
    } catch (error) {
        console.error("Error updating appointments:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};
