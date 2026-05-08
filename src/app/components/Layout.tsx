import React from 'react';
import { Bell, LogOut, Menu, User, Search, Plus, ChevronDown, Settings, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from './ui/utils';

interface LayoutProps {
  children: React.ReactNode;
  onMenuClick?: () => void;
}

export function Layout({ children, onMenuClick }: LayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isQuickActionOpen, setIsQuickActionOpen] = React.useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin Team',
      warden: 'Warden Unit',
      student: 'Student Portal',
      security: 'Security Team',
      finance_officer: 'Finance Unit',
      maintenance_staff: 'Maintenance',
      auditor: 'Audit Team',
    };
    return labels[role] || role;
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white h-16 flex items-center shrink-0">
        <div className="flex w-full items-center justify-between px-6 gap-6">
          {/* Left section - Team Selector */}
          <div className="flex items-center gap-4 shrink-0">
            {onMenuClick && (
              <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="h-7 w-7 rounded-lg bg-[#111111] flex items-center justify-center text-white text-[10px] font-bold">
                HS
              </div>
              <span className="text-xs font-bold text-[#111111]">{getRoleLabel(user?.role || '')}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#919191]" />
            </div>
          </div>

          {/* Middle section - Search Bar */}
          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#919191] group-focus-within:text-lime-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything (Tickets, Students, Rooms)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  toast.success("Intelligence Search Initiated", {
                    description: `Scanning institutional nodes for "${searchQuery}"...`
                  });
                  setSearchQuery('');
                }
              }}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-4 focus:ring-lime-500/10 focus:border-lime-500 transition-all font-medium"
            />
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#111111] hover:bg-lime-500 hover:border-lime-500 transition-all group">
                  <Plus className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-[#E5E7EB] shadow-xl">
                <DropdownMenuLabel className="text-[10px] font-black text-[#919191] uppercase tracking-[0.2em] p-2">Quick Protocol</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === 'student' ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('complaints')} className="rounded-xl p-3 text-xs font-bold focus:bg-lime-50 cursor-pointer">
                      <Plus className="mr-3 h-4 w-4 text-lime-600" /> Log New Complaint
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('mess')} className="rounded-xl p-3 text-xs font-bold focus:bg-lime-50 cursor-pointer">
                      <Plus className="mr-3 h-4 w-4 text-lime-600" /> Book Mess Meal
                    </DropdownMenuItem>
                  </>
                ) : user?.role === 'finance_officer' ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('payments')} className="rounded-xl p-3 text-xs font-bold focus:bg-lime-50 cursor-pointer">
                      <Plus className="mr-3 h-4 w-4 text-lime-600" /> Record Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('payments')} className="rounded-xl p-3 text-xs font-bold focus:bg-lime-50 cursor-pointer">
                      <Plus className="mr-3 h-4 w-4 text-lime-600" /> Log Institutional Expense
                    </DropdownMenuItem>
                  </>
                ) : user?.role === 'warden' ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('allocations')} className="rounded-xl p-3 text-xs font-bold focus:bg-lime-50 cursor-pointer">
                      <Plus className="mr-3 h-4 w-4 text-lime-600" /> New Room Allocation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('visitors')} className="rounded-xl p-3 text-xs font-bold focus:bg-lime-50 cursor-pointer">
                      <Plus className="mr-3 h-4 w-4 text-lime-600" /> Log Visitor Entry
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="rounded-xl p-3 text-xs font-bold focus:bg-lime-50 cursor-pointer" onClick={() => toast.info("Quick Actions", { description: "General operational logging initialized." })}>
                    <Plus className="mr-3 h-4 w-4 text-lime-600" /> New General Log
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-9 w-9 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#111111] hover:bg-gray-50 transition-colors">
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-[#D4FF3F] border-2 border-white rounded-full flex items-center justify-center text-[7px] font-bold text-[#111111]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-[#E5E7EB] shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-[#F5F5F5] flex items-center justify-between bg-[#FAFBFC]">
                   <DropdownMenuLabel className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] p-0">Telemetry Alerts</DropdownMenuLabel>
                   <Button variant="ghost" onClick={markAllAsRead} className="h-auto p-0 text-[9px] font-black uppercase text-lime-600 hover:bg-transparent">Clear All</Button>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                       <Bell className="h-10 w-10 text-[#E5E7EB] mx-auto mb-3" />
                       <p className="text-xs font-bold text-[#919191]">All systems clear</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F5F5F5]">
                       {notifications.map((n) => (
                         <div 
                           key={n.id} 
                           onClick={() => markAsRead(n.id)}
                           className={cn("p-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer group relative", !n.is_read && "bg-lime-500/[0.03]")}
                         >
                            {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-lime-500" />}
                            <div className="flex gap-3">
                               <div className="h-8 w-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                                  <Activity className="h-4 w-4 text-lime-600" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#111111] leading-tight mb-1 truncate">{n.title}</p>
                                  <p className="text-[10px] text-[#555555] leading-relaxed line-clamp-2">{n.message}</p>
                                  <p className="text-[8px] font-black text-[#919191] uppercase tracking-widest mt-2">Just Now</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-[#FAFBFC] border-t border-[#F5F5F5] text-center">
                   <Button variant="link" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-[#111111]">View All Telemetry</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-[#FAFAFA] overflow-hidden hover:opacity-80 transition-opacity">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user?.profile_picture_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[9px] font-bold">
                      {user ? getInitials(user.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-[#E5E7EB] shadow-xl">
                <DropdownMenuLabel className="p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-[#111111]">{user?.full_name}</p>
                    <p className="text-xs text-[#919191]">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('settings')} className="rounded-xl p-3 text-sm font-medium focus:bg-[#FAFAFA] cursor-pointer">
                  <User className="mr-3 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('settings')} className="rounded-xl p-3 text-sm font-medium focus:bg-[#FAFAFA] cursor-pointer">
                  <Settings className="mr-3 h-4 w-4" />
                  App Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="rounded-xl p-3 text-sm font-medium text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-background p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
