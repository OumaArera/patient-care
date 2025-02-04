import { useEffect, useState } from 'react';

const Dashboard = ({ role }) => {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(localStorage.getItem('fullName') || 'User');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold">{role} Dashboard</h2>
      <p className="mt-2">Welcome, {fullName}!</p>
    </div>
  );
};

export default Dashboard;
