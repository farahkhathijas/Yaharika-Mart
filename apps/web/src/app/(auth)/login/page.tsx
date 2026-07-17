'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, setAccessToken, setAuthLoading } = useUIStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ user: any; accessToken: string }>('/auth/login', { email, password });
      if (!response.success) {
        throw new Error(response.error?.message ?? 'Invalid email or password.');
      }
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      setAuthLoading(false);
      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === 'vendor') {
        router.push('/dashboard');
      } else if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/shops');
      }
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground text-center">Log in to your account</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full btn-primary flex justify-center py-2.5"
        >
          {loginMutation.isPending ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="text-center text-sm text-foreground/60">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-primary-600 hover:underline">
          Sign up free
        </Link>
      </div>
    </div>
  );
}
