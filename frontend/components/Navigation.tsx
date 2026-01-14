'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/contexts/UserRoleContext';
import RoleSelector from './RoleSelector';
import { motion } from 'framer-motion';
import {
  Camera,
  Package,
  Grid3x3,
  MapPin,
  PlusCircle,
  Activity,
  Shield,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkWithTooltipProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  tooltip: string;
  isActive: boolean;
}

const NavLinkWithTooltip = ({ href, label, icon, tooltip, isActive }: NavLinkWithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
    return (
      <Link
        href={href}
      className={cn(
        'relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px]',
          isActive
          ? 'bg-blue-100 text-blue-700 shadow-sm'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      )}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      >
        {icon}
        {label}
      {/* Tooltip on hover - positioned below to avoid going above browser */}
      {showTooltip && (
        <motion.span
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 text-xs text-white bg-slate-900 rounded-lg whitespace-nowrap z-[9999] shadow-2xl pointer-events-none"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {tooltip}
          {/* Arrow pointing up */}
          <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-slate-900 rotate-45"></span>
        </motion.span>
      )}
      </Link>
    );
  };

export default function Navigation() {
  const { isAdmin } = useUserRole();
  const pathname = usePathname();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [showAdminTooltip, setShowAdminTooltip] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setAdminMenuOpen(false);
      }
    };

    if (adminMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [adminMenuOpen]);

  // Close dropdown when route changes
  useEffect(() => {
    setAdminMenuOpen(false);
  }, [pathname]);

  const adminLinks = [
    { href: '/activity', label: 'Activity', icon: <Activity className="w-4 h-4" />, tooltip: 'See all recent scans and events. Track what happened and when, including any warnings or exceptions' },
    { href: '/products', label: 'Products', icon: <Grid3x3 className="w-4 h-4" />, tooltip: 'Add or edit products in the system. Set up brands, names, and sizes for items you receive' },
    { href: '/locations', label: 'Locations', icon: <MapPin className="w-4 h-4" />, tooltip: 'Create and manage warehouse locations. Set up zones, aisles, racks, and shelves. Print location QR codes' },
  ];
  
  // Create Box is available to both employees and admins
  const createBoxLink = { href: '/create-box', label: 'Create Box', icon: <PlusCircle className="w-4 h-4" />, tooltip: 'Create and print QR code labels for boxes' };

  const isAdminPageActive = adminLinks.some(link => pathname === link.href);

  return (
    <nav className="bg-white shadow-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            <Link href="/scan" className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">Inventory System</h1>
            </Link>
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <NavLinkWithTooltip
                href="/scan"
                label="Scan"
                icon={<Camera className="w-4 h-4" />}
                tooltip="Your main workspace. Scan QR codes to receive incoming boxes, move boxes to shelves, or ship boxes out"
                isActive={pathname === '/scan'}
              />
              <NavLinkWithTooltip
                href="/inventory"
                label="Inventory"
                icon={<Package className="w-4 h-4" />}
                tooltip="Search and view all boxes in the warehouse. See what's in stock, where boxes are located, and filter by location or date"
                isActive={pathname === '/inventory'}
              />
              <NavLinkWithTooltip
                href="/create-box"
                label="Create Box"
                icon={<PlusCircle className="w-4 h-4" />}
                tooltip="Create a new box label with QR code. Print the label and attach it to a physical box"
                isActive={pathname === '/create-box'}
              />
              
              {/* Admin dropdown menu */}
              {isAdmin && (
                <div className="relative" ref={adminMenuRef}>
                  <div className="relative">
                    <button
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      onMouseEnter={() => setShowAdminTooltip(true)}
                      onMouseLeave={() => setShowAdminTooltip(false)}
                      className={cn(
                        'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                        isAdminPageActive
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                      <ChevronDown className={cn('w-4 h-4 transition-transform', adminMenuOpen && 'rotate-180')} />
                    </button>
                    {showAdminTooltip && !adminMenuOpen && (
                      <motion.span
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 text-xs text-white bg-slate-900 rounded-lg whitespace-nowrap z-[9999] shadow-2xl pointer-events-none"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        Admin tools: Activity logs, Products, and Locations
                        <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-slate-900 rotate-45"></span>
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Dropdown menu */}
                  {adminMenuOpen && (
                    <motion.div
                      className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {adminLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              'group relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            )}
                          >
                            {link.icon}
                            {link.label}
                            {/* Tooltip for dropdown items - only on hover, positioned to the right, wraps to ~2 lines */}
                            <span className="absolute left-full ml-2 px-3 py-2 text-xs text-white bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal w-64 z-[9999] pointer-events-none shadow-xl leading-relaxed">
                              {link.tooltip}
                              {/* Arrow pointing left */}
                              <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 w-2 h-2 bg-slate-900 rotate-45"></span>
                            </span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Role badge */}
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
              isAdmin
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-50 text-slate-700 border border-slate-200'
            )}>
              {isAdmin ? (
                <>
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3" />
                  <span>Operator</span>
                </>
              )}
            </div>
            <RoleSelector />
          </div>
        </div>
        {/* Mobile menu */}
        <div className="md:hidden pb-4 space-y-1">
          <NavLinkWithTooltip
            href="/scan"
            label="Scan"
            icon={<Camera className="w-4 h-4" />}
            tooltip="Your main workspace. Scan QR codes to receive incoming boxes, move boxes to shelves, or ship boxes out"
            isActive={pathname === '/scan'}
          />
          <NavLinkWithTooltip
            href="/inventory"
            label="Inventory"
            icon={<Package className="w-4 h-4" />}
            tooltip="Search and view all boxes in the warehouse. See what's in stock, where boxes are located, and filter by location or date"
            isActive={pathname === '/inventory'}
          />
          <NavLinkWithTooltip
            href="/create-box"
            label="Create Box"
            icon={<PlusCircle className="w-4 h-4" />}
            tooltip="Create and print QR code labels for boxes. Employees at the dock use this to label incoming shipments"
            isActive={pathname === '/create-box'}
          />
          {isAdmin && adminLinks.map((link) => (
            <NavLinkWithTooltip
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              tooltip={link.tooltip}
              isActive={pathname === link.href}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
