export const postPatientManager = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch("https://patient-care-server.onrender.com/api/v1/medication-administrations", {
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
