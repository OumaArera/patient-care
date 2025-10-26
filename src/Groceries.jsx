import React, { useState, useEffect } from "react";
import { createData } from "../services/updatedata";
import { getData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import GroceriesCard from "./GroceriesCard";
import { Loader } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const GROCERIES_URL = `${BASE_URL}/groceries`;
const BRANCHES_URL = `${BASE_URL}/branches`;


const Groceries = () => {
  const [categorizedGroceries, setCategorizedGroceries] = useState({
    BREAKFAST: [{ item: "", quantity: 1, delivered: false }],
    LUNCH: [],
    DINNER: [],
    SNACKS: [],
    "CLEANING AND DETERGENTS": [],
    OTHERS: []
  });
  const [pendingGroceries, setPendingGroceries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    setLoading(true);
    getData(BRANCHES_URL)
      .then((data) => {
        setBranches(data.responseObject || []);
      })
      .catch(() => setErrors(["Failed to fetch branches."]))
      .finally(() => setLoading(false));
    getGroceries();
  }, []);

  const getGroceries = () => {
    setLoading(true);
    const staff = localStorage.getItem("userId");
    const queryParams = new URLSearchParams({ staff }).toString();

    getData(`${GROCERIES_URL}?${queryParams}`)
      .then((data) => {
        if (data?.responseObject) {
          setPendingGroceries(data.responseObject);
        } else {
          setPendingGroceries([]);
        }
      })
      .catch(() => setPendingGroceries([]))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (category, index, field, value) => {
    const updatedGroceries = { ...categorizedGroceries };
    updatedGroceries[category][index][field] = field === "quantity" ? Number(value) : value;
    setCategorizedGroceries(updatedGroceries);
  };

  const addRow = (category) => {
    const updatedGroceries = { ...categorizedGroceries };
    updatedGroceries[category] = [
      ...updatedGroceries[category],
      { item: "", quantity: 1, delivered: false }
    ];
    setCategorizedGroceries(updatedGroceries);
  };

  const removeRow = (category, index) => {
    if (categorizedGroceries[category].length > 1) {
      const updatedGroceries = { ...categorizedGroceries };
      updatedGroceries[category] = updatedGroceries[category].filter((_, i) => i !== index);
      setCategorizedGroceries(updatedGroceries);
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    
    const updatedGroceries = { ...categorizedGroceries };
    updatedGroceries[newCategory.toUpperCase()] = [];
    setCategorizedGroceries(updatedGroceries);
    setNewCategory("");
    setShowAddCategory(false);
  };

  const handleSubmit = async () => {
    if (!selectedBranch) {
      setErrors(["Please select a branch"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }

    // Flatten the categorized groceries into a single array
    let allGroceries = [];
    Object.entries(categorizedGroceries).forEach(([category, items]) => {
      const validItems = items.filter(item => item.item.trim() !== "");
      if (validItems.length > 0) {
        // Add category information to each item
        allGroceries = [
          ...allGroceries,
          ...validItems.map(item => ({ ...item, category }))
        ];
      }
    });

    if (allGroceries.length === 0) {
      setErrors(["Please add at least one grocery item"]);
      setTimeout(() => setErrors([]), 5000);
      return;
    }

    setIsSubmitting(true);
    const payload = { details: allGroceries, branch: selectedBranch };
    
    try {
      const response = await createData(GROCERIES_URL, payload);

      if (response?.error) {
        setErrors(errorHandler(response?.error));
        setTimeout(() => setErrors([]), 5000);
      } else {
        setMessage("Groceries submitted successfully");
        // Reset the form
        setCategorizedGroceries({
          BREAKFAST: [{ item: "", quantity: 1, delivered: false }],
          LUNCH: [],
          DINNER: [],
          SNACKS: [],
          "CLEANING AND DETERGENTS": [],
          OTHERS: []
        });
        setTimeout(() => getGroceries(), 5000);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setErrors(["An error occurred. Please try again."]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-blue-500 mb-4">Grocery List</h2>
      
      {loading && (
        <div className="text-center">
          <Loader className="animate-spin text-gray-400 mx-auto" size={20} />
          <p className="text-gray-400 mt-2">Loading groceries...</p>
        </div>
      )}
      
      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        className="border p-2 rounded w-full bg-gray-700 text-white mb-4"
        required
      >
        <option value="">Select a Branch</option>
        {branches.map((branch) => (
          <option key={branch.branchId} value={branch.branchId}>
            {branch.branchName}
          </option>
        ))}
      </select>

      <div className="space-y-6">
        {Object.keys(categorizedGroceries).map((category) => (
          <div key={category} className="border border-gray-700 rounded-md p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">{category}</h3>
            
            <table className="w-full border border-gray-700 text-left">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2 border border-gray-700">Item</th>
                  <th className="p-2 border border-gray-700">Quantity</th>
                  <th className="p-2 border border-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {categorizedGroceries[category].length > 0 ? (
                  categorizedGroceries[category].map((grocery, index) => (
                    <tr key={index} className="border-gray-700">
                      <td className="p-2 border border-gray-700">
                        <input
                          type="text"
                          value={grocery.item}
                          onChange={(e) => handleInputChange(category, index, "item", e.target.value)}
                          className="bg-gray-800 text-white p-1 rounded w-full"
                          placeholder="Enter item"
                        />
                      </td>
                      <td className="p-2 border border-gray-700">
                        <input
                          type="number"
                          value={grocery.quantity}
                          onChange={(e) => handleInputChange(category, index, "quantity", e.target.value)}
                          className="bg-gray-800 text-white p-1 rounded w-full"
                          min="1"
                        />
                      </td>
                      <td className="p-2 border border-gray-700">
                        <button
                          onClick={() => removeRow(category, index)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mr-2"
                        >
                          -
                        </button>
                        <button
                          onClick={() => addRow(category)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-2 border border-gray-700 text-center">
                      <button
                        onClick={() => addRow(category)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Add Item
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Add New Category */}
      {showAddCategory ? (
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded flex-grow"
            placeholder="Enter new category name"
          />
          <button
            onClick={addCategory}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add
          </button>
          <button
            onClick={() => setShowAddCategory(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddCategory(true)}
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Add New Category
        </button>
      )}

      {errors.length > 0 && (
        <div className="mt-4 p-3 rounded bg-red-900 bg-opacity-20">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-400">{error}</p>
          ))}
        </div>
      )}
      
      {message && (
        <p className="mt-4 text-center font-medium text-blue-400">{message}</p>
      )}
      
      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Groceries"}
      </button>
      
      {pendingGroceries.length > 0 && (
        <GroceriesCard groceries={pendingGroceries} handleGetGroceries={getGroceries} />
      )}
    </div>
  );
};

export default Groceries;