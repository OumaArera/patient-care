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
    setError(null);
    
    try {
      const response = await fetch('https://patient-care-server.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      if (data.successful) {
        const { token } = data.responseObject;
        const decoded = jwtDecode(token);

        localStorage.setItem('token', token);
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
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: `url(${background})`}}>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-bold text-center">Login</h2>
          <form onSubmit={handleLogin} className="mt-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mt-2"
              required
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mt-2"
              required
            />
            <div className="flex items-center mt-2">
              <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
              <label className="ml-2">Show Password</label>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button
              type="submit"
              className={`w-full p-2 mt-4 text-white rounded ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
