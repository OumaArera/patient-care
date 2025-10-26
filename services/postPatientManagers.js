const BASE_URL = import.meta.env.VITE_BASE_URL;


export const postPatientManager = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/patient-managers`, {
            method: "POST",
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
        console.error("Error assigning resident:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};
