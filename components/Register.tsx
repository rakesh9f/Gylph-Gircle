
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './shared/Button';
import Card from './shared/Card';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Name Validation
    if (formData.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (/[0-9]/.test(formData.name)) newErrors.name = "Name cannot contain numbers";
    
    // Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";

    // Password Validation
    if (formData.password.length < 8) newErrors.password = "Password must be 8+ characters";
    if (!/[A-Z]/.test(formData.password)) newErrors.password = "Must contain 1 uppercase letter";
    if (!/[0-9]/.test(formData.password)) newErrors.password = "Must contain 1 number";
    if (!/[!@#$%^&*]/.test(formData.password)) newErrors.password = "Must contain 1 special char (!@#$%)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[!@#$%^&*]/.test(formData.password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
        await register(formData.name, formData.email, formData.password);
        navigate('/home');
    } catch (err) {
        // Error handled by AuthContext but displayed here via authError check
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <Card className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-amber-500/20 shadow-2xl">
        <div className="p-8">
          <h2 className="text-3xl font-cinzel font-bold text-center text-amber-300 mb-2">Join the Circle</h2>
          <p className="text-center text-amber-100/60 mb-8 font-lora">Begin your mystical journey.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-amber-200 text-sm font-bold mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full p-3 bg-gray-900/50 border rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${errors.name ? 'border-red-500' : 'border-amber-500/30'}`}
                placeholder="Mystic Seeker"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1 animate-pulse">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-amber-200 text-sm font-bold mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full p-3 bg-gray-900/50 border rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${errors.email ? 'border-red-500' : 'border-amber-500/30'}`}
                placeholder="user@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 animate-pulse">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-amber-200 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full p-3 bg-gray-900/50 border rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${errors.password ? 'border-red-500' : 'border-amber-500/30'}`}
                placeholder="••••••••"
              />
              {/* Strength Meter */}
              <div className="flex gap-1 mt-2 h-1">
                 {[1,2,3,4].map(i => (
                     <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i <= strength ? (strength < 3 ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-700'}`}></div>
                 ))}
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 animate-pulse">{errors.password}</p>}
            </div>

            {authError && (
                <div className="bg-red-900/30 border border-red-500/30 p-3 rounded text-red-200 text-sm text-center">
                    {authError}
                </div>
            )}

            <Button type="submit" className="w-full shadow-lg">
                Create Account
            </Button>
          </form>

          <p className="text-center mt-6 text-amber-200/60 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-bold underline decoration-amber-500/30">
                Log In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
