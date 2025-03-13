import React, { useEffect, useState } from "react";
import { getData } from "../services/updatedata";
import Confetti from "react-confetti"; // 🎉 Confetti effect
import useWindowSize from "react-use/lib/useWindowSize"; // 🖥️ Handle screen size for confetti

const ALL_USERS = "https://patient-care-server.onrender.com/api/v1/users";

const Birthday = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowSize(); // Get screen size for confetti
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

  const today = new Date().toISOString().slice(5, 10); // Extract MM-DD format

  // Find logged-in user
  const loggedInUser = users.find((user) => user.userId.toString() === loggedInUserId);

  // Check if today is the logged-in user's birthday
  const loggedInUserBirthday = loggedInUser?.dateOfBirth?.slice(5, 10) === today;

  // Find all users whose birthday is today
  const usersWithBirthdayToday = users.filter((user) => user.dateOfBirth?.slice(5, 10) === today);

  return (
    <div className="p-4 flex flex-col items-center">
      {/* 🎉 Confetti Effect for the Logged-in User */}
      {loggedInUserBirthday && <Confetti width={width} height={height} />}

      {/* 🎈 Special Banner for Logged-in User */}
      {loggedInUserBirthday && (
        <div className="relative bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-center p-6 rounded-lg shadow-lg mb-6 animate-pulse">
          <h2 className="text-3xl font-bold">🎉 Happy Birthday, {loggedInUser.firstName}! 🎂</h2>
          <p className="text-lg">Wishing you a fantastic day filled with joy and celebration! 🎁🥳</p>
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            🎈🎈🎈
          </div>
        </div>
      )}

      {/* 🎂 Display Other Users' Birthdays */}
      {usersWithBirthdayToday.length > 0 && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-900 p-6 rounded-lg shadow-lg max-w-lg text-center">
          <h3 className="text-xl font-bold">🎂 It's Their Special Day!</h3>
          <ul className="list-none mt-2 space-y-2">
            {usersWithBirthdayToday.map((user) => (
              <li key={user.userId} className="text-lg font-semibold">
                {user.fullName} 🎉 - <span className="text-red-500">Wish them the best!</span>
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
