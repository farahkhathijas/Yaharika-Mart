'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Bell, Menu, X, ShoppingCart, User, Search, Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';

interface NavbarProps {
  transparent?: boolean;
}

const customerNav = [
  { label: 'Shops', href: '/shops' },
  { label: 'Deals Radar', href: '/deals-radar' },
  { label: 'Zero Waste', href: '/zero-waste' },
  { label: 'Group Buys', href: '/group-buys' },
  { label: '🍳 Recipe to Cart', href: '/recipe-to-cart' },
  { label: '🏆 Demo Panel', href: '/demo' },
];

const vendorNav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Products', href: '/products' },
  { label: 'Orders', href: '/vendor/orders' },
  { label: 'Stock Swap', href: '/stock-swap' },
];

export function Navbar({ transparent = false }: NavbarProps) {
  const { user, isDark, toggleDark, logout, unreadCount } = useUIStore();
  const { getItemCount, setCartOpen } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = getItemCount();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = user?.role === 'vendor' ? vendorNav : customerNav;

  const navClasses = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    scrolled || !transparent
      ? 'glass border-b border-white/20 shadow-glass py-3'
      : 'bg-transparent py-5'
  );

  return (
    <nav className={navClasses} aria-label="Main navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={user?.role === 'vendor' ? '/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/'}
            className="flex items-center gap-2.5 font-display text-lg font-bold text-primary-600"
            aria-label="Yaharika Mart home"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="hidden sm:block">Yaharika Mart</span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl border border-primary-100 flex items-center justify-center hover:bg-primary-50 transition-colors tap-target"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} className="text-primary-600" /> : <Moon size={16} className="text-primary-600" />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/account"
                  className="relative w-9 h-9 rounded-xl border border-primary-100 flex items-center justify-center hover:bg-primary-50 transition-colors tap-target"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <Bell size={16} className="text-primary-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Cart (customer only) */}
                {user.role === 'customer' && (
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative w-9 h-9 rounded-xl border border-primary-100 flex items-center justify-center hover:bg-primary-50 transition-colors tap-target"
                    aria-label={`Shopping cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
                  >
                    <ShoppingCart size={16} className="text-primary-600" />
                    {itemCount > 0 && (
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 1.5 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                        aria-live="polite"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </button>
                )}

                {/* User avatar */}
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors"
                  aria-label="Account settings"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground/80">{user.name.split(' ')[0]}</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden w-9 h-9 rounded-xl border border-primary-100 flex items-center justify-center tap-target"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {user ? (
                navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-foreground/70 hover:bg-foreground/5'
                    )}
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm text-foreground/70">Log in</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm bg-primary-500 text-white text-center">Sign up free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
