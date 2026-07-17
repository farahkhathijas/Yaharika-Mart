'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: role === 'vendor' ? '' : undefined,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = role === 'vendor' ? '/auth/register-vendor' : '/auth/register';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Registration failed');
        return;
      }

      setSuccess('Registration successful! Redirecting...');
      localStorage.setItem('accessToken', data.data.accessToken);
      setUser(data.data.user);
      setToken(data.data.accessToken);

      setTimeout(() => {
        router.push(role === 'vendor' ? '/vendor/dashboard' : '/dashboard');
      }, 1500);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="card-premium p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            ᴋ
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold text-center mb-2">Join Yaharika</h1>
        <p className="text-center text-foreground-muted mb-8">Create your account to get started</p>

        {/* Role Selection */}
        <div className="flex gap-4 mb-6">
          {(['customer', 'vendor'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                role === r
                  ? 'bg-gradient-primary text-white'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              {r === 'customer' ? 'Customer' : 'Vendor'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-danger" />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 bg-success/10 border border-success/20 rounded-lg p-4">
            <CheckCircle className="w-5 h-5 text-success" />
            <p className="text-success text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-primary-400" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-primary-400" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {role === 'vendor' && (
            <div>
              <label className="block text-sm font-medium mb-2">Shop Name</label>
              <input
                type="text"
                name="shopName"
                placeholder="Your shop name"
                value={formData.shopName || ''}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-foreground-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
