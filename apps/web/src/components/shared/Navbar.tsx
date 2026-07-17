'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, User, LogOut, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout, isLoggedIn } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  // Hide navbar on auth pages
  if (pathname?.includes('/login') || pathname?.includes('/register')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-card-dark/70 border-b border-primary-100 dark:border-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
              ᴋ
            </div>
            <span className="font-display text-xl font-bold text-gradient-primary hidden sm:inline">Yaharika</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn && user && (
              <>
                <span className="text-sm text-foreground-muted">{user.name}</span>
                <Link
                  href={user.role === 'vendor' ? '/vendor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  className="text-foreground-muted hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors"
                >
                  {mounted && theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link href="/login" className="text-foreground-muted hover:text-foreground">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-primary-100 dark:border-primary-900">
            {isLoggedIn && user && (
              <>
                <p className="px-4 py-2 text-sm font-medium">{user.name}</p>
                <Link
                  href={user.role === 'vendor' ? '/vendor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  className="block px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link href="/login" className="block px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900">
                  Login
                </Link>
                <Link href="/register" className="block px-4 py-2 font-medium text-primary-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
