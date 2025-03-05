export const getpatientManagers = async (careGiver) => {
  const token = localStorage.getItem("token");

  // Construct the base URL
  let url = "https://patient-care-server.onrender.com/api/v1/patient-managers";

  // Append the query parameter only if careGiver is provided
  if (careGiver) {
    url += `?careGiver=${encodeURIComponent(careGiver)}`;
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.json();
};


export const fetchPatients = async (brachId) => {
  const token = localStorage.getItem("token");

  // Construct the base URL
  let url = `https://patient-care-server.onrender.com/api/v1/patients?branch=${brachId}`;


  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.json();
};