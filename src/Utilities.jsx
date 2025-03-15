import React, { useEffect, useState } from "react";
import { getData } from "../services/updatedata";

const URL = "https://patient-care-server.onrender.com/api/v1/utilities";

const Utilities = () => {
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState("");
  const [details, setDetails] = useState("");
  const [filter, setFilter] = useState({ pending: true, review: true, addressed: true });

  useEffect(() => {
    setLoading(true);
    const staff = localStorage.getItem("userId");
    const queryParams = new URLSearchParams({ staff }).toString();

    getData(`${URL}?${queryParams}`)
      .then((data) => {
        const sortedUtilities = (data?.responseObject || []).sort((a, b) => {
          const order = { pending: 1, review: 2, addressed: 3 };
          return order[a.status] - order[b.status];
        });
        setUtilities(sortedUtilities);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = () => {
    console.log({ item, details });
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-blue-500 mb-4">Request Utility</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300">Item</label>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div>
          <label className="block text-gray-300">Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white h-24"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit Request
        </button>
      </div>

      <h2 className="text-xl font-bold text-blue-500 mt-6">Utility Records</h2>

      {/* Filters */}
      <div className="flex gap-4 mt-3">
        {["pending", "review", "addressed"].map((status) => (
          <label key={status} className="flex items-center space-x-2 text-gray-300">
            <input
              type="checkbox"
              checked={filter[status]}
              onChange={() => setFilter({ ...filter, [status]: !filter[status] })}
              className="accent-blue-500"
            />
            <span className="capitalize">{status}</span>
          </label>
        ))}
      </div>

      {/* Utility List */}
      {loading ? (
        <p className="text-gray-400 mt-4">Loading...</p>
      ) : (
        <div className="mt-4 space-y-4">
          {utilities
            .filter((utility) => filter[utility.status])
            .map((utility) => (
              <div key={utility.utilityId} className="bg-gray-800 p-4 rounded-lg shadow">
                <p><strong>Name:</strong> {utility.staffName}</p>
                <p><strong>Item:</strong> {utility.item}</p>
                <p><strong>Details:</strong> {utility.details}</p>
                <p className={`font-bold ${utility.status === "pending" ? "text-yellow-400" : utility.status === "review" ? "text-blue-400" : "text-green-400"}`}>
                  {utility.status.toUpperCase()}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Utilities;
