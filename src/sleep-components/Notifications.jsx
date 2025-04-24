import React from "react";

const Notifications = ({ errors, message }) => {
  return (
    <>
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-800 rounded">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-white">{error}</p>
          ))}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-800 rounded">
          <p className="text-sm text-white">{message}</p>
        </div>
      )}
    </>
  );
};

export default Notifications;