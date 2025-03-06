import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { errorHandler } from '../services/errorHandler';
import { Eye, EyeOff } from "lucide-react";
import logo1 from "./assets/1ST EDMONDS_LOGO.png";
import logo2 from './assets/BSC-LOGO.png';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      navigate(`/${decoded.role}`);
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: name === 'username' ? value.toLowerCase() : value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError([]);

    try {
      const response = await fetch('https://patient-care-server.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      if (data.successful) {
        const { token } = data.responseObject;
        const decoded = jwtDecode(token);
        localStorage.setItem("token", token);
        localStorage.setItem("userId", decoded.user_id);
        localStorage.setItem("branch", decoded.branch);
        localStorage.setItem("username", decoded.username);
        localStorage.setItem("fullName", decoded.fullName);
        localStorage.setItem("role", decoded.role);
        localStorage.setItem("lastActivity", Date.now()); 
        navigate(`/${decoded.role}`);
      }else{
        setError(errorHandler(data?.responseObject?.errors));
        setTimeout(() => setError([]), 6000);
      }
    } catch (err) {
      setError(['An error occurred. Try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black relative">
  <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-blue-500 to-gray-900"></div>

  <div className="relative flex w-[800px] bg-opacity-40 backdrop-blur-md bg-gray-800 p-10 rounded-xl shadow-lg">
    {/* Left Side - Welcome Section */}
    <div className="w-1/2 text-white p-5 flex flex-col justify-center">
      <div className="flex justify-center items-center space-x-4">
        <img src={logo1} alt="Logo 1" className="h-32 object-contain" />
        <img src={logo2} alt="Logo 2" className="h-32 object-contain" />
      </div>
      <h1 className="text-4xl font-bold">Welcome!</h1>
      <p className="mt-2 text-gray-300">Login to continue your journey with us.</p>
      <button className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Learn More</button>
    </div>

    {/* Right Side - Login Form */}
    <div className="w-1/2 p-5 bg-gray-900 bg-opacity-50 rounded-lg">
      <h2 className="text-2xl font-semibold text-white text-center">Sign In</h2>
      <form onSubmit={handleLogin} className="mt-4">
        <div className="mb-4">
          <label className="text-gray-300 block">Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={credentials.username}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 block">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter password"
              value={credentials.password}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-black hover:text-gray-700 p-2 bg-gray-100 rounded-full transition duration-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error.length > 0 && (
          <div className="p-3 rounded-md mb-4">
            {error.map((err, index) => (
              <p key={index} className="text-red-700 text-lg">{err}</p>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full p-3 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg transition duration-200 shadow-md"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  </div>

  {/* Brochure Links at the Bottom */}
  <div className="absolute bottom-6 flex flex-col items-center gap-2">
    <div className="flex gap-8">
      <NavLink 
        to="/bothel" 
        className="text-blue-400 hover:text-blue-600 transition duration-200 text-lg font-medium"
      >
        Bothel Brochure
      </NavLink>
      <NavLink 
        to="/edmonds" 
        className="text-blue-400 hover:text-blue-600 transition duration-200 text-lg font-medium"
      >
        Edmonds Brochure
      </NavLink>
    </div>

    {/* Copyright & Developer Link */}
    <p className="text-gray-400 text-sm mt-2">
      © 2025 1ST EDMONDS AFH LLC & BOTHELL SERENITY CORP
    </p>
    <a 
      href="https://ouma-portforlio.vercel.app/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-500 hover:text-blue-700 text-md font-medium transition duration-200 underline"
    >
      Developed & Maintained by John Ouma
    </a>
  </div>
</div>

  );
};

export default Login;
