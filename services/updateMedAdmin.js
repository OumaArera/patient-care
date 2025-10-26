const BASE_URL = import.meta.env.VITE_BASE_URL;

export const updateMedAdmin = async (medicationAdministrationId, updatedData) => {
    const token = localStorage.getItem("token");
    const url = `${BASE_URL}/medication-administrations`;
    try {
        const response = await fetch(`${url}/${medicationAdministrationId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({status: updatedData}),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data?.message || "Failed to update medication" };
        }

        return data;
    } catch (error) {
        console.error("Error updating medication:", error);
        return { error: "An unexpected error occurred while updating." };
    }
};
