import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  Search, 
  Plus, 
  Zap, 
  MoreVertical, 
  Repeat, 
  LogOut, 
  FileText, 
  MessageSquare,
  Building2,
  Bed,
  History,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Info,
  UserPlus,
  ClipboardCheck,
  CheckCircle2,
  Users2,
  Building as BuildingIcon,
  Bath,
  Wifi,
  Sparkles,
  Users,
  Activity, 
  UserCheck,
  ClipboardList,
  ShieldAlert,
  Archive,
  ArrowRightLeft,
  FileCheck,
  AlertTriangle,
  Lock,
  Key,
  Eraser,
  Check,
  X,
  RefreshCw,
  Star,
  FileSearch,
  UserMinus,
  Mail,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Contact,
  Loader2
} from 'lucide-react';
// import { mockAllocations, mockStudents, mockRooms, mockBuildings, mockUsers } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useAllocations } from '../hooks/useAllocations';
import { useStudents } from '../hooks/useStudents';
import { useInfrastructure } from '../hooks/useInfrastructure';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '../components/ui/pagination';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { OnboardingStatus } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export function AllocationsPage() {
  const { user } = useAuth();
  const { allocations, isLoading: allocLoading, allocateRoom, checkoutStudent, reassignRoom } = useAllocations();
  const { students, isLoading: studentsLoading, updateOnboardingStatus } = useStudents();
  const { rooms: allRooms, refresh: refreshInfra } = useInfrastructure();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isContractHubOpen, setIsContractHubOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
  const [targetStudent, setTargetStudent] = useState<any>(null);
  const [isCommsModalOpen, setIsCommsModalOpen] = useState(false);

  // Filter allocations based on user role
  const relevantAllocations = useMemo(() => {
    return user?.role === 'student'
      ? allocations.filter((a) => a.student?.user_id === user.id)
      : allocations;
  }, [user, allocations]);

  const filteredAllocations = useMemo(() => {
    return relevantAllocations.filter((allocation) => {
      const matchesSearch =
        (allocation.student?.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (allocation.studentUser?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (allocation.room?.room_number || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [relevantAllocations, searchTerm]);

  const totalPages = Math.ceil(filteredAllocations.length / itemsPerPage);
  const paginatedAllocations = filteredAllocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = relevantAllocations.filter((a) => a.status === 'active').length;
  const completedCount = relevantAllocations.filter((a) => a.status === 'completed').length;

  // Matrix Logic
  const onboardingStudents = useMemo(() => {
    return students.filter(s => s.onboarding_status !== 'assigned');
  }, [students]);

  const [matrixFilter, setMatrixFilter] = useState<string>('all');
  
  const filteredMatrix = useMemo(() => {
    return onboardingStudents.filter(s => {
      if (matrixFilter === 'all') return true;
      if (matrixFilter === 'reassignment') return s.onboarding_status === 'reassignment_requested';
      return s.onboarding_status === matrixFilter;
    });
  }, [onboardingStudents, matrixFilter]);

  const pipelineStats = {
    new: onboardingStudents.filter(s => s.onboarding_status === 'applied').length,
    verifying: onboardingStudents.filter(s => s.onboarding_status === 'verifying').length,
    interviewing: onboardingStudents.filter(s => s.onboarding_status === 'interviewing').length,
    pending: onboardingStudents.filter(s => s.onboarding_status === 'pending_assignment').length,
    reassignment: onboardingStudents.filter(s => s.onboarding_status === 'reassignment_requested').length,
  };

  if (allocLoading || studentsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-lime-500" />
          <p className="text-sm font-black uppercase tracking-widest text-[#919191]">Synchronizing Stay Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">Room <span className="text-lime-500">Allocations</span></h1>
          <p className="text-sm font-medium text-[#919191]">Intelligent student-room mapping and stay management.</p>
        </div>
        
        {user?.role === 'admin' && (
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-2xl border-2 border-black/5 hover:bg-black hover:text-white font-bold h-12 px-6 transition-all active:scale-95 group" onClick={() => setIsAssignmentModalOpen(true)}>
              <Activity className="mr-2 h-5 w-5 text-lime-500 group-hover:animate-pulse" />
              Quick Allocate
            </Button>
            <Button className="rounded-2xl bg-[#111111] hover:bg-black text-white font-bold h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none" onClick={() => setIsAssignmentModalOpen(true)}>
              <Plus className="mr-2 h-5 w-5 text-lime-400" />
              Manual Directive
            </Button>
          </div>
        )}
      </div>

      <StrategicAssignmentModal 
        isOpen={isAssignmentModalOpen}
        onClose={() => {
            setIsAssignmentModalOpen(false);
            setTargetStudent(null);
            setSelectedAllocation(null);
        }}
        initialStudent={targetStudent || (selectedAllocation ? selectedAllocation.student : null)}
        rooms={allRooms}
        onAllocate={async (studentId, roomId, dates) => {
            const res = await allocateRoom(studentId, roomId, dates);
            refreshInfra();
            return res;
        }}
      />

      <CheckoutAuthModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        allocation={selectedAllocation}
        onCheckout={async (id) => {
            await checkoutStudent(id);
            refreshInfra();
        }}
      />

      <AllocationContractHub 
        isOpen={isContractHubOpen}
        onClose={() => setIsContractHubOpen(false)}
        allocation={selectedAllocation}
        role={user?.role}
      />

      <RevokeAccessModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        allocation={selectedAllocation}
        onRevoke={async (id) => {
            await checkoutStudent(id);
            refreshInfra();
        }}
      />

      <VerificationMatrixModal 
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        student={targetStudent}
        onVerify={() => updateOnboardingStatus(targetStudent.id, 'verifying')}
      />

      <StrategicInterviewScorecard 
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        student={targetStudent}
        onPass={() => updateOnboardingStatus(targetStudent.id, 'pending_assignment')}
      />

      <CandidateDossierOverlay 
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        student={targetStudent}
      />
      {user?.role === 'student' && (
        <Card className="border-none shadow-2xl shadow-blue-500/5 bg-white rounded-[2rem] overflow-hidden mb-8">
          <CardContent className="p-8">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="h-16 w-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center shrink-0">
                      <UserCheck className="h-8 w-8 text-blue-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] mb-1">Your Onboarding Status</p>
                      <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tight">Institutional <span className="text-blue-500">Node Sync</span></h3>
                      <p className="text-xs font-medium text-[#919191] mt-1">Live tracking of your formal housing enrollment progress.</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   {['applied', 'verifying', 'interviewing', 'pending_assignment', 'assigned'].map((step, idx) => {
                      const currentStatus = students.find(s => s.user_id === user.id)?.onboarding_status;
                      const statusIndex = ['applied', 'verifying', 'interviewing', 'pending_assignment', 'assigned'].indexOf(currentStatus || '');
                      const isActive = idx <= statusIndex;
                      const isCurrent = idx === statusIndex;

                      return (
                        <div key={step} className="flex items-center gap-2">
                           <div className={cn(
                             "h-10 px-4 rounded-xl flex items-center justify-center font-black text-[9px] uppercase tracking-widest transition-all",
                             isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-[#F9FAFB] text-[#919191]"
                           )}>
                              {step.replace('_', ' ')}
                              {isCurrent && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                           </div>
                           {idx < 4 && <div className={cn("w-4 h-0.5 rounded-full", idx < statusIndex ? "bg-blue-500" : "bg-[#F0F0F0]")} />}
                        </div>
                      )
                   })}
                </div>
             </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="registry" className="space-y-8">
        <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-black/5">
          <TabsList className="bg-transparent border-none p-0 h-auto gap-2">
            <TabsTrigger value="registry" className="rounded-2xl px-8 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-lime-400 data-[state=active]:shadow-xl transition-all border-none">
              Stay Registry
            </TabsTrigger>
            {user?.role !== 'student' && (
              <TabsTrigger value="matrix" className="rounded-2xl px-8 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-blue-400 data-[state=active]:shadow-xl transition-all border-none">
                Enrollment Matrix
              </TabsTrigger>
            )}
          </TabsList>
          <div className="px-6 py-2 bg-white rounded-2xl shadow-inner border border-black/5">
             <p className="text-[10px] font-black italic uppercase text-[#111111]">Command Console <span className="text-lime-500 ml-2 animate-pulse text-[8px]">● Live</span></p>
          </div>
        </div>

        <TabsContent value="registry" className="space-y-8 mt-0 outline-none">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-2xl shadow-lime-500/5 bg-gradient-to-br from-white to-[#F9FAFB] rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="h-24 w-24 text-black" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/20">
                <Building2 className="h-6 w-6 text-lime-400" />
              </div>
              <p className="text-sm font-black text-[#111111] uppercase tracking-widest">Active Stays</p>
            </div>
            <h3 className="text-5xl font-black text-[#111111] leading-none mb-1 tabular-nums">{activeCount}</h3>
            <p className="text-xs font-bold text-lime-600 flex items-center gap-1 italic">
              Currently occupied units
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-black/5 bg-gradient-to-br from-[#111111] to-[#222222] rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <History className="h-24 w-24 text-white" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <History className="h-6 w-6 text-lime-400" />
              </div>
              <p className="text-sm font-black text-white/60 uppercase tracking-widest text-[10px]">History</p>
            </div>
            <h3 className="text-5xl font-black text-white leading-none mb-1 tabular-nums">{completedCount}</h3>
            <p className="text-xs font-bold text-white/40 uppercase">Completed stay records</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-lime-500/5 bg-white rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Bed className="h-24 w-24 text-lime-500" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-lime-500/10 flex items-center justify-center">
                <Bed className="h-6 w-6 text-lime-600" />
              </div>
              <p className="text-sm font-black text-[#111111] uppercase tracking-widest">Global Records</p>
            </div>
            <h3 className="text-5xl font-black text-[#111111] leading-none mb-1 tabular-nums">{relevantAllocations.length}</h3>
            <p className="text-xs font-bold text-[#919191] uppercase tracking-tighter italic">Lifetime allocations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Container */}
      <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden">
        <div className="p-6 flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919191] group-focus-within:text-lime-600 transition-colors" />
              <Input 
                placeholder="Search by student, ID, or room..." 
                className="pl-12 h-14 rounded-2xl border-none bg-white shadow-sm font-medium text-[#111111] placeholder:text-[#919191]/60 focus-visible:ring-2 focus-visible:ring-lime-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <p className="text-xs font-black text-[#555555] uppercase tracking-tighter bg-white px-4 py-2 rounded-xl shadow-sm border border-white">
              Showing <span className="text-lime-600 tabular-nums">{paginatedAllocations.length}</span> of {filteredAllocations.length} results
            </p>
          </div>

          {/* Premium Table */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50">
            <Table>
              <TableHeader className="bg-[#FAFBFC]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic">Student Information</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic">Room & Building</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Type</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Stay Duration</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Status</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-right px-6 text-[10px] uppercase tracking-widest italic opacity-50">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAllocations.map((allocation) => (
                  <TableRow key={allocation.id} className="hover:bg-[#F9FAFB] transition-colors group border-b border-[#F0F0F0]/50 last:border-0">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#EEF2F3] to-[#8E9EAB]/20 flex items-center justify-center font-bold text-[#555555] shadow-inner uppercase overflow-hidden ring-1 ring-black/5">
                          {allocation.studentUser?.profile_picture_url ? (
                            <img src={allocation.studentUser.profile_picture_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            allocation.studentUser?.full_name?.charAt(0) || 'S'
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[#111111] leading-none uppercase tracking-tight text-xs">{allocation.studentUser?.full_name}</p>
                          <p className="text-[9px] font-bold text-[#919191] mt-1 italic tracking-tight">{allocation.student?.student_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-[10px] text-[#111111] uppercase tracking-tighter">{allocation.building?.name}</span>
                        <span className="text-xs font-bold text-lime-600 italic">Room {allocation.room?.room_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="rounded-lg border-none bg-[#F3F4F6] text-[#555555] font-black text-[9px] uppercase tracking-widest">
                        {allocation.room?.room_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-[#111111] tabular-nums">
                          {new Date(allocation.allocation_date).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] font-bold text-[#919191] italic tracking-tighter">
                          until {allocation.expected_checkout_date ? new Date(allocation.expected_checkout_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={cn(
                          "rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                          allocation.status === 'active' 
                            ? "bg-lime-500/15 text-lime-700" 
                            : "bg-red-500/15 text-red-700"
                        )}
                      >
                        {allocation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      {user?.role === 'student' ? (
                        <Button variant="outline" className="h-10 rounded-xl font-black text-[9px] uppercase tracking-widest px-4 border-2 border-[#F0F0F0] hover:bg-black hover:text-white hover:border-black transition-all" onClick={() => { setSelectedAllocation(allocation); setIsContractHubOpen(true); }}>
                           View Contract
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-[#F0F0F0] transition-all">
                              <MoreVertical className="h-4 w-4 text-[#919191]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-52 bg-white/95 backdrop-blur-md">
                            <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-[#919191] mb-2 px-3">Allocation Ops</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={() => { setSelectedAllocation(allocation); setIsAssignmentModalOpen(true); }}>
                              <Repeat className="h-4 w-4 text-[#919191]" /> Reassign Room
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={() => { setSelectedAllocation(allocation); setIsCheckoutModalOpen(true); }}>
                              <LogOut className="h-4 w-4 text-[#919191]" /> Process Checkout
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={() => { setSelectedAllocation(allocation); setIsContractHubOpen(true); }}>
                              <FileCheck className="h-4 w-4 text-[#919191]" /> View Contract
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#F0F0F0]" />
                            <DropdownMenuItem className="rounded-xl font-bold gap-3 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer py-2.5" onClick={() => { setSelectedAllocation(allocation); setIsRevokeModalOpen(true); }}>
                              <ShieldCheck className="h-4 w-4 opacity-50" /> Revoke Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAllocations.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-3xl bg-[#F9FAFB] flex items-center justify-center">
                  <Search className="h-8 w-8 text-[#919191] opacity-20" />
                </div>
                <div>
                  <p className="font-black text-[#111111] uppercase tracking-widest text-sm">No allocations record</p>
                  <p className="text-xs font-bold text-[#919191] mt-1 italic uppercase tracking-tighter">Adjust your search parameters</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#919191]">
                Showing Page <span className="text-[#111111] tabular-nums">{currentPage}</span> of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-none shadow-sm bg-white hover:bg-lime-50 hover:text-lime-700 font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-4 disabled:opacity-30 transition-all active:scale-95"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 3 && currentPage > 2) {
                      pageNum = currentPage - 1 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (2 - i);
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        className={cn(
                          "w-10 h-10 rounded-xl font-black tabular-nums transition-all active:scale-95",
                          currentPage === pageNum 
                            ? "bg-black text-lime-400 hover:bg-black shadow-lg shadow-black/20" 
                            : "bg-white hover:bg-[#F0F0F0] text-[#555555]"
                        )}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button 
                  variant="outline" 
                  className="rounded-xl border-none shadow-sm bg-white hover:bg-lime-50 hover:text-lime-700 font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-4 disabled:opacity-30 transition-all active:scale-95"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

        </TabsContent>

        <TabsContent value="matrix" className="space-y-8 mt-0 outline-none">
          {/* Pipeline Telemetry Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: 'New Applied', value: pipelineStats.new, icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Verifying', value: pipelineStats.verifying, icon: ClipboardCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { label: 'Interviewing', value: pipelineStats.interviewing, icon: Users2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Pending Alloc', value: pipelineStats.pending, icon: CheckCircle2, color: 'text-lime-500', bg: 'bg-lime-500/10' },
              { label: 'Reassignments', value: pipelineStats.reassignment, icon: Repeat, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-xl shadow-black/5 bg-white rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer border border-white">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-[#919191] uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-[#111111] tabular-nums">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Matrix Control Bar */}
               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-[#F0F0F0] overflow-x-auto no-scrollbar">
                  {['all', 'applied', 'verifying', 'interviewing', 'pending_assignment', 'reassignment'].map((filter) => (
                    <Button 
                      key={filter}
                      variant="ghost" 
                      className={cn(
                        "rounded-xl px-4 py-2 h-auto font-black text-[9px] uppercase tracking-widest transition-all shrink-0",
                        matrixFilter === filter ? "bg-[#111111] text-white shadow-lg" : "text-[#919191] hover:bg-[#F9FAFB]"
                      )}
                      onClick={() => setMatrixFilter(filter)}
                    >
                      {filter.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="h-11 rounded-xl border-2 border-black/5 font-black text-[9px] uppercase tracking-widest px-6 hover:bg-black hover:text-white transition-all" onClick={() => toast.success("Matrix Exported", { description: "Strategic allocation matrix has been saved as an artifact." })}>
                    Export Matrix
                  </Button>
                  <Button className="h-11 rounded-xl bg-black text-lime-400 font-black text-[9px] uppercase tracking-widest px-6 shadow-xl shadow-black/20 hover:scale-105 transition-all" onClick={() => setIsAssignmentModalOpen(true)}>
                    Manual Directive
                  </Button>
                </div>
              </div>

              {/* Lifecycle Terminal Table */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50">
                <Table>
                  <TableHeader className="bg-[#FAFBFC]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic">Student Record</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Lifecycle Phase</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Docs Status</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Last Update</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-right px-6 text-[10px] uppercase tracking-widest italic opacity-50">Strategic Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMatrix.map((student) => (
                      <TableRow key={student.id} className="hover:bg-[#F9FAFB] transition-colors group border-b border-[#F0F0F0]/50 last:border-0">
                        <TableCell className="py-6 px-6">
                           <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#EEF2F3] to-[#8E9EAB]/10 flex items-center justify-center font-black text-[#555555] shadow-inner uppercase overflow-hidden ring-1 ring-black/5">
                              {student.user?.profile_picture_url ? (
                                <img src={student.user.profile_picture_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                student.user?.full_name?.charAt(0) || 'S'
                              )}
                            </div>
                            <div>
                              <p className="font-black text-[#111111] leading-none uppercase tracking-tight text-xs mb-1">{student.user?.full_name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-[#919191] italic bg-[#F0F0F0] px-2 py-0.5 rounded-md uppercase tracking-tighter">{student.student_id}</span>
                                <span className="text-[9px] font-medium text-blue-500 uppercase tracking-widest">{student.department}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={cn(
                              "rounded-xl px-3 py-1 font-black text-[8px] uppercase tracking-[.15em] border-none shadow-sm",
                              student.onboarding_status === 'applied' ? "bg-blue-500/10 text-blue-600" :
                              student.onboarding_status === 'verifying' ? "bg-purple-500/10 text-purple-600" :
                              student.onboarding_status === 'interviewing' ? "bg-amber-500/10 text-amber-600" :
                              student.onboarding_status === 'pending_assignment' ? "bg-lime-500/10 text-lime-600" :
                              "bg-rose-500/10 text-rose-600"
                            )}
                          >
                            {student.onboarding_status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex gap-1">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className={cn("h-1 w-4 rounded-full", i <= (student.onboarding_status === 'applied' ? 1 : 3) ? "bg-lime-500" : "bg-gray-200")} />
                              ))}
                            </div>
                            <span className="text-[8px] font-black uppercase text-[#919191] tracking-tighter">
                              {student.onboarding_status === 'applied' ? '1/3 Validated' : 'Verified'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <span className="text-[10px] font-bold text-[#111111] tabular-nums">2 mins ago</span>
                        </TableCell>
                        <TableCell className="text-right px-6">
                           <div className="flex items-center justify-end gap-2">
                            {student.onboarding_status === 'applied' && (
                              <Button size="sm" className="h-9 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-[8px] uppercase tracking-widest" onClick={() => { setTargetStudent(student); setIsVerificationModalOpen(true); }}>
                                Verify
                              </Button>
                            )}
                            {(student.onboarding_status === 'verifying' || student.onboarding_status === 'interviewing') && (
                              <Button size="sm" className="h-9 px-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black text-[8px] uppercase tracking-widest" onClick={() => { setTargetStudent(student); setIsInterviewModalOpen(true); }}>
                                Interview
                              </Button>
                            )}
                             {student.onboarding_status === 'interviewing' && (
                              <Button size="sm" className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[8px] uppercase tracking-widest" onClick={() => updateOnboardingStatus(student.id, 'pending_assignment')}>
                                Pass
                              </Button>
                            )}
                            {(student.onboarding_status === 'pending_assignment' || student.onboarding_status === 'reassignment_requested') && (
                              <Button size="sm" className="h-9 px-4 rounded-xl bg-lime-500 hover:bg-lime-600 text-black font-black text-[8px] uppercase tracking-widest shadow-lg shadow-lime-500/20" onClick={() => { setTargetStudent(student); setIsAssignmentModalOpen(true); }}>
                                Allocate
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-[#F0F0F0]">
                                  <MoreVertical className="h-4 w-4 text-[#919191]" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-52 bg-white/95 backdrop-blur-md">
                                <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-[#919191] mb-2 px-3">Candidate Ops</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-blue-50 focus:text-blue-700 cursor-pointer py-2.5" onClick={() => { setTargetStudent(student); setIsDossierOpen(true); }}>
                                  <FileSearch className="h-4 w-4 text-[#919191]" /> View Dossier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#111111]/10" />
                                <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-[#111111] focus:text-white cursor-pointer py-2.5" onClick={() => { setTargetStudent(student); setIsCommsModalOpen(true); }}>
                                  <MessageSquare className="h-4 w-4 opacity-50" /> Secure Transmission
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#F0F0F0]" />
                                <DropdownMenuItem className="rounded-xl font-bold gap-3 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer py-2.5" onClick={() => toast.error("Candidate Rejected", { description: "Student node disconnected from pipeline." })}>
                                  <UserMinus className="h-4 w-4 opacity-50" /> Reject Application
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Auto Allocation Card */}
      {user?.role === 'admin' && (
        <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 rounded-[1.5rem] bg-lime-500/10 flex items-center justify-center shrink-0">
                <Zap className="h-8 w-8 text-lime-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Manual <span className="text-lime-500 italic">Directive Engine</span></h3>
                  <Badge className="bg-lime-500/20 text-lime-500 text-[8px] uppercase tracking-widest border-none">Static Code Algorithm</Badge>
                </div>
                <p className="text-sm text-white/50 font-medium mb-6 max-w-2xl leading-relaxed italic">
                  The directive engine utilizes a static algorithmic approach to optimize assignments by balancing gender-specific zoning, unit capacities, and floor hierarchy protocols.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Room Capacity', icon: ShieldCheck },
                    { label: 'Gender Zoning', icon: Building2 },
                    { label: 'Resident Preference', icon: Info },
                    { label: 'Floor Hierarchy', icon: Zap }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                      <div className="h-2 w-2 rounded-full bg-lime-500 shadow-lg shadow-lime-500/50" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <CommsTerminalModal 
        isOpen={isCommsModalOpen} 
        onClose={() => setIsCommsModalOpen(false)} 
        targetName={targetStudent?.user?.full_name} 
      />
    </div>
  );
}

// --- Strategic Assignment Wizard (Allocation Flow) ---
function StrategicAssignmentModal({ isOpen, onClose, initialStudent, rooms, onAllocate }: { isOpen: boolean, onClose: () => void, initialStudent?: any, rooms: any[], onAllocate: (studentId: string, roomId: string, dates: { allocation_date: string, expected_checkout_date?: string }) => Promise<any> }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [expectedCheckoutDate, setExpectedCheckoutDate] = useState<string>('');
  const [checklist, setChecklist] = useState({
     bed: false,
     electric: false,
     water: false,
     locks: false
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const allChecked = Object.values(checklist).every(v => v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialStudent?.id || !selectedRoomId || !expectedCheckoutDate) {
      toast.error("Incomplete Protocol", { description: "Please ensure all target nodes are defined." });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAllocate(initialStudent.id, selectedRoomId, {
        allocation_date: new Date().toISOString().split('T')[0],
        expected_checkout_date: expectedCheckoutDate
      });
      toast.success("Strategic Allocation Sealed", {
        description: `Student node ${initialStudent?.user?.full_name || 'Resident'} successfully zone-mapped.`,
      });
      onClose();
      setStep(1);
      setSelectedRoomId('');
      setExpectedCheckoutDate('');
    } catch (error: any) {
      toast.error("Allocation Fault", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-xl border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                <Repeat className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Zoning <span className="text-lime-500">& Assignment</span></h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Step {step} of 3 • Allocation Protocol</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex gap-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= i ? "bg-lime-500 shadow-[0_0_10px_#D4FF3F]" : "bg-[#F0F0F0]")} />
               ))}
            </div>

            <div className="min-h-[300px]">
               {step === 1 && (
                 <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <h4 className="text-[10px] font-black uppercase text-[#111111] tracking-widest mb-4 flex items-center gap-2">
                       <UserPlus className="h-3 w-3 text-lime-500" /> Resident Mapping
                    </h4>
                    <div className="p-4 bg-lime-50 rounded-2xl border border-lime-100 flex items-center gap-4">
                       <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden border border-lime-200">
                          {initialStudent?.user?.full_name?.charAt(0) || 'S'}
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-lime-800 tracking-widest">Active Target</p>
                          <p className="text-sm font-black text-[#111111] uppercase italic">{initialStudent?.user?.full_name || 'No Student Selected'}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2 col-span-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1">Room Assignment Node</label>
                          <select 
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full h-12 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-black text-[10px] uppercase outline-none focus:ring-2 focus:ring-lime-500/20"
                          >
                             <option value="">Select Target Unit</option>
                             {rooms.filter(r => r.status === 'available').map(room => (
                               <option key={room.id} value={room.id}>Room {room.room_number} • {room.room_type} • {room.building?.name}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-2 col-span-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1">Target Termination (Expected Checkout)</label>
                          <input 
                            type="date"
                            value={expectedCheckoutDate}
                            onChange={(e) => setExpectedCheckoutDate(e.target.value)}
                            className="w-full h-12 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-bold text-xs focus:ring-2 focus:ring-lime-500/20 outline-none" 
                          />
                       </div>
                    </div>
                 </div>
               )}

               {step === 2 && (
                 <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <h4 className="text-[10px] font-black uppercase text-[#111111] tracking-widest mb-4 flex items-center gap-2">
                       <ClipboardList className="h-3 w-3 text-lime-500" /> Unit Inspection Checklist
                    </h4>
                    <div className="space-y-3">
                       {[
                         { id: 'bed', label: 'Furniture Topology (Bed, Desk, Chair)' },
                         { id: 'electric', label: 'Electrical Synchronization (Lights, Outlets)' },
                         { id: 'water', label: 'Hydraulic Integrity (Taps, Drainage)' },
                         { id: 'locks', label: 'Security Seals (Door Locks, Cabinet Keys)' }
                       ].map((item) => (
                         <div key={item.id} className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                            checklist[item.id as keyof typeof checklist] ? "bg-lime-50 border-lime-200" : "bg-[#FAFBFC] border-[#F0F0F0]"
                         )} onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof checklist] }))}>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", checklist[item.id as keyof typeof checklist] ? "text-lime-700" : "text-[#919191]")}>{item.label}</span>
                            <div className={cn("h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all", checklist[item.id as keyof typeof checklist] ? "bg-lime-500 border-lime-500 text-black" : "border-[#E0E0E0]")}>
                               {checklist[item.id as keyof typeof checklist] && <Check className="h-4 w-4" />}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center text-center">
                    <div className="h-24 w-24 rounded-[2rem] bg-lime-500/10 flex items-center justify-center mb-4">
                       <Archive className="h-10 w-10 text-lime-500" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Seal Allocation</h4>
                       <p className="text-xs font-bold text-[#919191] max-w-xs mt-2 italic leading-relaxed">
                          By finalizing, you are authorizing the residential node and activating the fiscal ledger for this unit.
                       </p>
                    </div>
                    <div className="w-full p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5 text-left">
                       <p className="text-[8px] font-black uppercase text-[#919191] mb-2 tracking-[0.2em]">Summary Check</p>
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Inspection Integrity</span>
                          <span className="text-[10px] font-black text-lime-600 uppercase">Passed</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Building Sync</span>
                           <span className="text-[10px] font-black text-lime-600 uppercase">Synchronized</span>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#F5F5F5]">
               {step > 1 && (
                 <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest" onClick={prevStep}>
                    Previous Node
                 </Button>
               )}
               {step < 3 ? (
                 <Button type="button" 
                  disabled={step === 2 && !allChecked}
                  className="flex-1 h-14 bg-black text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl" 
                  onClick={nextStep}>
                    {step === 2 ? 'Verify & Continue' : 'Next Protocol'} <ChevronRight className="h-4 w-4 ml-2" />
                 </Button>
               ) : (
                 <Button type="submit" disabled={isSubmitting} className="flex-1 h-14 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-lime-500/20">
                    {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Authorize Unit"}
                 </Button>
               )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

// --- Checkout Auth Modal (Secure Exit) ---
function CheckoutAuthModal({ isOpen, onClose, allocation, onCheckout }: { isOpen: boolean, onClose: () => void, allocation: any, onCheckout: (allocationId: string) => Promise<void> }) {
  const [checklist, setChecklist] = useState({
     keys: false,
     damages: false,
     clearance: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !allocation) return null;

  const allReady = Object.values(checklist).every(v => v);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocation?.id) return;

    setIsSubmitting(true);
    try {
      await onCheckout(allocation.id);
      toast.error("Residential Node Terminated", {
        description: `Resident ${allocation.studentUser?.full_name} has successfully checked out.`,
      });
      onClose();
    } catch (error: any) {
      toast.error("Checkout Fault", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleCheckout}>
          <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-rose-50/20">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-rose-500 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Stay <span className="text-rose-500">Termination</span></h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Checkout Protocol</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-4">
               <Avatar className="h-12 w-12 rounded-xl ring-2 ring-white">
                  <AvatarImage src={allocation.studentUser?.profile_picture_url} />
                  <AvatarFallback>{allocation.studentUser?.full_name?.charAt(0) || 'S'}</AvatarFallback>
               </Avatar>
               <div>
                  <p className="text-[8px] font-black uppercase text-rose-800 tracking-widest">Exiting Resident</p>
                  <p className="text-sm font-black text-[#111111] uppercase italic">{allocation.studentUser?.full_name}</p>
               </div>
            </div>

            <div className="space-y-3">
               <h5 className="text-[10px] font-black text-[#111111] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-rose-500" /> Security Sweep Protocol
               </h5>
               {[
                 { id: 'keys', label: 'Unit Accessory Recovery (Keys/Cards)' },
                 { id: 'damages', label: 'Damage Assessment Override' },
                 { id: 'clearance', label: 'Institutional Clearance Verified' }
               ].map((item) => (
                 <div key={item.id} className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                    checklist[item.id as keyof typeof checklist] ? "bg-rose-50 border-rose-200" : "bg-[#FAFBFC] border-[#F0F0F0]"
                 )} onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof checklist] }))}>
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", checklist[item.id as keyof typeof checklist] ? "text-rose-700" : "text-[#919191]")}>{item.label}</span>
                    <div className={cn("h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all", checklist[item.id as keyof typeof checklist] ? "bg-rose-500 border-rose-500 text-white" : "border-[#E0E0E0]")}>
                       {checklist[item.id as keyof typeof checklist] && <Check className="h-3 w-3" />}
                    </div>
                 </div>
               ))}
            </div>

            <Button type="submit" disabled={!allReady || isSubmitting} className={cn(
               "w-full h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl",
               allReady ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20" : "bg-[#F0F0F0] text-[#919191] cursor-not-allowed"
            )}>
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Complete De-Allocation"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// --- Allocation Contract Hub (Premium Overlay) ---
function AllocationContractHub({ isOpen, onClose, allocation, role }: { isOpen: boolean, onClose: () => void, allocation: any, role?: string }) {
  const [isCommsModalOpen, setIsCommsModalOpen] = useState(false);
  const [isRoomDossierOpen, setIsRoomDossierOpen] = useState(false);
  const [studentName, setStudentName] = useState('Unknown Student');
  
  if (!isOpen || !allocation) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 flex flex-col items-center text-center">
           <div className="h-20 w-20 rounded-[1.5rem] bg-[#111111] flex items-center justify-center mb-6 shadow-2xl shadow-black/20">
              <FileCheck className="h-10 w-10 text-lime-400" />
           </div>
           
           <h3 className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter">Strategic <span className="text-lime-500">Contract Hub</span></h3>
           <p className="text-[10px] font-bold text-[#919191] uppercase tracking-[0.3em] mt-2 italic">Institutional Residency ID: {allocation.id}</p>

           <div className="mt-10 w-full grid grid-cols-2 gap-6">
              <div className="text-left p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5">
                 <p className="text-[8px] font-black text-[#919191] uppercase tracking-widest mb-4">Resident Metadata</p>
                 <p className="text-sm font-black text-[#111111] uppercase tracking-tight mb-1">{allocation.studentUser?.full_name}</p>
                 <p className="text-[10px] font-bold text-lime-600 italic uppercase">{allocation.student?.student_id}</p>
              </div>
              <div className="text-left p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5">
                 <p className="text-[8px] font-black text-[#919191] uppercase tracking-widest mb-4">Unit Designation</p>
                 <p className="text-sm font-black text-[#111111] uppercase tracking-tight mb-1">Room {allocation.room?.room_number}</p>
                 <p className="text-[10px] font-bold text-lime-600 italic uppercase">{allocation.building?.name}</p>
              </div>
           </div>

           <div className="mt-6 w-full p-8 bg-[#111111] rounded-[2.5rem] text-white/90 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShieldCheck className="h-32 w-32" />
              </div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-6">Contract Temporal Sync</p>
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Commencement Date</span>
                 <span className="font-mono text-sm font-black text-lime-400">{new Date(allocation.allocation_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Target Termination</span>
                 <span className="font-mono text-sm font-black text-lime-400">{allocation.expected_checkout_date ? new Date(allocation.expected_checkout_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Fiscal Status</span>
                 <span className="text-[10px] font-black bg-lime-500/10 text-lime-500 px-3 py-1 rounded-full uppercase italic">Paid in Full</span>
              </div>
           </div>

           <div className="mt-10 flex gap-4 w-full">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 border-black/5 font-black text-[10px] uppercase tracking-widest group hover:bg-black hover:text-white transition-all" onClick={() => toast.success("Artifact Downloaded", { description: "PDF artifact has been saved to your device." })}>
                 <FileText className="mr-2 h-4 w-4 text-lime-500" /> Download PDF Artifact
              </Button>
              <Button className="flex-1 h-14 bg-black text-white hover:bg-[#222222] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all" onClick={onClose}>
                 Close Hub Terminal
              </Button>
            </div>
            <div className="mt-6 w-full pt-6 border-t border-white/10 flex gap-4">
                {role !== 'student' ? (
                   <Button className="flex-1 h-14 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20" onClick={() => { setStudentName(allocation.studentUser?.full_name || 'Unknown Student'); setIsCommsModalOpen(true); }}>
                      Contact Candidate
                   </Button>
                ) : (
                   <>
                     <Button className="flex-1 h-14 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-lime-500/20" onClick={() => setIsRoomDossierOpen(true)}>
                        <Bed className="mr-2 h-4 w-4" /> View Room Details
                     </Button>
                     <RoomInventoryDossier 
                       isOpen={isRoomDossierOpen} 
                       onClose={() => setIsRoomDossierOpen(false)} 
                       room={allocation.room}
                       building={allocation.building}
                     />
                   </>
                )}
             </div>
         </div>
       </Card>
       <CommsTerminalModal isOpen={isCommsModalOpen} onClose={() => setIsCommsModalOpen(false)} targetName={studentName} />
    </div>
  );
}

// --- Revoke Access Modal (Secure Decommission) ---
function RevokeAccessModal({ isOpen, onClose, allocation, onRevoke }: { isOpen: boolean, onClose: () => void, allocation: any, onRevoke: (allocationId: string) => Promise<void> }) {
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !allocation) return null;

  const isConfirmed = confirmText === 'REVOKE';

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || !allocation?.id) return;

    setIsSubmitting(true);
    try {
      await onRevoke(allocation.id);
      toast.error("Access Credentials Revoked", {
        description: `Security node for ${allocation.studentUser?.full_name} has been synchronized with gate access control.`,
      });
      onClose();
      setConfirmText('');
    } catch (error: any) {
      toast.error("Revocation Fault", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleRevoke}>
           <div className="p-8 border-b border-rose-50 flex justify-between items-center bg-rose-50/30">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-rose-600 uppercase italic tracking-tight">Access <span className="text-black">Revocation</span></h3>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">Security Override</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="p-6 bg-[#FAFBFC] rounded-2xl border border-rose-100/50">
               <div className="flex items-center gap-2 text-rose-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Immediate Sector Lockout</span>
               </div>
               <p className="text-xs font-bold text-[#555555] leading-relaxed">
                  Initiating credential revocation for <span className="text-black font-black uppercase italic">"{allocation.studentUser?.full_name}"</span>. This will immediately disable all digitized keycards and gate access nodes associated with Unit {allocation.room?.room_number}.
               </p>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#919191] flex items-center justify-between">
                  Type <span className="text-rose-600 text-xs italic">"REVOKE"</span> to execute
                  <Lock className="h-3 w-3 opacity-30" />
               </label>
               <input 
                  autoFocus
                  required
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SECURITY_AUTH_CHALLENGE" 
                  className={cn(
                    "w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-mono font-bold text-xs uppercase tracking-[0.2em] focus:outline-none transition-all",
                    isConfirmed ? "border-rose-500 ring-2 ring-rose-500/20 text-rose-600" : "focus:border-black"
                  )}
               />
            </div>

            <Button 
                type="submit" 
                disabled={!isConfirmed || isSubmitting} 
                className={cn(
                    "w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl",
                    isConfirmed 
                        ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20" 
                        : "bg-[#F0F0F0] text-[#919191] cursor-not-allowed"
                )}
            >
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Deactivate Keycards"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// --- Verification Matrix Modal (Document Check) ---
function VerificationMatrixModal({ isOpen, onClose, student, onVerify }: { isOpen: boolean, onClose: () => void, student: any, onVerify: () => void }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [docs, setDocs] = useState({
     id_proof: false,
     admission_letter: false,
     fee_receipt: false
  });

  if (!isOpen || !student) return null;

  const allReady = Object.values(docs).every(v => v);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerify();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-blue-50/20">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                 <FileSearch className="h-5 w-5 text-white" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Document <span className="text-blue-500">Matrix</span></h3>
                 <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Verification Phase</p>
              </div>
           </div>
           <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
           </button>
        </div>

        <div className="p-8 space-y-6">
           <div className="flex items-center gap-4 p-4 bg-[#FAFBFC] rounded-2xl border border-black/5">
              <Avatar className="h-12 w-12 rounded-xl">
                 <AvatarImage src={student.user?.profile_picture_url} />
                 <AvatarFallback>{student.user?.full_name?.charAt(0) || 'S'}</AvatarFallback>
              </Avatar>
              <div>
                 <p className="text-[10px] font-black uppercase text-[#111111] tracking-tight">{student.user?.full_name}</p>
                 <p className="text-[9px] font-bold text-blue-600 uppercase italic">ID: {student.student_id}</p>
              </div>
           </div>

           <div className="space-y-3">
              {[
                { id: 'id_proof', label: 'Government ID Validation' },
                { id: 'admission_letter', label: 'Institutional Admission Sync' },
                { id: 'fee_receipt', label: 'Fiscal Clearance Artifact' }
              ].map(doc => (
                 <div key={doc.id} className={cn(
                    "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                    docs[doc.id as keyof typeof docs] ? "bg-blue-50 border-blue-200" : "bg-[#FAFBFC] border-[#F0F0F0]"
                 )} onClick={() => setDocs(prev => ({ ...prev, [doc.id]: !prev[doc.id as keyof typeof docs] }))}>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", docs[doc.id as keyof typeof docs] ? "text-blue-700" : "text-[#919191]")}>{doc.label}</span>
                    <div className={cn("h-5 w-5 rounded-lg border-2 flex items-center justify-center", docs[doc.id as keyof typeof docs] ? "bg-blue-500 border-blue-500 text-white" : "border-[#E0E0E0]")}>
                       {docs[doc.id as keyof typeof docs] && <Check className="h-3.5 w-3.5" />}
                    </div>
                 </div>
              ))}
           </div>

           <Button disabled={!allReady || isVerifying} onClick={handleVerify} className={cn(
              "w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all",
              allReady ? "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20" : "bg-[#F0F0F0] text-[#919191]"
           )}>
              {isVerifying ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Finalize Documentation"}
           </Button>
        </div>
      </Card>
    </div>
  );
}

// --- Strategic Interview Scorecard (Performance Flow) ---
function StrategicInterviewScorecard({ isOpen, onClose, student, onPass }: { isOpen: boolean, onClose: () => void, student: any, onPass: () => void }) {
  const [isCommsModalOpen, setIsCommsModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('Unknown Student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
     discipline: 0,
     hygiene: 0,
     communication: 0
  });

  if (!isOpen || !student) return null;

  const handlePass = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onPass();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 border-b border-[#F5F5F5] flex justify-between items-center bg-[#111111] text-white">
           <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                 <Users2 className="h-7 w-7 text-white" />
              </div>
              <div>
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter">Strategic <span className="text-amber-500">Scorecard</span></h3>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-1">Interview Assessment Node</p>
              </div>
           </div>
           <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all text-white">
              <X className="h-5 w-5" />
           </button>
        </div>

        <div className="p-10 space-y-10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <Avatar className="h-16 w-16 rounded-2xl ring-4 ring-[#F5F5F5]">
                    <AvatarImage src={student.user?.profile_picture_url} />
                    <AvatarFallback className="bg-amber-500 text-white font-black">{student.user?.full_name?.charAt(0) || 'S'}</AvatarFallback>
                 </Avatar>
                 <div>
                    <p className="text-xl font-black text-[#111111] uppercase italic tracking-tight leading-none mb-1">{student.user?.full_name}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">{student.department}</span>
                       <span className="h-1 w-1 rounded-full bg-amber-500" />
                       <span className="text-[10px] font-black text-amber-600 uppercase italic">Ref: {student.student_id}</span>
                    </div>
                 </div>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest animate-pulse">Live Interview</Badge>
           </div>

           <div className="space-y-8">
              {[
                { id: 'discipline', label: 'Behavioral Discipline', icon: ShieldCheck },
                { id: 'hygiene', label: 'Institutional Hygiene Sync', icon: Zap },
                { id: 'communication', label: 'Verbal Communication', icon: MessageSquare }
              ].map(metric => (
                 <div key={metric.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <metric.icon className="h-4 w-4 text-amber-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-[#111111]">{metric.label}</span>
                       </div>
                       <span className="text-sm font-black text-amber-600 tabular-nums">{ratings[metric.id as keyof typeof ratings]}/5</span>
                    </div>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onClick={() => setRatings(prev => ({ ...prev, [metric.id]: star }))}
                            className={cn(
                              "h-10 flex-1 rounded-xl transition-all active:scale-95 group relative overflow-hidden",
                              star <= ratings[metric.id as keyof typeof ratings] ? "bg-amber-500 shadow-xl shadow-amber-500/20" : "bg-[#F9FAFB] border border-[#F0F0F0]"
                            )}
                          >
                             <Star className={cn("mx-auto h-5 w-5 transition-all text-white", star <= ratings[metric.id as keyof typeof ratings] ? "scale-110" : "text-[#DEDEDE]")} />
                          </button>
                       ))}
                    </div>
                 </div>
              ))}
           </div>

           <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 border-black/5 font-black text-[10px] uppercase tracking-widest hover:border-red-500 hover:text-red-600 transition-all">
                 <ThumbsDown className="mr-2 h-4 w-4" /> Reject Node
              </Button>
              <Button onClick={handlePass} disabled={isSubmitting} className="flex-1 h-14 bg-[#111111] text-white hover:bg-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95">
                 {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><ThumbsUp className="mr-2 h-4 w-4 text-lime-400" /> Pass Candidate</>}
              </Button>
            </div>
            
            <div className="w-full pt-4 border-t border-[#F0F0F0] mt-6 flex gap-4">
               <Button className="flex-1 h-14 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20" onClick={() => { setStudentName(student.user?.full_name || 'Unknown Student'); setIsCommsModalOpen(true); }}>
                  Contact Candidate
               </Button>
            </div>
         </div>
       </Card>
       <CommsTerminalModal isOpen={isCommsModalOpen} onClose={() => setIsCommsModalOpen(false)} targetName={studentName} />
    </div>
  );
}

// --- Candidate Dossier Overlay (Profile Deep-Dive) ---
function CandidateDossierOverlay({ isOpen, onClose, student }: { isOpen: boolean, onClose: () => void, student: any }) {
  const [isCommsModalOpen, setIsCommsModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('Unknown Student');
  
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="h-full w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
         <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Candidate <span className="text-blue-500">Dossier</span></h3>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5 text-[#111111]">
              <X className="h-5 w-5" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-8 space-y-10">
            <div className="flex flex-col items-center text-center">
               <Avatar className="h-32 w-32 rounded-[2.5rem] mb-6 shadow-2xl ring-8 ring-blue-50">
                  <AvatarImage src={student.user?.profile_picture_url} />
                  <AvatarFallback className="text-4xl">{student.user?.full_name?.charAt(0) || 'S'}</AvatarFallback>
               </Avatar>
               <h4 className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter leading-none">{student.user?.full_name}</h4>
               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mt-3 bg-blue-50 px-4 py-1.5 rounded-full mb-2">Institutional ID: {student.student_id}</p>
               <div className="flex items-center gap-2 mt-4">
                  <Badge className="bg-black text-white hover:bg-black rounded-lg px-3 py-1 text-[9px] uppercase tracking-widest border-none">{student.department}</Badge>
                  <Badge className="bg-lime-500 text-black hover:bg-lime-500 rounded-lg px-3 py-1 text-[9px] uppercase tracking-widest border-none">Year {student.year_of_study}</Badge>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Origin Sector', value: student.permanent_address || 'Unmapped' },
                 { label: 'Communication Hub', value: student.user?.email || 'No Signal' },
                 { label: 'Cell Registry', value: student.user?.phone_number || 'N/A' },
                 { label: 'Admission Node', value: student.admission_date || 'N/A' }
               ].map((item, i) => (
                 <div key={i} className="p-5 bg-[#FAFBFC] rounded-2xl border border-black/5">
                    <p className="text-[8px] font-black text-[#919191] uppercase tracking-widest mb-2">{item.label}</p>
                    <p className="text-xs font-bold text-[#111111] uppercase tracking-tight truncate">{item.value}</p>
                 </div>
               ))}
            </div>

            <div className="space-y-4">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-[#111111] flex items-center gap-2">
                  <Archive className="h-3 w-3 text-blue-500" /> Artifact Synchronization
               </h5>
               <div className="space-y-2">
                  {[
                    'Identification Proof',
                    'High School Transcript',
                    'Parental Consent Seal',
                    'Medical Certification'
                  ].map((doc, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#F0F0F0] group hover:border-blue-500 transition-all cursor-pointer">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#555555]">{doc}</span>
                        <ExternalLink className="h-4 w-4 text-[#919191] group-hover:text-blue-500" />
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="p-8 border-t border-[#F5F5F5] bg-[#FAFBFC] flex gap-4">
            <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest" onClick={() => toast.success("Print Spooled", { description: "Candidate dossier has been sent to the local printer node." })}>
               Print Dossier
            </Button>
            <Button className="flex-1 h-16 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20" onClick={() => { setStudentName(student.user?.full_name || 'Unknown Student'); setIsCommsModalOpen(true); }}>
               Contact Candidate
            </Button>
         </div>
      </div>
      <CommsTerminalModal 
        isOpen={isCommsModalOpen} 
        onClose={() => setIsCommsModalOpen(false)} 
        targetName={studentName} 
      />
    </div>
  );
}

// --- Room Inventory Dossier (Student Focus) ---
function RoomInventoryDossier({ isOpen, onClose, room, building }: { isOpen: boolean, onClose: () => void, room: any, building: any }) {
  if (!isOpen || !room) return null;

  const amenities = [
    { id: 'ac', label: 'Climate Control', icon: Zap, active: room.has_ac },
    { id: 'bathroom', label: 'Attached Bath', icon: Bath, active: room.has_attached_bathroom },
    { id: 'wifi', label: 'High-Speed Mesh', icon: Wifi, active: true },
    { id: 'cleaning', label: 'Housekeeping Sync', icon: Sparkles, active: true }
  ];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="h-full w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
         <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-lime-500 flex items-center justify-center">
                  <Bed className="h-5 w-5 text-black" />
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Unit <span className="text-lime-500">Dossier</span></h3>
                  <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Physical Asset Intelligence</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5 text-[#111111]">
              <X className="h-5 w-5" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-8 space-y-10">
            <div className="bg-[#111111] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-10">
                  <BuildingIcon className="h-64 w-64" />
               </div>
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-lime-400 mb-2">Primary Unit</p>
                  <h4 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Room <span className="text-lime-500">{room.room_number}</span></h4>
                  <div className="flex items-center gap-4 mt-6">
                     <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/5 backdrop-blur-md">
                        <p className="text-[8px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">Building</p>
                        <p className="text-xs font-black uppercase text-white">{building?.name || 'Main Sector'}</p>
                     </div>
                     <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/5 backdrop-blur-md">
                        <p className="text-[8px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">Floor Node</p>
                        <p className="text-xs font-black uppercase text-white">Level {room.floor}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5">
                  <div className="flex items-center gap-3 mb-4">
                     <Users className="h-4 w-4 text-lime-600" />
                     <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Occupancy Logic</p>
                  </div>
                  <p className="text-2xl font-black text-[#111111] uppercase tracking-tight italic">{room.room_type}</p>
                  <p className="text-[10px] font-bold text-[#919191] uppercase mt-1">{room.capacity} Bed Configuration</p>
               </div>
               <div className="p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5">
                  <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="h-4 w-4 text-lime-600" />
                     <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Asset Status</p>
                  </div>
                  <Badge className="bg-lime-500/10 text-lime-600 border-none rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest">Operational</Badge>
                  <p className="text-[10px] font-bold text-[#919191] uppercase mt-2 italic tracking-tighter">Unit Health: 98%</p>
               </div>
            </div>

            <div className="space-y-6">
               <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111] flex items-center gap-3">
                  <Zap className="h-4 w-4 text-lime-500" /> Unit Artifacts & Amenities
               </h5>
               <div className="grid grid-cols-2 gap-4">
                  {amenities.map((item) => (
                     <div key={item.id} className={cn(
                        "flex items-center gap-4 p-5 rounded-[1.8rem] border-2 transition-all",
                        item.active ? "bg-white border-black/10 shadow-sm" : "bg-[#FAFBFC] border-transparent opacity-40"
                     )}>
                        <div className={cn(
                           "h-10 w-10 rounded-xl flex items-center justify-center",
                           item.active ? "bg-lime-500 text-black shadow-lg shadow-lime-500/20" : "bg-white text-[#919191]"
                        )}>
                           <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{item.label}</p>
                           <p className="text-[8px] font-bold text-[#919191] uppercase tracking-tighter">{item.active ? 'Authenticated' : 'Not Provisioned'}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="p-8 border-t border-[#F5F5F5] bg-[#FAFBFC]">
            <Button className="w-full h-18 bg-black text-white hover:bg-lime-500 hover:text-black rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 group" onClick={onClose}>
               Acknowledge Specifications
            </Button>
         </div>
      </div>
    </div>
  );
}

// --- Comms Terminal Modal ---
export function CommsTerminalModal({ isOpen, onClose, targetName }: { isOpen: boolean, onClose: () => void, targetName?: string }) {
  const [isSending, setIsSending] = useState(false);
  
  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success("Intelligence Dispatch Successful", { description: "Message node being synchronized." });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-lime-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Comms <span className="text-lime-500">Terminal</span></h3>
              <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Target: {targetName || 'Unknown Node'}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-[#111111]" />
          </button>
        </div>
        <form onSubmit={handleSend} className="p-8 space-y-6">
           <div className="space-y-4">
              <input required placeholder="Transmission Subject" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-bold text-xs focus:ring-2 focus:ring-lime-500 transition-all outline-none" />
              <textarea required placeholder="Begin secure message..." className="w-full h-32 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl p-4 font-bold text-xs focus:ring-2 focus:ring-lime-500 transition-all outline-none resize-none" />
           </div>
           
           <Button disabled={isSending} type="submit" className="w-full h-14 bg-[#111111] hover:bg-lime-500 hover:text-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              {isSending ? <Activity className="h-4 w-4 animate-spin" /> : 'Transmit Intelligence'}
           </Button>
        </form>
      </Card>
    </div>
  );
}
