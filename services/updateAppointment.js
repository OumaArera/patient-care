const BASE_URL = import.meta.env.VITE_BASE_URL;


export const updateAppointment = async (payload, id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    console.log("ID: ", id);
    console.log("Payload: ", payload);
    try {
        const response = await fetch(`${BASE_URL}/appointments/${id}`, {
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
