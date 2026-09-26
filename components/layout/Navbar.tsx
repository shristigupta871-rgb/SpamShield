'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Analyze', href: '/analyze' },
    { name: 'Knowledge Hub', href: '/analyze?tab=knowledge' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white group">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
            🛡️
          </span>
          <span>SpamShield <span className="text-emerald-600 dark:text-emerald-400">AI</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-sans font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 px-3.5 py-1.5 text-xs font-sans font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 transition shadow-sm"
          >
            {theme === 'dark' ? (
              <>
                <span className="text-amber-400">☀️</span>
                <span>Light</span>
              </>
            ) : (
              <>
                <span className="text-indigo-500">🌙</span>
                <span>Dark</span>
              </>
            )}
          </button>

          <Link
            href="/analyze"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans text-xs font-bold px-4 py-2 transition shadow-md shadow-emerald-500/20"
          >
            Start Scan →
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-sm"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition active:scale-95"
          >
            {isOpen ? (
              <span className="text-lg font-bold">✕</span>
            ) : (
              <span className="text-lg font-bold">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 px-6 py-5 space-y-4 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3 font-sans font-medium text-base">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="py-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border-b border-slate-100 dark:border-slate-800/60"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/analyze"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-500 py-3 font-sans text-sm font-bold text-slate-950 shadow-lg"
            >
              Analyze Message / URL / Screenshot →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
