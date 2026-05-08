import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserMinus, 
  Calendar as CalendarIcon, 
  Plus, 
  MoreVertical,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  ListTodo,
  Bell,
  Check,
  ChevronDown,
  ArrowUpDown,
  Activity,
  Zap,
  ShieldAlert,
  Download,
  X,
  RefreshCw,
  History,
  UserPlus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../components/ui/sheet";
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAttendance } from '../hooks/useAttendance';
import { useVisitors } from '../hooks/useVisitors';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export function AttendancePage() {
  const { user } = useAuth();
  const { subPage } = useNavigation();
  const isStudent = user?.role === 'student';
  const isAuditor = user?.role === 'auditor';
  const isSecurity = user?.role === 'security';
  const isStaff = ['admin', 'warden', 'security', 'auditor'].includes(user?.role || '');

  const { attendance, missions, directives, stats: telemetryStats, isLoading: isAttendanceLoading, markAttendance, createMission, createDirective, updateMissionStatus, fetchStudentActivity } = useAttendance();
  const { visitors, isLoading: isVisitorsLoading } = useVisitors();
  const isLoading = isAttendanceLoading || isVisitorsLoading;

  const [activeTab, setActiveTab] = useState(isStudent ? 'planner' : (subPage || 'attendance'));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isProcessOverlayOpen, setIsProcessOverlayOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false);
  const [selectedStudentForActivity, setSelectedStudentForActivity] = useState<any>(null);
  const [studentActivity, setStudentActivity] = useState<{attendance: any[], visitors: any[]}>({ attendance: [], visitors: [] });
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  // Stats
  const stats = isStudent ? [
    { label: 'Hostel Presence', value: telemetryStats.presenceCount > 0 ? 'Verified' : 'Absent', icon: Activity, color: 'text-lime-500', bg: 'bg-lime-500/10', trend: 'Live', status: 'optimal' },
    { label: 'Active Missions', value: missions.filter(m => m.status === 'pending').length.toString(), icon: Zap, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'Tactical', status: 'critical' },
    { label: 'Pending Protocols', value: directives.length.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Strategic', status: 'caution' },
    { label: 'System Health', value: '100%', icon: ShieldAlert, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Nominal', status: 'info' },
  ] : isSecurity ? [
    { label: 'Verified Entries', value: telemetryStats.verifiedEntries.toString(), icon: Activity, color: 'text-lime-500', bg: 'bg-lime-500/10', trend: 'Live', status: 'optimal' },
    { label: 'Flagged Intrusions', value: telemetryStats.flaggedIntrusions.toString(), icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'Warning', status: 'critical' },
    { label: 'Late Returns', value: telemetryStats.lateReturns.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Active', status: 'caution' },
    { label: 'Active Patrols', value: telemetryStats.activePatrols.toString(), icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Deployed', status: 'info' },
  ] : [
    { label: 'Hostel Presence', value: telemetryStats.presenceCount.toString(), icon: Activity, color: 'text-lime-500', bg: 'bg-lime-500/10', trend: 'Live', status: 'optimal' },
    { label: 'Unverified Absence', value: telemetryStats.absenceCount.toString(), icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'Warning', status: 'critical' },
    { label: 'Late Ingress', value: telemetryStats.lateIngressCount.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Active', status: 'caution' },
    { label: 'Personnel on Leave', value: telemetryStats.leaveCount.toString(), icon: UserMinus, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Registry', status: 'info' },
  ];

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAction = (action: string, record: any) => {
    if (action === 'Scan ID Verification' || action === 'Verify Documents') {
       setSelectedRecord(record);
       setIsAuditModalOpen(true);
       return;
    }
    if (action === 'Timeline Sync') {
       setSelectedStudentForActivity(record.student);
       setIsActivityLoading(true);
       fetchStudentActivity(record.student_id).then(data => {
         setStudentActivity(data);
         setIsActivitySheetOpen(true);
       }).finally(() => setIsActivityLoading(false));
       return;
    }
    if (action === 'Verified Presence') {
       markAttendance(record.student_id, true);
       return;
    }
    setProcessTitle(action);
    setIsProcessOverlayOpen(true);
  };

  const processedData = useMemo(() => {
    let filtered = attendance.filter(record => {
      const student = record.student;
      const studentUser = student?.user;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
                           (studentUser?.full_name || '').toLowerCase().includes(searchLower) ||
                           (student?.student_id || '').toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'present' && record.is_present) ||
                           (statusFilter === 'absent' && !record.is_present);
      
      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const studentA = a.student;
        const studentUserA = studentA?.user;
        const studentB = b.student;
        const studentUserB = studentB?.user;

        let valA: any = '';
        let valB: any = '';

        switch (sortConfig.key) {
          case 'student':
            valA = studentUserA?.full_name || '';
            valB = studentUserB?.full_name || '';
            break;
          case 'status':
            valA = a.is_present;
            valB = b.is_present;
            break;
          default:
            break;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [attendance, searchQuery, statusFilter, sortConfig]);

  const processedVisitorData = useMemo(() => {
    let filtered = visitors.filter(visitor => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
                           (visitor.visitor_name || '').toLowerCase().includes(searchLower) ||
                           (visitor.purpose || '').toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'present' && !visitor.check_out_time) ||
                           (statusFilter === 'absent' && visitor.check_out_time);
      
      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let valA: any = '';
        let valB: any = '';

        switch (sortConfig.key) {
          case 'student':
            valA = a.visitor_name.toLowerCase();
            valB = b.visitor_name.toLowerCase();
            break;
          case 'status':
            valA = a.check_out_time ? true : false;
            valB = b.check_out_time ? true : false;
            break;
          default:
            break;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [visitors, searchQuery, statusFilter, sortConfig]);

  const roleTodos = missions;

  const activeDataLength = isSecurity ? processedVisitorData.length : processedData.length;
  const totalPages = Math.ceil(activeDataLength / pageSize);
  const paginatedAttendanceData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedVisitorData = processedVisitorData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#F9FAFB]/50">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-[#111111] uppercase">
            {isSecurity ? 'Access & Patrol' : 'Operational'} <span className="text-lime-500">{isSecurity ? 'Matrix' : 'Schedule'}</span>
          </h1>
          <p className="text-sm font-medium text-[#919191]">
            {isSecurity ? 'Monitor physical access logs and dynamic patrol schedules.' : 'Comprehensive ingress telemetry and personnel roster management.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setProcessTitle("Registry Export"); setIsProcessOverlayOpen(true); }} variant="outline" size="sm" className="rounded-xl border-[#F0F0F0] font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-4 group">
            <Download className="h-4 w-4 group-hover:text-lime-600 transition-colors" /> Export Registry
          </Button>
          {(user?.role === 'admin' || user?.role === 'warden') && (
            <Button 
              className="rounded-xl bg-[#111111] text-white hover:bg-lime-500 hover:text-black font-black text-[10px] uppercase tracking-widest h-10 px-6 transition-all active:scale-95 shadow-lg shadow-black/5"
              onClick={() => setIsEventModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Schedule Protocol
            </Button>
          )}
        </div>
      </div>

      <ScheduleEventModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSuccess={createDirective}
      />

      <CreateMissionModal 
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        role={user?.role || ''}
        onSuccess={createMission}
      />

      <AttendanceAuditModal 
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        record={selectedRecord}
        isSecurity={isSecurity}
      />

      {/* KPI Telemetry Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2rem] overflow-hidden group cursor-pointer hover:border-lime-500/50 border border-transparent transition-all"
            onClick={() => {
              if (stat.label.includes('Absence') || stat.label.includes('Intrusions')) setStatusFilter('absent');
              if (stat.label.includes('Presence') || stat.label.includes('Verified')) setStatusFilter('present');
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <Badge className={cn(
                  "border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center shadow-sm",
                  stat.status === 'critical' ? "bg-rose-500 text-white" : "bg-[#111111] text-lime-400"
                )}>
                  {stat.status === 'optimal' && <div className="h-1.5 w-1.5 rounded-full bg-lime-500 mr-1.5 animate-pulse" />}
                  {stat.trend}
                </Badge>
              </div>
              <h3 className="text-3xl font-black text-[#111111] leading-none mb-1 tabular-nums">{stat.value}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#111111] opacity-70 italic">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Terminal Interface */}
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white/40 p-2 rounded-[2.5rem] border border-white">
          <TabsList className="bg-[#111111] p-1 rounded-3xl h-14 w-full md:w-auto overflow-hidden">
            {!isStudent && (
              <TabsTrigger value="attendance" className="rounded-2xl px-12 h-full data-[state=active]:bg-[#D4FF3F] data-[state=active]:text-black font-black text-[10px] uppercase tracking-widest text-white/50 transition-all">
                {isSecurity ? 'Gate Logs & Clearance' : 'Ingress Registry'}
              </TabsTrigger>
            )}
            <TabsTrigger value="planner" className="rounded-2xl px-12 h-full data-[state=active]:bg-[#D4FF3F] data-[state=active]:text-black font-black text-[10px] uppercase tracking-widest text-white/50 transition-all">
              {isSecurity ? 'Patrol & Duty Roster' : 'Protocol Hub'}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === 'attendance' && (
              <>
                <div className="relative flex-1 md:w-[350px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#919191]" />
                  <Input 
                    placeholder="Filter by Student ID or Name..." 
                    className="pl-12 h-14 bg-white border-white shadow-2xl shadow-black/5 rounded-[1.5rem] font-bold text-sm focus-visible:ring-lime-500"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-14 rounded-[1.5rem] bg-[#111111] text-white hover:bg-[#222222] border-none shadow-xl gap-2 px-6 font-black text-[10px] uppercase tracking-widest">
                      <Filter className="h-4 w-4 text-lime-500" /> 
                      {statusFilter === 'all' ? 'All Tiers' : statusFilter === 'present' ? 'Verified' : 'Flagged'}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[220px] rounded-2xl border-none shadow-2xl p-2 bg-white">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-[#919191] tracking-widest mb-2 px-3">Telemetry Filters</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }} className="font-black text-[10px] uppercase tracking-widest flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer hover:bg-[#F9FAFB]">
                      Global Registry {statusFilter === 'all' && <Check className="h-4 w-4 text-lime-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setStatusFilter('present'); setCurrentPage(1); }} className="font-black text-[10px] uppercase tracking-widest flex items-center justify-between text-lime-600 rounded-xl px-4 py-3 cursor-pointer hover:bg-lime-50">
                      Verified Presence {statusFilter === 'present' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setStatusFilter('absent'); setCurrentPage(1); }} className="font-black text-[10px] uppercase tracking-widest flex items-center justify-between text-rose-600 rounded-xl px-4 py-3 cursor-pointer hover:bg-rose-50">
                      Baseline Absence {statusFilter === 'absent' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Tab 1: Ingress Registry */}
        {!isStudent && (
          <TabsContent value="attendance" className="mt-0 focus-visible:outline-none">
          <Card className="border-none shadow-2xl shadow-black/5 overflow-hidden bg-white/95 rounded-[3rem]">
            {!isSecurity ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-[#111111] border-none bg-[#111111]">
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16 px-8 cursor-pointer group" onClick={() => handleSort('student')}>
                    <div className="flex items-center gap-1">Subject Awareness <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 text-lime-500" /></div>
                  </TableHead>
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16 cursor-pointer group" onClick={() => handleSort('block')}>
                    <div className="flex items-center gap-1">Zoning <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 text-lime-500" /></div>
                  </TableHead>
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16">Operational Status</TableHead>
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16">Verified Entry</TableHead>
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16 text-right px-8">Dispatch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAttendanceData.map((record) => {
                  const student = record.student;
                  const studentUser = student?.user;
                  const block = student?.room?.building?.name || 'BLOCK ALPHA';
                  const floor = student?.room?.floor_number || 'FL-2';
                  
                  return (
                    <TableRow 
                      key={record.id} 
                      className="hover:bg-lime-50/30 transition-all border-b border-[#F0F0F0]/50 last:border-0 h-20 cursor-pointer"
                      onClick={() => {
                        setSelectedRecord(record);
                        setIsAuditModalOpen(true);
                      }}
                    >
                      <TableCell className="px-8">
                        <div className="flex items-center gap-4">
                          <div className="relative group">
                            <Avatar className="h-12 w-12 rounded-2xl shadow-lg border-2 border-white group-hover:scale-95 transition-transform duration-500">
                              <AvatarImage src={studentUser?.profile_picture_url} />
                              <AvatarFallback className="font-black bg-[#F9FAFB]">S</AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "absolute -top-1 -right-1 h-4 w-4 border-2 border-white rounded-full shadow-lg",
                              record.is_present ? "bg-lime-500 shadow-lime-500/50" : "bg-rose-500 shadow-rose-500/50"
                            )}>
                              {record.is_present && <div className="absolute inset-0 bg-lime-500 animate-ping rounded-full opacity-75" />}
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-xs text-[#111111] uppercase italic tracking-tight leading-none">{studentUser?.full_name}</p>
                            <p className="text-[10px] font-bold text-[#919191] mt-1 uppercase tracking-widest">{student?.student_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-[9px] text-[#111111] tracking-[0.2em]">{block}</span>
                          <span className="text-[10px] font-bold text-[#919191] italic">{floor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.15em] border-none shadow-sm min-w-[100px] justify-center",
                          record.is_present 
                            ? "bg-lime-500 text-black shadow-lime-500/20" 
                            : "bg-rose-500 text-white shadow-rose-500/20"
                        )}>
                          {record.is_present ? 'Verified' : 'Absent'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "font-mono text-xs font-black",
                            record.is_present ? "text-[#111111]" : "text-[#919191] italic"
                          )}>
                            {record.check_in_time || 'UN-VERIFIED'}
                          </span>
                          {record.is_present && (
                            <div className="flex items-center">
                              <div className="h-1 w-8 bg-lime-500 rounded-full" />
                              <div className="h-1 w-4 bg-[#F0F0F0] rounded-full ml-1" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white hover:shadow-2xl hover:shadow-black/10 transition-all">
                              <MoreVertical className="h-5 w-5 text-[#919191] group-hover:text-black" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-[1.5rem] border-none shadow-2xl w-60 p-2 bg-white">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-[#919191] tracking-widest mb-2 px-3">Registry Protocols</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#F0F0F0]" />
                             <DropdownMenuItem className="font-black text-[10px] uppercase tracking-widest gap-3 rounded-xl px-4 py-3 focus:bg-lime-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAction('Verified Presence', record); }}>
                               <CheckCircle2 className="h-4 w-4 text-lime-600" /> Manual Verification
                             </DropdownMenuItem>
                             <DropdownMenuItem className="font-black text-[10px] uppercase tracking-widest gap-3 rounded-xl px-4 py-3 focus:bg-purple-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAction('Timeline Sync', record); }}>
                               <Clock className="h-4 w-4 text-purple-600" /> Access Activity Log
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-[#F0F0F0]" />
                             <DropdownMenuItem className="font-black text-[10px] uppercase tracking-widest gap-3 text-rose-600 rounded-xl px-4 py-3 focus:bg-rose-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAction('Unauthorized Warning Dispatch', record); }}>
                               <Bell className="h-4 w-4" /> Dispatch Violation Ping
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-[#111111] border-none bg-[#111111]">
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16 px-8 cursor-pointer group" onClick={() => handleSort('student')}>
                    <div className="flex items-center gap-1">Visitor Identity <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 text-lime-500" /></div>
                  </TableHead>
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16 cursor-pointer group" onClick={() => handleSort('block')}>
                    <div className="flex items-center gap-1">Designation <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 text-lime-500" /></div>
                  </TableHead>
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16">Hostel Node Target</TableHead>
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16">Clearance Window</TableHead>
                  <TableHead className="font-black text-white text-[10px] uppercase tracking-widest h-16 text-right px-8">Dispatch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVisitorData.map((visitor) => {
                  const targetStudent = visitor.student;
                  const targetUser = targetStudent?.user;
                  const isCleared = !visitor.check_out_time;

                  return (
                    <TableRow 
                      key={visitor.id} 
                      className="hover:bg-lime-50/30 transition-all border-b border-[#F0F0F0]/50 last:border-0 h-20 cursor-pointer"
                      onClick={() => {
                        setSelectedRecord(visitor);
                        setIsAuditModalOpen(true);
                      }}
                    >
                      <TableCell className="px-8">
                        <div className="flex items-center gap-4">
                          <div className="relative group">
                            <div className="h-12 w-12 rounded-2xl bg-[#F0F0F0] flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-95 transition-transform duration-500">
                               <span className="font-black text-[#111111] text-lg italic">{visitor.visitor_name.charAt(0)}</span>
                            </div>
                            <div className={cn(
                              "absolute -top-1 -right-1 h-4 w-4 border-2 border-white rounded-full shadow-lg",
                              isCleared ? "bg-lime-500 shadow-lime-500/50" : "bg-[#919191] shadow-black/10"
                            )}>
                              {isCleared && <div className="absolute inset-0 bg-lime-500 animate-ping rounded-full opacity-75" />}
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-xs text-[#111111] uppercase italic tracking-tight leading-none">{visitor.visitor_name}</p>
                            <p className="text-[10px] font-bold text-[#919191] mt-1 uppercase tracking-widest">{visitor.visitor_phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge className="bg-[#111111]/5 text-[#111111] border border-black/5 font-black text-[9px] px-3 py-1.5 rounded-lg uppercase tracking-widest">
                           {visitor.visitor_type}
                         </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-[9px] text-[#111111] tracking-[0.2em]">{targetUser?.full_name || 'UNALLOCATED NODE'}</span>
                          <span className="text-[10px] font-bold text-[#919191] italic">{visitor.purpose || 'Routing'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <span className="font-mono text-[10px] font-black text-[#111111]">IN: {visitor.check_in_time?.split('T')[1]?.substring(0, 5) || '10:00'}</span>
                           {visitor.check_out_time ? (
                              <span className="font-mono text-[10px] font-black text-[#919191] italic">OUT: {visitor.check_out_time?.split('T')[1]?.substring(0, 5) || '18:00'}</span>
                           ) : (
                              <div className="flex items-center">
                                <div className="h-1 w-8 bg-lime-500 rounded-full" />
                                <div className="h-1 w-2 bg-[#F0F0F0] rounded-full ml-1" />
                              </div>
                           )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white hover:shadow-2xl hover:shadow-black/10 transition-all">
                              <MoreVertical className="h-5 w-5 text-[#919191] group-hover:text-black" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-[1.5rem] border-none shadow-2xl w-60 p-2 bg-white">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-[#919191] tracking-widest mb-2 px-3">Gate Protocols</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#F0F0F0]" />
                             <DropdownMenuItem className="font-black text-[10px] uppercase tracking-widest gap-3 rounded-xl px-4 py-3 focus:bg-lime-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAction('Finalize Egress', visitor); }}>
                               <CheckCircle2 className="h-4 w-4 text-lime-600" /> Log Check-Out
                             </DropdownMenuItem>
                             <DropdownMenuItem className="font-black text-[10px] uppercase tracking-widest gap-3 rounded-xl px-4 py-3 focus:bg-purple-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAction('Scan ID Verification', visitor); }}>
                               <Check className="h-4 w-4 text-purple-600" /> Verify Documents
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-[#F0F0F0]" />
                             <DropdownMenuItem className="font-black text-[10px] uppercase tracking-widest gap-3 text-rose-600 rounded-xl px-4 py-3 focus:bg-rose-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAction('Flag Entity', visitor); }}>
                               <ShieldAlert className="h-4 w-4" /> Flag Entity
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            )}

            {/* Pagination Terminal */}
            <div className="p-8 border-t border-[#F0F0F0]/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FAFBFC]/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#919191] italic">
                Telemetry Range: <span className="text-[#111111]">{(currentPage - 1) * pageSize + 1} — {Math.min(currentPage * pageSize, activeDataLength)}</span> / <span className="text-[#111111]">{activeDataLength} Subjects</span>
              </p>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-none shadow-sm h-10 px-4 font-black text-[10px] uppercase tracking-widest gap-2 bg-white"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-[#F0F0F0]">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "h-8 w-8 rounded-lg font-black text-xs",
                        currentPage === page ? "bg-[#111111] text-white" : "text-[#555555] opacity-50 hover:opacity-100"
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-none shadow-sm h-10 px-4 font-black text-[10px] uppercase tracking-widest gap-2 bg-white"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
        )}

        {/* Tab 2: Protocol Hub (Schedule & Tasks) */}
        <TabsContent value="planner" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Strategic Events */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter flex items-center gap-2">
                    {isSecurity ? 'Shift' : 'Strategic'} <span className="text-lime-500 italic">{isSecurity ? 'Schedule' : 'Timeline'}</span>
                  </h3>
                  <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">
                    {isSecurity ? 'Dynamic guard deployment shifts.' : 'Warden operational roadmap.'}
                  </p>
                </div>
                <Button onClick={() => setIsRosterModalOpen(true)} variant="ghost" className="rounded-xl h-10 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-white hover:shadow-sm">
                  Full Roster <ChevronRight className="h-4 w-4 text-lime-500" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {directives.map((event) => (
                  <Card key={event.id} className="border-none bg-white shadow-2xl shadow-black/5 hover:translate-x-1 transition-all cursor-pointer overflow-hidden relative rounded-[2.5rem] group">
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-2 transition-all group-hover:w-3",
                      event.type === 'meeting' ? 'bg-purple-500 shadow-[2px_0_10px_rgba(168,85,247,0.3)]' : 
                      event.type === 'inspection' ? 'bg-lime-500 shadow-[2px_0_10px_rgba(163,230,53,0.3)]' : 'bg-blue-500 shadow-[2px_0_10px_rgba(59,130,246,0.3)]'
                    )} />
                    <CardContent className="p-8 flex items-start justify-between gap-6">
                      <div className="flex gap-8">
                        <div className="flex flex-col items-center justify-center h-20 w-20 bg-[#F9FAFB] rounded-[2rem] shadow-inner shrink-0 border border-white">
                          <span className="text-[10px] font-black text-[#919191] uppercase tracking-widest">{new Date(event.created_at).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-3xl font-black text-[#111111]">{new Date(event.created_at).getDate()}</span>
                        </div>
                        <div className="pt-2">
                          <h4 className="font-black text-[#111111] text-xl uppercase italic tracking-tight leading-none mb-3 group-hover:text-lime-600 transition-colors">{event.title}</h4>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-[#111111] uppercase tracking-widest flex items-center gap-1.5 bg-[#F9FAFB] px-3 py-1.5 rounded-xl">
                              <Clock className="h-3 w-3 text-lime-500" /> {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <Badge className={cn(
                              "text-[8px] font-black uppercase tracking-[0.2em] py-1.5 px-3 rounded-xl border-none shadow-sm",
                              event.type === 'meeting' ? 'bg-purple-500/10 text-purple-700' : 
                              event.type === 'inspection' ? 'bg-lime-500/10 text-lime-700' : 'bg-blue-500/10 text-blue-700'
                            )}>
                              {event.type}
                            </Badge>
                          </div>
                          {event.description && <p className="text-xs text-[#919191] mt-4 font-bold leading-relaxed italic max-w-md">{event.description}</p>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-lime-50 group-hover:text-lime-600 transition-all">
                        <Bell className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Column: Tactical Duty Roster */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter flex items-center gap-2">
                    {isAuditor ? 'Forensic' : isSecurity ? 'Security' : 'Tactical'} <span className={cn("italic", isAuditor ? "text-lime-500" : isSecurity ? "text-rose-500" : "text-purple-500")}>{isSecurity ? 'Objectives' : 'Duty'}</span>
                  </h3>
                  <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">{isAuditor ? 'Forensic directives & ledger syncs.' : isSecurity ? 'Critical perimeter nodes.' : 'Mission critical tasks.'}</p>
                </div>
                <Badge className="bg-[#111111] text-lime-400 border-none font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full shadow-xl">
                  {roleTodos.filter(t => t.status === 'pending').length} ACTIVE MISSIONS
                </Badge>
              </div>

              <Card className="border-none bg-[#111111] shadow-2xl rounded-[3rem] overflow-hidden min-h-[500px] border border-white/5 relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                   <ListTodo className="h-40 w-40 text-lime-500" />
                </div>
                <CardHeader className="p-10 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-xl font-black uppercase italic tracking-tighter">
                        {user?.role === 'admin' ? 'Strategic Command Hub' : isAuditor ? 'Auditor Mission Focus' : isSecurity ? 'Guard Objective Priorities' : 'Mission Focus'}
                      </CardTitle>
                      <CardDescription className="text-white/30 font-bold text-[10px] uppercase tracking-widest mt-1">
                        {user?.role === 'admin' ? 'Authoritative operational directives.' : isAuditor ? 'High-priority forensic directives.' : isSecurity ? 'Live perimeter clearance tasks.' : 'High-priority operational directives.'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="h-10 w-10 text-white hover:bg-white/10 rounded-xl"
                      onClick={() => setIsMissionModalOpen(true)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-5 relative bg-gradient-to-b from-transparent to-black/20">
                  <div className="max-h-[420px] overflow-y-auto no-scrollbar space-y-5 px-1 pb-4">
                    {roleTodos.map((todo) => (
                      <div key={todo.id} className="flex items-start gap-5 p-6 rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all cursor-pointer group/task border border-white/5 shadow-xl shadow-black/20">
                        <div 
                          onClick={() => updateMissionStatus(todo.id, todo.status === 'completed' ? 'pending' : 'completed')}
                          className={cn(
                            "mt-1.5 h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 active:scale-95",
                            todo.status === 'completed' 
                              ? "bg-lime-500 border-lime-500" 
                              : "border-white/10 group-hover/task:border-lime-500 shadow-inner"
                          )}
                        >
                          {todo.status === 'completed' && <Check className="h-4 w-4 text-[#111111]" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className={cn(
                                "font-black text-sm transition-all uppercase italic tracking-tight",
                                todo.status === 'completed' ? "text-white/20 line-through" : "text-white"
                              )}>{todo.title}</h5>
                              {todo.category && (
                                <Badge className={cn(
                                  "text-[7px] font-black uppercase px-2 py-0.5 rounded-lg border-none",
                                  todo.category === 'global' ? "bg-purple-500 text-white" : "bg-blue-500 text-white"
                                )}>
                                  {todo.category}
                                </Badge>
                              )}
                            </div>
                            <Badge className={cn(
                              "text-[8px] font-black py-1 px-3 rounded-xl border-none shadow-lg",
                              todo.priority === 'high' ? "bg-rose-500 text-white" : 
                              todo.priority === 'medium' ? "bg-amber-500 text-black" : "bg-blue-500 text-white"
                            )}>
                              {todo.priority.toUpperCase()}
                            </Badge>
                          {todo.description && <p className="text-[11px] text-white/40 font-bold leading-normal mb-4 italic">{todo.description}</p>}
                          <div className="flex items-center justify-between">
                             <p className="text-[9px] text-[#D4FF3F] font-black flex items-center gap-1.5 uppercase tracking-widest">
                              <Clock className="h-3 w-3" /> Due: {todo.due_date}
                            </p>
                            <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                              <div className={cn("h-full bg-lime-500 transition-all", todo.status === 'completed' ? 'w-full' : 'w-1/3')} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6">
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-lime-500" />
                      <Input 
                        placeholder={isAuditor ? "INITIATE NEW FORENSIC DIRECTIVE..." : isSecurity ? "INITIATE NEW OBJECTIVE..." : "INITIATE NEW DIRECTIVE..."}
                        className="bg-white/5 border-white/5 text-white h-14 rounded-[1.5rem] font-black text-[10px] tracking-widest uppercase focus-visible:ring-1 focus-visible:ring-lime-500 pl-12 placeholder:text-white/20 cursor-pointer"
                        readOnly
                        onClick={() => setIsMissionModalOpen(true)}
                      />
                    </div>

                    {isAuditor && (
                      <Button className="w-full mt-4 bg-white/5 hover:bg-white/10 text-[#D4FF3F] border border-[#D4FF3F]/20 rounded-2xl h-12 font-black text-[9px] uppercase tracking-[0.2em] transition-all">
                        Archive Completed Protocols
                      </Button>
                    )}
                  </div>
                </CardContent>
                <div className="p-8 pt-0 mt-auto">
                  <Button onClick={() => { setProcessTitle("Protocol Execution"); setIsProcessOverlayOpen(true); }} className="w-full bg-[#111111] hover:bg-black text-white font-black uppercase tracking-widest border border-white/10 rounded-2xl h-14 text-[10px] transition-transform hover:-translate-y-1 z-10 shadow-2xl shadow-black/20">
                    {isAuditor ? 'Execute Forensic Batch' : 'Execute Protocol Batch'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Integrity Terminal Footer */}
      <div className="flex justify-end pt-4 italic">
        <p className="text-[10px] font-black text-[#919191]/40 tracking-[0.2em] uppercase">Roster Integrity: 100% • System Latency: 4ms • Encryption Active</p>
      </div>
      <ProcessOverlay 
        isOpen={isProcessOverlayOpen} 
        onClose={() => setIsProcessOverlayOpen(false)} 
        title={processTitle} 
      />
       <RosterRegistryModal 
         isOpen={isRosterModalOpen} 
         onClose={() => setIsRosterModalOpen(false)} 
         attendance={attendance}
       />
       <StudentActivitySheet 
         isOpen={isActivitySheetOpen}
         onClose={() => setIsActivitySheetOpen(false)}
         student={selectedStudentForActivity}
         activity={studentActivity}
         isLoading={isActivityLoading}
       />
    </div>
  );
}

function StudentActivitySheet({ isOpen, onClose, student, activity, isLoading }: any) {
  if (!student) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] border-l border-[#F0F0F0] p-0 bg-[#FAFBFC] overflow-y-auto">
        <SheetHeader className="p-8 border-b border-[#F0F0F0] bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-lime-500/10 flex items-center justify-center">
              <History className="h-6 w-6 text-lime-600" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter text-[#111111]">Activity <span className="text-lime-500">Tracer</span></SheetTitle>
              <SheetDescription className="text-[10px] font-black text-[#919191] uppercase tracking-[0.2em] mt-1">Forensic Timeline: {student.user?.full_name}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="p-8 space-y-8">
           {/* Student Profile Card */}
           <div className="bg-white p-6 rounded-[2rem] border border-[#F0F0F0] shadow-sm flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border-4 border-white shadow-xl">
                 <AvatarImage src={student.user?.profile_picture_url} />
                 <AvatarFallback className="text-xl font-black">{student.user?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                 <p className="text-xs font-black uppercase italic text-[#111111]">{student.user?.full_name}</p>
                 <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">{student.student_id} • {student.department}</p>
                 <Badge className="mt-2 bg-lime-500 text-black border-none text-[8px] font-black uppercase px-2 py-0.5">Verified Resident</Badge>
              </div>
           </div>

           {/* Timeline Matrix */}
           <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]">Ingress/Egress Logs</h4>
                 <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-[#F0F0F0]">Last 20 Nodes</Badge>
              </div>

              <div className="space-y-3">
                 {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-40">
                       <RefreshCw className="h-8 w-8 animate-spin text-lime-500" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Fetching Telemetry...</p>
                    </div>
                 ) : activity.attendance.length === 0 ? (
                    <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-[#F0F0F0]">
                       <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">No Ingress Activity Logged</p>
                    </div>
                 ) : (
                    activity.attendance.map((log: any, i: number) => (
                       <div key={i} className="bg-white p-5 rounded-2xl border border-[#F0F0F0] hover:border-lime-500/30 transition-all group flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", log.is_present ? "bg-lime-500/10" : "bg-rose-500/10")}>
                                {log.is_present ? <CheckCircle2 className="h-5 w-5 text-lime-600" /> : <XCircle className="h-5 w-5 text-rose-600" />}
                             </div>
                             <div className="text-left">
                                <p className="text-xs font-black uppercase italic text-[#111111]">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                <p className="text-[9px] font-bold text-[#919191] uppercase tracking-widest">{log.is_present ? 'Verified Entrance' : 'Unauthorized Absence'}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black tabular-nums text-[#111111]">{log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                             <p className="text-[8px] font-bold text-[#919191] uppercase">Timestamp</p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Visitor Associations */}
           <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]">Visitor Associations</h4>
                 <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-[#F0F0F0]">Guest Log</Badge>
              </div>

              <div className="space-y-3">
                 {activity.visitors.length === 0 ? (
                    <div className="py-8 text-center bg-white rounded-3xl border border-dashed border-[#F0F0F0]">
                       <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">No Guest Logs Identified</p>
                    </div>
                 ) : (
                    activity.visitors.map((visitor: any, i: number) => (
                       <div key={i} className="bg-white p-5 rounded-2xl border border-[#F0F0F0] hover:border-blue-500/30 transition-all flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-blue-600" />
                             </div>
                             <div className="text-left">
                                <p className="text-xs font-black uppercase italic text-[#111111]">{visitor.visitor_name}</p>
                                <p className="text-[9px] font-bold text-[#919191] uppercase tracking-widest">{visitor.visitor_type} • {new Date(visitor.check_in_time).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <Badge className="bg-blue-500/10 text-blue-700 border-none text-[8px] font-black uppercase px-2 py-0.5">Verified Guest</Badge>
                       </div>
                    ))
                 )}
              </div>
           </div>

           <Button className="w-full h-14 bg-black text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 transition-all">
              Download Forensic Artifact (PDF)
           </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProcessOverlay({ isOpen, onClose, title }: any) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setIsComplete(false);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsComplete(true);
            return 100;
          }
          return p + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="relative mx-auto h-24 w-24">
           <div className="absolute inset-0 rounded-full border-4 border-white/5" />
           <div 
             className="absolute inset-0 rounded-full border-4 border-lime-500 transition-all duration-100 ease-linear" 
             style={{ strokeDasharray: "300", strokeDashoffset: (300 - (progress * 3)).toString() }} 
           />
           <div className="absolute inset-0 flex items-center justify-center">
              {isComplete ? <CheckCircle2 className="h-10 w-10 text-lime-500 animate-in zoom-in duration-300" /> : <RefreshCw className="h-10 w-10 text-white animate-spin-slow" />}
           </div>
        </div>
        
        <div className="space-y-2">
           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{isComplete ? "Task Complete" : "Initializing..."}</h3>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{title}</p>
        </div>

        {isComplete ? (
          <Button onClick={onClose} className="w-full h-14 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-lime-500/20 animate-in slide-in-from-bottom-4 duration-500">
             Dismiss Console
          </Button>
        ) : (
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-lime-500 transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

function RosterRegistryModal({ isOpen, onClose, attendance }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-4xl border-none bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
         <div className="p-8 border-b border-[#F5F5F5] bg-[#FAFBFC] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                  <ListTodo className="h-6 w-6 text-lime-400" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter">Full Roster <span className="text-lime-500">Registry</span></h3>
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em]">Master Personnel Database</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-all bg-white border border-black/5">
               <X className="h-5 w-5 text-black" />
            </button>
         </div>
         <div className="flex-1 overflow-y-auto p-0">
            <Table>
               <TableHeader className="bg-black sticky top-0 z-10">
                  <TableRow className="hover:bg-black border-none h-16">
                     <TableHead className="text-white font-black text-[10px] uppercase tracking-widest px-8">Student Identity</TableHead>
                     <TableHead className="text-white font-black text-[10px] uppercase tracking-widest">Department</TableHead>
                     <TableHead className="text-white font-black text-[10px] uppercase tracking-widest">Current Status</TableHead>
                     <TableHead className="text-white font-black text-[10px] uppercase tracking-widest text-right px-8">Action</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {attendance.slice(0, 20).map((record: any) => {
                     const student = record.student;
                     const user = student?.user;
                     return (
                        <TableRow key={record.id} className="h-20 border-b border-[#F0F0F0] hover:bg-lime-50/20 transition-all">
                           <TableCell className="px-8">
                              <div className="flex items-center gap-3">
                                 <Avatar className="h-10 w-10 rounded-xl">
                                    <AvatarImage src={user?.profile_picture_url} />
                                    <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <p className="text-xs font-black uppercase italic tracking-tight">{user?.full_name}</p>
                                    <p className="text-[9px] font-bold text-[#919191] uppercase">{student?.student_id}</p>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell className="text-[10px] font-black text-[#555555] uppercase">{student?.department || 'N/A'}</TableCell>
                           <TableCell>
                              <Badge className="bg-lime-500/10 text-lime-700 border-none text-[8px] font-black uppercase px-2 py-1">Active Hub</Badge>
                           </TableCell>
                           <TableCell className="text-right px-8">
                              <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest">Details</Button>
                           </TableCell>
                        </TableRow>
                     );
                  })}
               </TableBody>
            </Table>
         </div>
         <div className="p-8 border-t border-[#F5F5F5] bg-[#FAFBFC] flex justify-end shrink-0">
            <Button onClick={onClose} className="h-12 px-8 bg-[#111111] text-white hover:bg-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
               Close Registry
            </Button>
         </div>
      </Card>
    </div>
  );
}

function ScheduleEventModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: (d: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priority, setPriority] = useState('medium');
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const isGlobal = formData.get('target_unit') === 'all';
      const directive = {
        title: formData.get('title'),
        target_unit: isGlobal ? null : formData.get('target_unit'),
        is_global: isGlobal,
        priority: priority
      };
      await onSuccess(directive);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">New <span className="text-lime-500">Protocol</span></h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Schedule Strategic Event</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Protocol Title</label>
              <input name="title" required placeholder="e.g. Health & Safety Audit" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-6 font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Date</label>
                  <input type="date" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-bold text-xs focus:ring-lime-500" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Time</label>
                  <input type="time" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-bold text-xs focus:ring-lime-500" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Protocol Type (Target Unit)</label>
               <select name="target_unit" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-black text-[10px] uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-lime-500">
                  <option value="warden">Warden Hub</option>
                  <option value="security">Security Node</option>
                  <option value="auditor">Auditor Ledger</option>
                  <option value="student">Student Terminal</option>
                  <option value="maintenance_staff">Maintenance Unit</option>
                  <option value="finance_officer">Finance Hub</option>
                  <option value="all">Global Node (Notice Board)</option>
               </select>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-[#111111] hover:bg-lime-500 hover:text-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <>Finalize Schedule <ChevronRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// --- Create Mission / Duty Modal ---
function CreateMissionModal({ isOpen, onClose, role, onSuccess }: { isOpen: boolean, onClose: () => void, role: string, onSuccess: (m: any) => void }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priority, setPriority] = useState('medium');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const isRoleTask = formData.get('scope') === 'role';
      
      const mission = {
        title: formData.get('title') || "Tactical Objective",
        description: formData.get('description'),
        priority: priority,
        assigned_role: isRoleTask ? role : null,
        assigned_user_id: !isRoleTask ? user?.id : null,
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      await onSuccess(mission);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#111111] text-white">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-lime-500 flex items-center justify-center">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Tactical <span className="text-lime-500">Duty</span></h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Issue New Directive</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Objective Title</label>
              <input name="title" required placeholder="e.g. Room 402 AC Inspection" className="w-full h-12 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-bold text-xs uppercase focus:ring-2 focus:ring-lime-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Detailed Description</label>
              <textarea name="description" required placeholder="Outline the tactical steps required..." className="w-full h-24 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl p-4 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Mission Scope</label>
              <select name="scope" className="w-full h-12 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-black text-[10px] uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-lime-500">
                  <option value="personal">Personal Objective (Private)</option>
                  {(role === 'admin' || role === 'warden') && <option value="role">Role Directive (Broadcast to {role.toUpperCase()})</option>}
              </select>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Priority Level</label>
               <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                        priority === p ? "bg-[#111111] text-white border-black" : "border-[#F0F0F0] text-[#919191] hover:border-black/10"
                      )}
                    >
                      {p}
                    </button>
                  ))}
               </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-lime-500/20">
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Dispatch Objective"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// --- Attendance Audit Modal ---
function AttendanceAuditModal({ isOpen, onClose, record, isSecurity }: any) {
  if (!isOpen || !record) return null;

  const isPresent = isSecurity ? !record.check_out_time : record.is_present;
  const name = isSecurity ? record.visitor_name : record.student?.user?.full_name;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
              <History className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Audit <span className="text-lime-500">Record</span></h3>
              <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Verified Ingress/Egress Telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-[#111111]" />
          </button>
        </div>
        
        <div className="flex">
           <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[500px]">
              <div className="flex items-center gap-6">
                 <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-white shadow-2xl">
                    <AvatarFallback className="text-2xl font-black bg-[#F9FAFB]">{name?.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div>
                    <Badge className={cn("mb-3 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-xl", isPresent ? "bg-lime-500 text-black" : "bg-rose-500 text-white")}>
                       {isPresent ? 'Verified Optimal' : 'Flagged Absence'}
                    </Badge>
                    <h4 className="text-3xl font-black text-[#111111] uppercase italic leading-none">{name}</h4>
                    <p className="text-[11px] font-bold text-[#919191] mt-2 uppercase tracking-widest">Protocol Node: {record.id}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-black/5">
                    <p className="text-[9px] font-black uppercase text-[#919191] mb-2">Ingress Identity</p>
                    <p className="text-sm font-black text-[#111111] italic">{isSecurity ? record.visitor_type : 'Hostel Resident'}</p>
                 </div>
                 <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-black/5">
                    <p className="text-[9px] font-black uppercase text-[#919191] mb-2">Target Node</p>
                    <p className="text-sm font-black text-[#111111] italic">{record.student_id || 'Global Routing'}</p>
                 </div>
              </div>

              <Separator className="bg-[#F5F5F5]" />

              <div className="space-y-4">
                 <h5 className="text-[10px] font-black text-[#111111] uppercase tracking-widest italic">Verification History</h5>
                 <div className="space-y-3">
                    {[
                      { time: isSecurity ? record.check_in_time?.split('T')[1]?.substring(0, 5) : record.check_in_time, label: 'Ingress Point Verified', status: 'optimal' },
                      { time: isSecurity ? record.check_out_time?.split('T')[1]?.substring(0, 5) : 'PENDING', label: 'Egress Point Sealed', status: isPresent ? 'standard' : 'critical' }
                    ].map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#F0F0F0]">
                         <div className="flex items-center gap-3">
                            <div className={cn("h-2 w-2 rounded-full", h.status === 'optimal' ? 'bg-lime-400' : h.status === 'critical' ? 'bg-rose-500' : 'bg-[#F0F0F0]')} />
                            <span className="text-[10px] font-black uppercase tracking-tight">{h.label}</span>
                         </div>
                         <span className="font-mono text-[10px] font-black opacity-40">{h.time || '00:00'}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="w-[260px] bg-[#FAFBFC] border-l border-[#F5F5F5] p-8 space-y-4">
              <p className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] mb-4">Registry Override</p>
              <Button className="w-full h-14 bg-[#111111] text-white rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => toast.success("Manual Ingress Authorized", { description: "Override granted. Entity logged." })}>Manual Ingress</Button>
              <Button variant="outline" className="w-full h-14 border-[#F0F0F0] font-black text-[10px] uppercase tracking-widest" onClick={() => toast.success("Cache Flushed", { description: "Local registry state cleared." })}>Flush Cache</Button>
              <Separator className="my-2 bg-[#F0F0F0]" />
              <Button variant="ghost" className="w-full h-14 text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest" onClick={() => toast.error("Irregularity Flagged", { description: "Security node notified of anomaly." })}>Flag Irregularity</Button>
           </div>
        </div>
      </Card>
    </div>
  );
}
