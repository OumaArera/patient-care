import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'email' ? value.toLowerCase() : value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phoneNumber: `+${value}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('https://patient-care-server.onrender.com/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.successful) {
        setSuccessMessage('User successfully created!');
        setFormData({ email: '', firstName: '', middleNames: '', lastName: '', phoneNumber: '', sex: 'male', role: 'care giver' });
      } else {
        const errors = JSON.parse(data.responseObject.errors);
        delete errors.username; // Remove username errors
        setError(Object.values(errors).flat().join(' '));
      }
    } catch (err) {
      setError('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center text-gray-700">Create User</h2>
        <form onSubmit={handleSubmit} className="mt-6">
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-3 mb-4 border rounded-lg" />
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="w-full p-3 mb-4 border rounded-lg" />
          <input type="text" name="middleNames" placeholder="Middle Names (Optional)" value={formData.middleNames} onChange={handleChange} className="w-full p-3 mb-4 border rounded-lg" />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="w-full p-3 mb-4 border rounded-lg" />
          
          <PhoneInput country={'us'} value={formData.phoneNumber} onChange={handlePhoneChange} inputClass="w-full p-3 border rounded-lg" required/>
          
          <select name="sex" value={formData.sex} onChange={handleChange} className="w-full p-3 mt-4 mb-4 border rounded-lg">
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>

          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 mb-4 border rounded-lg">
            <option value="care giver">care giver</option>
            <option value="manager">manager</option>
            <option value="superuser">superuser</option>
          </select>

          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          {successMessage && <p className="text-green-500 mt-2 text-center">{successMessage}</p>}

          <button type="submit" className="w-full p-3 mt-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg" disabled={loading}>
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;