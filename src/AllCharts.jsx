import React, { useEffect, useState } from "react";
import axios from "axios";

const AllCharts = ({ residentId, year, month, userRole }) => {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/behavior-data/${residentId}?year=${year}&month=${month}`);
        let filteredData = response.data;
        
        if (userRole === "manager") {
          filteredData = filteredData.filter(item => item.status === "approved");
        }
        
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    const generateDates = () => {
      const daysInMonth = new Date(year, month, 0).getDate();
      setDates(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    };

    fetchData();
    generateDates();
  }, [residentId, year, month, userRole]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Name: 1st EDMONDS - FILBERTROAD ADULT FAMILY HOME</h2>
      <h3 className="text-lg">Resident Name: {residentId}</h3>
      <h4 className="text-lg">Date: {year}-{month}</h4>
      
      <table className="w-full border-collapse border mt-4">
        <thead>
          <tr>
            <th className="border p-2">Behavior Category</th>
            <th className="border p-2">Behavior</th>
            {dates.map(date => (
              <th key={date} className="border p-2">{date}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.category}</td>
              <td className="border p-2">{item.behavior}</td>
              {dates.map(date => (
                <td key={date} className="border p-2 text-center">
                  {item.records?.[date] === true ? "✔" : item.records?.[date] === false ? "✖" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4">
        <h3 className="text-lg font-bold">Behavior Descriptions</h3>
        <table className="w-full border-collapse border mt-2">
          <thead>
            <tr>
              <th className="border p-2">Behavior</th>
              <th className="border p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.behavior}</td>
                <td className="border p-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <label className="block font-bold">Care Giver 1:</label>
        <input type="text" className="border p-2 w-full" placeholder="Signature" />
        
        <label className="block font-bold mt-4">Care Giver 2:</label>
        <input type="text" className="border p-2 w-full" placeholder="Signature" />
      </div>
    </div>
  );
};

export default AllCharts;
