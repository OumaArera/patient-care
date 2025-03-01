import { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { errorHandler } from '../services/errorHandler';

const USERS_URL = 'https://patient-care-server.onrender.com/api/v1/users';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    middleNames: '',
    lastName: '',
    phoneNumber: '',
    sex: 'male',
    role: 'care giver',
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [defaultCountry, setDefaultCountry] = useState('us');
  const [token, setToken] = useState("");

  useEffect(() => {
    // Fetch user's country based on IP
    fetch('https://ip-api.com/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.countryCode) {
          setDefaultCountry(data.countryCode.toLowerCase());
        }
      })
      .catch(() => setDefaultCountry('us'));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token)
    
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'email' ? value.toLowerCase() : value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phoneNumber: `+${value}` }));
  };

  const handleSubmit = async (e) => {
    if (!token) return
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(USERS_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.successful) {
        setSuccessMessage('User successfully created!');
        setFormData({ email: '', firstName: '', middleNames: '', lastName: '', phoneNumber: '', sex: 'male', role: 'care giver' });
      } else {
        console.log("Error: ", data.responseObject.errors);
        setErrors(data?.responseObject?.errors);
        setTimeout(() => setErrors([]), 10000);
      }
    } catch (err) {
      setError('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 text-white p-10 rounded-xl shadow-xl w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-blue-500">Create User</h2>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">First Name</label>
              <input type="text" name="firstName" placeholder="Enter first name" value={formData.firstName} onChange={handleChange} required className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Middle Names</label>
              <input type="text" name="middleNames" placeholder="Enter middle names (optional)" value={formData.middleNames} onChange={handleChange} className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Last Name</label>
              <input type="text" name="lastName" placeholder="Enter last name" value={formData.lastName} onChange={handleChange} required className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-300 mb-1">Phone Number</label>
            <PhoneInput
                country=""
                value={formData.phoneNumber}
                onChange={(value, country) => {
                    if (value.startsWith("+")) {
                    setFormData((prev) => ({ ...prev, phoneNumber: value }));
                    } else {
                    setFormData((prev) => ({ ...prev, phoneNumber: `+${value}` }));
                    }
                }}
                inputProps={{
                    required: true,
                    placeholder: "+254123456789",
                }}
                enableSearch={true}
                inputStyle={{
                    width: '100%',
                    backgroundColor: '#374151',
                    borderColor: '#4b5563',
                    color: 'white',
                    height: '45px',
                }}
                buttonStyle={{ backgroundColor: '#4b5563', borderColor: '#4b5563' }}
            />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-300 mb-1">Sex</label>
              <select name="sex" value={formData.sex} onChange={handleChange} className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white">
                <option value="">Select Role</option>
                <option value="care giver">Care Giver</option>
                <option value="superuser">Superuser</option>
              </select>
            </div>
          </div>
          {errors.length > 0 && (
            <div className="mb-4 p-3 rounded">
              <p key={index} className="text-sm text-red-600">{errors}</p>
            </div>
          )}
          {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
          {successMessage && <p className="text-green-400 mt-2 text-center">{successMessage}</p>}

          <button type="submit" className="w-full p-3 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg" disabled={loading}>
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;