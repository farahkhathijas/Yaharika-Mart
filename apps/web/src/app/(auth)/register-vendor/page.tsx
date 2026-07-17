'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export default function RegisterVendorPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('grocery');
  const [address, setAddress] = useState({ line1: '', area: 'Koramangala', city: 'Bengaluru', pincode: '560034', lat: 12.9348, lng: 77.6246 });

  const { setUser, setAccessToken, setAuthLoading } = useUIStore();
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: async () => {
      // 1. Register vendor user
      const userRes = await api.post<{ user: any; accessToken: string }>('/auth/register', {
        name,
        email,
        password,
        role: 'vendor',
        phone,
        address,
      });

      if (!userRes.success) {
        throw new Error(userRes.error?.message ?? 'Registration failed.');
      }

      // Temporarily store token so sub-request works
      localStorage.setItem('yaharika-token', userRes.data.accessToken);

      // 2. Create the shop
      const shopRes = await api.post('/shops', {
        name: shopName,
        category,
        description: `Premium quality neighborhood ${category} store in ${address.area}.`,
        area: address.area,
        lat: address.lat,
        lng: address.lng,
      });

      if (!shopRes.success) {
        throw new Error(shopRes.error?.message ?? 'User registered, but shop creation failed. Please log in to complete setup.');
      }

      return userRes.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      setAuthLoading(false);
      toast.success(`Welcome to Yaharika Mart, ${data.user.name}! Your store ${shopName} is live.`);
      router.push('/dashboard');
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
        <h2 className="font-display text-2xl font-bold text-foreground text-center">List Your Store</h2>
        <p className="text-sm text-foreground/50 text-center mt-1">Start collaborating with nearby merchants today</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="border-b border-primary-50 pb-4">
          <h3 className="font-display text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">Owner Details</h3>
          <div className="space-y-3">
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
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">Store Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="shopName">Store Name</label>
              <input
                id="shopName"
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
                placeholder="e.g. Patel Kirana Store"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
                >
                  <option value="grocery">Grocery</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="bakery">Bakery</option>
                  <option value="dairy">Dairy</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="meat">Meat</option>
                  <option value="stationery">Stationery</option>
                  <option value="general">General</option>
                </select>
              </div>
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
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground/70 mb-1.5 block" htmlFor="line1">Store Address</label>
              <input
                id="line1"
                type="text"
                required
                value={address.line1}
                onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-sand/20"
                placeholder="Shop No., Street name"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full btn-primary flex justify-center py-2.5"
        >
          {registerMutation.isPending ? 'Onboarding Store...' : 'Launch Store'}
        </button>
      </form>

      <div className="text-center text-sm text-foreground/60">
        Already have a merchant account?{' '}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
