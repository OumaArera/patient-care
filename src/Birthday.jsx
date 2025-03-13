import React, { useEffect, useState } from "react";
import { getData } from "../services/updatedata";

const ALL_USERS = "https://patient-care-server.onrender.com/api/v1/users";

const Birthday = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    setLoading(true);
    getData(ALL_USERS)
      .then((data) => {
        setUsers(data?.responseObject || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(5, 10);
  const loggedInUser = users.find((user) => user.userId.toString() === loggedInUserId);
  const loggedInUserBirthday = loggedInUser?.dateOfBirth?.slice(5, 10) === today;
  const usersWithBirthdayToday = users.filter((user) => user.dateOfBirth?.slice(5, 10) === today);

  return (
    <div className="p-4">
      {/* 🎉 Special Banner for Logged-in User */}
      {loggedInUserBirthday && (
        <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-center p-4 rounded-lg shadow-lg mb-4">
          <h2 className="text-2xl font-bold">🎉 Happy Birthday, {loggedInUser.firstName}! 🎂</h2>
          <p>Wishing you a fantastic day filled with joy and celebration! 🎁🥳</p>
        </div>
      )}

      {/* 🎂 Show Others Who Have a Birthday Today */}
      {usersWithBirthdayToday.length > 0 && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold">🎂 Birthdays Today!</h3>
          <ul className="list-disc pl-5">
            {usersWithBirthdayToday.map((user) => (
              <li key={user.userId} className="font-medium">
                {user.fullName} 🎉
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && <p className="text-gray-500">Loading users...</p>}
    </div>
  );
};

export default Birthday;
