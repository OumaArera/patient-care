import React, { useState } from "react";

const Incident = () => {
  const [details, setDetails] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }
    if (selectedFile && selectedFile.size > 30 * 1024 * 1024) {
      setError("File size must be less than 30MB.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = () => {
    if (!details.trim()) {
      setError("Incident details cannot be empty.");
      return;
    }
    setError("");
    console.log("Incident Details:", details);
    console.log("Uploaded File:", file ? file.name : "No file uploaded");
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-blue-500 mb-4">Report an Incident</h2>
      <textarea
        className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded mb-4"
        rows="5"
        placeholder="Enter incident details..."
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      ></textarea>
      <input
        type="file"
        accept="application/pdf"
        className="block w-full text-white bg-gray-800 border border-gray-700 rounded p-2 mb-4"
        onChange={handleFileChange}
      />
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Submit Incident
      </button>
    </div>
  );
};

export default Incident;