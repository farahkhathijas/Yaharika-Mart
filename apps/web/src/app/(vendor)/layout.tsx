'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Navbar } from '@/components/shared/Navbar';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'vendor') {
      router.push('/login');
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== 'vendor') {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </>
  );
}
