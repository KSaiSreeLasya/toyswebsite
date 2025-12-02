import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User } from 'lucide-react';

const EditProfile: React.FC = () => {
  const { user } = useStore();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: '+91 98765 45210',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Profile updated:', formData);
    alert('Profile saved successfully!');
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
          <User size={20} className="text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              <User size={16} />
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter email"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
            📞 Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
            placeholder="Enter phone number"
          />
        </div>

        {/* Shipping Address */}
        <div className="border-t-2 border-gray-100 pt-6">
          <h3 className="flex items-center gap-2 text-gray-800 font-bold mb-4 text-lg">
            📍 Shipping Address
          </h3>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Street Address</label>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter state"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter pincode"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSave}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
