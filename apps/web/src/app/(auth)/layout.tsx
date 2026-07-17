import { ReactNode } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-display text-2xl font-bold text-primary-600 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <span>Yaharika Mart</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card border border-primary-50 sm:rounded-3xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
