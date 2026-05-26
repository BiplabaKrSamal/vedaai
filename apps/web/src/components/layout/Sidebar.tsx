'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Settings,
  HelpCircle, Sparkles, ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV = [
  { href: '/',            icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/assignments', icon: BookOpen,         label: 'Assignments' },
];

const BOTTOM_NAV = [
  { href: '/settings', icon: Settings,   label: 'Settings' },
  { href: '/help',     icon: HelpCircle, label: 'Help'     },
];

function NavItem({
  href, icon: Icon, label, active,
}: {
  href: string; icon: React.ElementType; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative',
        active
          ? 'bg-brand-500/10 text-brand-400 font-medium'
          : 'text-[#8a9bb5] hover:text-[#f0f4f8] hover:bg-[#1c2533]',
      )}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-brand-500" />
      )}
      <Icon size={15} className={active ? 'text-brand-400' : 'text-[#4d6077] group-hover:text-[#8a9bb5]'} />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight size={12} className="text-brand-400/50" />}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="flex flex-col w-[220px] h-screen bg-[#141b24] border-r border-[#1a2534] sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[60px] border-b border-[#1a2534]">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/30">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-[#f0f4f8] tracking-tight">VedaAI</p>
          <p className="text-[10px] text-[#4d6077]">Assessment Creator</p>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[9px] font-bold text-[#4d6077] uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        <div className="space-y-0.5">
          {NAV.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-[#1a2534]">
        <div className="space-y-0.5 mb-3">
          {BOTTOM_NAV.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>
        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-[11px] font-bold text-brand-400 shrink-0">
            T
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#f0f4f8] truncate">Teacher</p>
            <p className="text-[9px] text-[#4d6077] truncate">teacher@school.edu</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
