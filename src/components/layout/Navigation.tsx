'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/contact', label: 'Contact' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-primary" aria-label="Go to homepage">
          SaaS Blue
        </Link>

        <button
          type="button"
          className="md:hidden rounded-md border border-border px-3 py-2 text-sm"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          ☰
        </button>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>Log out</Button>
            </div>
          ) : (
            <Button size="sm" asChild>
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-4 pb-4 pt-2 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={() => { logout(); setOpen(false); }}>
              Log out
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href="/admin/login" onClick={() => setOpen(false)}>Admin Login</Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navigation;
