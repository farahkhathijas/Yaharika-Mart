import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/Navbar';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-sand">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-16 bottom-0 border-r border-border bg-white px-4 py-6 space-y-1 overflow-y-auto z-40">
          <div className="text-xs font-semibold text-foreground/40 uppercase tracking-wider px-3 mb-3">
            Admin Panel
          </div>
          {[
            { label: '📊 Overview', href: '/admin/dashboard' },
            { label: '🏪 Vendor Management', href: '/admin/vendors' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-xl text-sm text-foreground/70 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium"
            >
              {item.label}
            </a>
          ))}
        </aside>

        {/* Main content */}
        <main id="main-content" className="flex-1 lg:pl-60 min-h-screen">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
