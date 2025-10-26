const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getpatientManagers = async (careGiver) => {
  const token = localStorage.getItem("token");

  let url = `${BASE_URL}/patient-managers`;

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
  let url = `${BASE_URL}/patients?branch=${brachId}`;


  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.json();
};