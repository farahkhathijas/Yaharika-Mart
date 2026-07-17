'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Login failed');
        return;
      }

      // Store token
      localStorage.setItem('accessToken', data.data.accessToken);
      router.push('/dashboard');
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
        <h1 className="text-2xl font-display font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-foreground-muted mb-8">Sign in to your Yaharika account</p>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-danger" />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-primary-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-foreground-muted mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-primary-100">
          <p className="text-xs text-foreground-muted text-center mb-3 font-medium">Demo Accounts</p>
          <div className="space-y-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail('ananya@example.com');
                setPassword('Customer@12345');
              }}
              className="w-full py-2 px-3 bg-primary-50 hover:bg-primary-100 rounded text-primary-700 font-medium transition-colors"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('ravi@yaharika.in');
                setPassword('Vendor@12345');
              }}
              className="w-full py-2 px-3 bg-accent-gold/10 hover:bg-accent-gold/20 rounded text-accent-gold-dark font-medium transition-colors"
            >
              Vendor Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@yaharika.in');
                setPassword('Admin@12345');
              }}
              className="w-full py-2 px-3 bg-secondary/20 hover:bg-secondary/30 rounded text-secondary-foreground font-medium transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}