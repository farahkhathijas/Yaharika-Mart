'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Navbar } from '@/components/shared/Navbar';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'customer') {
      router.push('/login');
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== 'customer') {
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
