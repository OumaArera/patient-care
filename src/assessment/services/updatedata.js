// services/updatedata.js

// Assuming getData is already defined in this file
// Adding updateData function

/**
 * Makes a PUT request to update data
 * @param {string} url - The API endpoint URL
 * @param {object} data - The data to update
 * @returns {Promise} - Promise resolving to the response data
 */
export const updateData = async (url, data) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add any authorization headers if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error updating data:", error);
      throw error;
    }
  };
  
  // Export any other functions that might be defined in this file