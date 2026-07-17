'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({ line1: '', area: 'Koramangala', city: 'Bengaluru', pincode: '560034', lat: 12.9348, lng: 77.6246 });

  const { setUser, setAccessToken, setAuthLoading } = useUIStore();
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ user: any; accessToken: string }>('/auth/register', {
        name,
        email,
        password,
        role: 'customer',
        phone,
        address,
      });
      if (!response.success) {
        throw new Error(response.error?.message ?? 'Registration failed.');
      }
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      setAuthLoading(false);
      toast.success(`Welcome to Yaharika Mart, ${data.user.name}!`);
      router.push('/shops');
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground text-center">Create a customer account</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
          />
        </div>

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
          <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
            placeholder="e.g. 9876543210"
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

        <div>
          <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="line1">Delivery Address</label>
          <input
            id="line1"
            type="text"
            required
            value={address.line1}
            onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
            placeholder="Flat/House No., Building, Street name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="area">Area</label>
            <select
              id="area"
              value={address.area}
              onChange={(e) => setAddress((a) => ({ ...a, area: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
            >
              <option value="Koramangala">Koramangala</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="Jayanagar">Jayanagar</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              type="text"
              required
              value={address.pincode}
              onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full btn-primary flex justify-center py-2.5"
        >
          {registerMutation.isPending ? 'Registering...' : 'Sign up'}
        </button>
      </form>

      <div className="text-center text-sm text-foreground/60">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
