export const postMedications = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/medication-administrations", {
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
        console.error("Error posting medication charts:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};
