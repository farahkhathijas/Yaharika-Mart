import Link from 'next/link';
import { ShoppingBag, Mail, Github, Twitter } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Browse Shops', href: '/shops' },
    { label: 'Deals Radar', href: '/deals-radar' },
    { label: 'Zero Waste', href: '/zero-waste' },
    { label: 'Group Buying', href: '/group-buys' },
  ],
  Merchants: [
    { label: 'List Your Store', href: '/register-vendor' },
    { label: 'Vendor Dashboard', href: '/dashboard' },
    { label: 'Stock Swap Board', href: '/stock-swap' },
    { label: 'Merchant Intelligence', href: '/intelligence' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-secondary-200 pt-16 pb-8" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2" aria-label="Yaharika Mart home">
              <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-secondary-50">Yaharika Mart</span>
            </Link>
            <p className="text-secondary-400 leading-relaxed max-w-xs">
              One Neighborhood. Many Stores. Zero Lost Sales.
              A collaborative commerce platform for the neighborhood of tomorrow.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-sm font-semibold text-secondary-300 mb-3">Get neighborhood updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-secondary-100 placeholder:text-secondary-500 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                  aria-label="Email for newsletter"
                />
                <button
                  type="button"
                  className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-400 transition-colors flex items-center gap-1"
                >
                  <Mail size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-secondary-100 mb-4 text-sm uppercase tracking-wider">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-secondary-400 hover:text-secondary-100 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-secondary-500 text-sm">
            © 2026 Yaharika Mart. Built for the Code to Cloud '26 Challenge.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-secondary-500 hover:text-secondary-200 transition-colors" aria-label="GitHub">
              <Github size={18} />
            </a>
            <a href="#" className="text-secondary-500 hover:text-secondary-200 transition-colors" aria-label="Twitter">
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
