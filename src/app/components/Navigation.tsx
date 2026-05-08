import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building,
  Bed,
  CreditCard,
  MessageSquare,
  UserCheck,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Utensils,
  CalendarDays,
  Briefcase,
  Users2,
  Share2,
  Globe,
  UserCircle,
  Network,
  PieChart
} from 'lucide-react';
import type { UserRole } from '../types';
import { cn } from './ui/utils';

interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        path: 'dashboard',
        roles: ['admin', 'warden', 'student', 'security', 'finance_officer', 'maintenance_staff', 'auditor'],
      },
      {
        label: 'Complaints',
        icon: <MessageSquare className="h-4 w-4" />,
        path: 'complaints',
        roles: ['admin', 'warden', 'student', 'maintenance_staff'],
      },
      {
        label: 'Calendar & Todos',
        icon: <CalendarDays className="h-4 w-4" />,
        path: 'attendance',
        roles: ['admin', 'warden', 'security', 'auditor', 'student', 'maintenance_staff'],
      },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        label: 'Students',
        icon: <Users className="h-4 w-4" />,
        path: 'students',
        roles: ['admin', 'warden', 'auditor'],
      },
      {
        label: 'Room Allocation',
        icon: <Bed className="h-4 w-4" />,
        path: 'allocations',
        roles: ['admin', 'warden', 'student'],
      },
      {
        label: 'Visitors',
        icon: <UserCheck className="h-4 w-4" />,
        path: 'visitors',
        roles: ['admin', 'warden', 'security', 'student'],
      },
    ],
  },
  {
    title: 'FACILITY',
    items: [
      {
        label: 'Buildings & Rooms',
        icon: <Building className="h-4 w-4" />,
        path: 'rooms',
        roles: ['admin', 'warden'],
      },
      {
        label: 'Mess Management',
        icon: <Utensils className="h-4 w-4" />,
        path: 'mess',
        roles: ['admin', 'student'],
      },
    ],
  },
  {
    title: 'ORGANIZATION',
    items: [
      {
        label: 'Payments',
        icon: <CreditCard className="h-4 w-4" />,
        path: 'payments',
        roles: ['admin', 'finance_officer', 'student', 'auditor'],
      },
      {
        label: 'Reports',
        icon: <FileText className="h-4 w-4" />,
        path: 'reports',
        roles: ['admin', 'finance_officer', 'auditor'],
      },
      {
        label: 'Analytics',
        icon: <PieChart className="h-4 w-4" />,
        path: 'analytics',
        roles: ['admin', 'warden', 'finance_officer', 'auditor'],
      },
      {
        label: 'Setting',
        icon: <Settings className="h-4 w-4" />,
        path: 'settings',
        roles: ['admin', 'warden', 'student', 'security', 'finance_officer', 'maintenance_staff', 'auditor'],
      },
    ],
  },
];

interface NavigationProps {
  currentPath: string;
  userRole: UserRole;
  onNavigate: (path: string) => void;
  isMobile?: boolean;
}

export function Navigation({ currentPath, userRole, onNavigate, isMobile }: NavigationProps) {
  return (
    <nav className={cn('flex flex-col h-full bg-[#111111] text-[#919191] overflow-hidden', isMobile ? 'p-4' : 'p-6')}>
      {/* Scrollable Area */}
      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
        {navigationSections.map((section, idx) => {
          const allowedItems = section.items.filter((item) => item.roles.includes(userRole));
          if (allowedItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-4">
              {section.title && (
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#555555]">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {allowedItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => onNavigate(item.path)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group',
                        isActive
                          ? 'bg-[#D4FF3F] text-[#111111]'
                          : 'text-[#919191] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]'
                      )}
                    >
                      <span className={cn(
                        'transition-colors duration-200',
                        isActive ? 'text-[#111111]' : 'text-[#919191] group-hover:text-[#FFFFFF]'
                      )}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Need Help Card - as seen in image */}
      <div className="mt-8 px-2">
        <button className="w-full rounded-xl border border-[#333333] bg-transparent py-3 text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors">
          Need Help?
        </button>
        <p className="mt-4 text-center text-[10px] text-[#555555]">
          © 2026 Landmark, Inc.
        </p>
      </div>
    </nav>
  );
}
