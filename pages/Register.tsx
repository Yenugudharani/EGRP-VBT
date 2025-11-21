import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { School, User, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { registerUser } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    course: '',
    department: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role,
      ...(role === UserRole.STUDENT ? { rollNumber: formData.rollNumber, course: formData.course } : {}),
      ...(role === UserRole.FACULTY ? { department: formData.department } : {})
    });

    setSubmitted(true);
    setTimeout(() => {
        navigate('/');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful</h2>
            <p className="text-gray-600 mb-6">
                Your account has been created and is <strong>Pending Approval</strong> by the Administrator.
                <br />You will be redirected to the login page shortly.
            </p>
            <Link to="/" className="text-indigo-600 font-medium hover:underline">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-500 text-sm">Join EGRP to manage examination grievances</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-lg">
            <button
                type="button"
                onClick={() => setRole(UserRole.STUDENT)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${role === UserRole.STUDENT ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <User size={18} /> Student
            </button>
            <button
                type="button"
                onClick={() => setRole(UserRole.FACULTY)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${role === UserRole.FACULTY ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <BookOpen size={18} /> Faculty
            </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                    required
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>

            {role === UserRole.STUDENT && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            value={formData.rollNumber}
                            onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course / Branch</label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            value={formData.course}
                            onChange={e => setFormData({...formData, course: e.target.value})}
                        />
                    </div>
                </div>
            )}

            {role === UserRole.FACULTY && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                        required
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        required
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                        required
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-2.5 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
            >
                Create Account
            </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};