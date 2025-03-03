export const updateData = async (url, updatedData) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data?.responseObject?.errors || "Failed to update data" };
        }

        return data;
    } catch (error) {
        console.error("Error updating data:", error);
        return { error: "An unexpected error occurred while updating." };
    }
};
