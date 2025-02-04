import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import background from './assets/background.jpg';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token", token)
    if (token) {
      const decoded = jwtDecode(token);
      // if (decoded.role === "care giver"){
      //   navigate("/caregiver")
      // }else{
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
    setError(null);

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

        localStorage.setItem('token', token);
        localStorage.setItem('patients', decoded.patients);
        localStorage.setItem('userId', decoded.user_id);
        localStorage.setItem('username', decoded.username);
        localStorage.setItem('fullName', decoded.fullName);
        localStorage.setItem('role', decoded.role);

        navigate(`/${decoded.role}`);
      } else {
        setError(data.responseObject.errors);
      }
    } catch (err) {
      setError('An error occurred. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Image */}
      <div
        className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      ></div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
          <h2 className="text-3xl font-bold text-center text-gray-700">Welcome Back</h2>
          <p className="text-center text-gray-500 mt-1">Login to your account</p>

          <form onSubmit={handleLogin} className="mt-6">
            <div className="mb-4">
              <label className="block text-gray-600 font-medium">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2"
                />
                <label htmlFor="remember" className="text-gray-600">Remember me</label>
              </div>
              {/* <a href="#" className="text-blue-500 hover:underline text-sm">Forgot Password?</a> */}
            </div>

            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full p-3 mt-3 text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition duration-200 shadow-lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-gray-600 text-center mt-4">
            {/* Don't have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a> */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
