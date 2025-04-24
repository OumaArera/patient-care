import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

const Notifications = ({ errors, message }) => {
  return (
    <>
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-center">
          <AlertCircle className="text-red-400 mr-2" size={18} />
          <div className="text-red-100">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-md flex items-center">
          <CheckCircle className="text-green-400 mr-2" size={18} />
          <div className="text-green-100">{message}</div>
        </div>
      )}
    </>
  );
};

export default Notifications;