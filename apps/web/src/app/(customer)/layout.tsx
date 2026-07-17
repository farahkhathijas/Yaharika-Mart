import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/Navbar';

export const metadata: Metadata = {
  title: 'Customer Portal',
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="pt-20">
        {children}
      </main>
    </div>
  );
}
