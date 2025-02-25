export const deletePatientManagers = async (ID) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const URL = "https://patient-care-server.onrender.com/api/v1/patient-managers";
    try {
        const response = await fetch(`${URL}/${ID}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {error: data?.responseObject?.errors} ;
        };
        return data;
    } catch (error) {
        console.error("Error deleting resident:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
};
