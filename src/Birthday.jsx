import React, { useEffect, useState } from "react";
import { getData } from "../services/updatedata";
import Confetti from "react-confetti"; 
import useWindowSize from "react-use/lib/useWindowSize"; 

const ALL_USERS = "https://patient-care-server.onrender.com/api/v1/users";

const Birthday = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowSize();
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
  const loggedInUserBirthday = loggedInUser?.dateOfBirth?.slice(5, 10) === today;

  // Find other users with birthdays today (excluding logged-in user)
  const usersWithBirthdayToday = users.filter(
    (user) => user.dateOfBirth?.slice(5, 10) === today && user.userId.toString() !== loggedInUserId
  );

  // 🎉 List of random birthday messages
  const birthdayMessages = [
    "Wishing you a day filled with love, laughter, and all the things that bring you joy! 🎁🎊",
    "May your birthday be as bright, fun, and fabulous as you are! 🎂🥳",
    "Happy Birthday! May this year bring you endless happiness and success! 🎈✨",
    "Cheers to another amazing year! Wishing you all the best on your special day! 🎉🍰",
    "Another year older, wiser, and more amazing! Have a fantastic birthday! 🎂🎁",
  ];

  // Pick a random message
  const randomMessage = birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)];

  return (
    <div className="p-4 flex flex-col items-center">
      {/* 🎉 Confetti Effect for the Logged-in User */}
      {loggedInUserBirthday && <Confetti width={width} height={height} />}

      {/* 🎈 Special Banner for Logged-in User */}
      {loggedInUserBirthday && (
        <div className="relative bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-center p-6 rounded-lg shadow-lg mb-6 animate-bounce">
          <h2 className="text-3xl font-bold">🎉 Happy Birthday, {loggedInUser.firstName}! 🎂</h2>
          <p className="text-lg">{randomMessage}</p>
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            🎈🎈🎈
          </div>
        </div>
      )}

      {/* 🎂 Show Birthdays of Other Users (Only If NOT the Logged-In User) */}
      {usersWithBirthdayToday.length > 0 && !loggedInUserBirthday && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-900 p-6 rounded-lg shadow-lg max-w-lg text-center">
          <h3 className="text-xl font-bold">🎂 Birthdays Today!</h3>
          <ul className="list-none mt-2 space-y-2">
            {usersWithBirthdayToday.map((user) => (
              <li key={user.userId} className="text-lg font-semibold">
                {user.fullName} 🎉 - <span className="text-red-500">Send them your best wishes!</span>
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
