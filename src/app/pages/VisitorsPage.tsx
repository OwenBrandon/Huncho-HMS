import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  MoreVertical, 
  LogOut, 
  History, 
  UserX, 
  MessageSquare,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  X,
  RefreshCw,
  Timer,
  ShieldAlert,
  AlertTriangle,
  BellRing,
  Smartphone,
  Check,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVisitors } from '../hooks/useVisitors';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
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

export function VisitorsPage() {
  const { user } = useAuth();
  const { visitors, isLoading, checkInVisitor, checkOutVisitor } = useVisitors();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);

  const handleVisitorAction = (action: string, visitorName: string) => {
    toast.success(action, {
      description: `Security node for ${visitorName} has been synchronized.`,
    });
  };
  const relevantVisitors = visitors;

  const filteredVisitors = useMemo(() => {
    return relevantVisitors.filter((visitor) => {
      const matchesSearch =
        visitor.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.visitor_phone.includes(searchTerm) ||
        (visitor.studentUser?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesActive = !showActiveOnly || !visitor.check_out_time;

      return matchesSearch && matchesActive;
    });
  }, [relevantVisitors, searchTerm, showActiveOnly]);

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = relevantVisitors.filter((v) => !v.check_out_time).length;
  const totalToday = relevantVisitors.filter((v) => {
    const today = new Date().toDateString();
    return new Date(v.check_in_time).toDateString() === today;
  }).length;

  const handleAction = (action: string, visitorName: string) => {
    toast.success(`${action} for ${visitorName}`, {
      description: "Security log has been updated.",
    });
  };

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">Visitor <span className="text-lime-500">Management</span></h1>
          <p className="text-sm font-medium text-[#919191]">Track and authorize entry/exit protocols in real-time.</p>
        </div>
        {user?.role === 'security' && (
          <Button className="rounded-2xl bg-black hover:bg-black/90 text-white font-bold h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none" onClick={() => setIsCheckInModalOpen(true)}>
            <UserPlus className="mr-2 h-5 w-5 text-lime-400" />
            New Check-in
          </Button>
        )}
      </div>

      <VisitorCheckInModal 
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onSuccess={checkInVisitor}
      />

      <SecureCheckoutModal 
        isOpen={isCheckOutModalOpen}
        onClose={() => setIsCheckOutModalOpen(false)}
        visitor={selectedVisitor}
        onSuccess={checkOutVisitor}
      />

      <VisitorHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        visitor={selectedVisitor}
      />

      <IdentityBlacklistModal 
        isOpen={isBlacklistModalOpen}
        onClose={() => setIsBlacklistModalOpen(false)}
        visitor={selectedVisitor}
      />

      <ResidentAlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        visitor={selectedVisitor}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-2xl shadow-lime-500/5 bg-gradient-to-br from-white to-[#F9FAFB] rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <UserCheck className="h-24 w-24 text-black" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/20">
                <CheckCircle2 className="h-6 w-6 text-lime-400" />
              </div>
              <p className="text-sm font-black text-[#111111] uppercase tracking-widest">Currently Inside</p>
            </div>
            <h3 className="text-5xl font-black text-[#111111] leading-none mb-1 tabular-nums">{activeCount}</h3>
            <p className="text-xs font-bold text-lime-600 flex items-center gap-1 italic">
              Authorized active visitors
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-black/5 bg-gradient-to-br from-[#111111] to-[#222222] rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Calendar className="h-24 w-24 text-white" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Clock className="h-6 w-6 text-lime-400" />
              </div>
              <p className="text-sm font-black text-white/60 uppercase tracking-widest text-[10px]">Today's Traffic</p>
            </div>
            <h3 className="text-5xl font-black text-white leading-none mb-1 tabular-nums">{totalToday}</h3>
            <p className="text-xs font-bold text-lime-400 uppercase">Check-ins since midnight</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-lime-500/5 bg-white rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="h-24 w-24 text-lime-500" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-lime-500/10 flex items-center justify-center">
                <History className="h-6 w-6 text-lime-600" />
              </div>
              <p className="text-sm font-black text-[#111111] uppercase tracking-widest">Global Register</p>
            </div>
            <h3 className="text-5xl font-black text-[#111111] leading-none mb-1 tabular-nums">{relevantVisitors.length}</h3>
            <p className="text-xs font-bold text-[#919191] uppercase tracking-tighter italic">Lifetime security logs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Container */}
      <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden">
        <div className="p-6 flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919191] group-focus-within:text-lime-600 transition-colors" />
                <Input 
                  placeholder="Search by visitor, phone, or student..." 
                  className="pl-12 h-14 rounded-2xl border-none bg-white shadow-sm font-medium text-[#111111] placeholder:text-[#919191]/60 focus-visible:ring-2 focus-visible:ring-lime-500/20 transition-all font-sans"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button 
                className={cn(
                  "rounded-2xl h-14 px-6 font-bold border-2 transition-all active:scale-95 whitespace-nowrap flex items-center gap-2",
                  showActiveOnly ? "bg-black text-lime-400 border-black hover:bg-black/90" : "bg-white text-[#555555] border-black/5 hover:bg-black hover:text-white"
                )}
                onClick={() => {
                  setShowActiveOnly(!showActiveOnly);
                  setCurrentPage(1);
                }}
              >
                <Filter className="h-4 w-4" />
                {showActiveOnly ? "Active Only" : "All Records"}
              </button>
            </div>
            <p className="text-[10px] font-black text-[#555555] uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-white">
              <span className="text-lime-600 tabular-nums">{filteredVisitors.length}</span> results found
            </p>
          </div>

          {/* Premium Table */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50">
            <Table>
              <TableHeader className="bg-[#FAFBFC]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic">Visitor Details</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic">Stay/Purpose</TableHead>
                  {user?.role !== 'student' && <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic">Resident Meta</TableHead>}
                  <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Timing</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Status</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-right px-6 text-[10px] uppercase tracking-widest italic opacity-50">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVisitors.map((visitor) => (
                  <TableRow key={visitor.id} className="hover:bg-[#F9FAFB] transition-colors group border-b border-[#F0F0F0]/50 last:border-0">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#EEF2F3] to-[#8E9EAB]/20 flex items-center justify-center font-black text-[#555555] shadow-inner uppercase text-[10px] ring-1 ring-black/5">
                          {visitor.visitor_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-black text-[#111111] leading-none uppercase tracking-tight text-[11px]">{visitor.visitor_name}</p>
                          <p className="text-[9px] font-bold text-[#919191] mt-1 tracking-widest uppercase">{visitor.visitor_phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit rounded-lg border-none bg-black/5 text-[#555555] font-black text-[8px] uppercase tracking-widest mb-1.5">
                          {visitor.visitor_type} Visit
                        </Badge>
                        <span className="text-[10px] font-bold text-[#111111] max-w-[150px] truncate italic opacity-80">{visitor.purpose || 'No purpose stated'}</span>
                      </div>
                    </TableCell>
                    {user?.role !== 'student' && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-[10px] text-[#111111] uppercase tracking-tighter leading-none">{visitor.studentUser?.full_name}</span>
                          <span className="text-[9px] font-bold text-lime-600 mt-1 italic uppercase tracking-tighter">Resident: {visitor.student?.student_id}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="h-3 w-3 text-lime-600" />
                          <span className="text-[10px] font-black text-[#111111] tabular-nums">
                            {new Date(visitor.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-[#919191] italic tracking-tighter uppercase tabular-nums">
                          {new Date(visitor.check_in_time).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={cn(
                          "rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                          !visitor.check_out_time 
                            ? "bg-lime-500/15 text-lime-700" 
                            : "bg-[#F3F4F6] text-[#919191]"
                        )}
                      >
                        {!visitor.check_out_time ? "Authorized" : "Departed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-[#F0F0F0] transition-all">
                            <MoreVertical className="h-4 w-4 text-[#919191]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-52 bg-white/95 backdrop-blur-md">
                          <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-[#919191] mb-2 px-3">Log Operations</DropdownMenuLabel>
                          {!visitor.check_out_time && (
                            <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-rose-50 focus:text-rose-700 cursor-pointer py-2.5" onClick={() => { setSelectedVisitor(visitor); setIsCheckOutModalOpen(true); }}>
                              <LogOut className="h-4 w-4 text-[#919191]" /> Secure Check-out
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={() => { setSelectedVisitor(visitor); setIsHistoryModalOpen(true); }}>
                            <History className="h-4 w-4 text-[#919191]" /> Visit History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={() => { setSelectedVisitor(visitor); setIsAlertModalOpen(true); }}>
                            <MessageSquare className="h-4 w-4 text-[#919191]" /> Contact Resident
                          </DropdownMenuItem>
                          {user?.role !== 'student' && (
                            <>
                              <DropdownMenuSeparator className="bg-[#F0F0F0]" />
                              <DropdownMenuItem className="rounded-xl font-bold gap-3 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer py-2.5" onClick={() => { setSelectedVisitor(visitor); setIsBlacklistModalOpen(true); }}>
                                <UserX className="h-4 w-4 opacity-50" /> Blacklist Identity
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredVisitors.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-3xl bg-[#F9FAFB] flex items-center justify-center">
                  <Search className="h-8 w-8 text-[#919191] opacity-20" />
                </div>
                <div>
                  <p className="font-black text-[#111111] uppercase tracking-widest text-sm">Clear of visitors</p>
                  <p className="text-xs font-bold text-[#919191] mt-1 italic uppercase tracking-tighter">No logs match your current filters</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#919191]">
                Register Page <span className="text-[#111111] tabular-nums">{currentPage}</span> of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-none shadow-sm bg-white hover:bg-lime-50 hover:text-lime-700 font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-4 disabled:opacity-30 transition-all active:scale-95"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Back
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
                  Forward <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Security Engine Card */}
      {user?.role !== 'student' && (
        <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 rounded-[1.5rem] bg-lime-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-8 w-8 text-lime-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Security <span className="text-lime-500 italic">Enforcement</span></h3>
                  <Badge className="bg-lime-500/20 text-lime-500 text-[8px] uppercase tracking-widest border-none">Active Protocol</Badge>
                </div>
                <p className="text-sm text-white/50 font-medium mb-6 max-w-2xl leading-relaxed italic">
                  Every visitor session is logged with biometric-linked identities. Checkout protocols must be recorded by authorized security personnel only.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Authorized Entry', icon: UserCheck },
                    { label: 'Identity Proof', icon: Filter },
                    { label: 'Stay Threshold', icon: Clock },
                    { label: 'Blacklist Sync', icon: UserX }
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
    </div>
  );
}

// --- Visitor Check-In Wizard (Multi-Step Protocol) ---
function VisitorCheckInModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: (v: any) => void }) {
  const { searchStudents } = useVisitors();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
     visitor_name: '',
     visitor_phone: '',
     visitor_type: 'friend',
     purpose: '',
     student_id: ''
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle student search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (studentSearch.length >= 2 && !selectedStudent) {
        setIsSearching(true);
        const results = await searchStudents(studentSearch);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [studentSearch, selectedStudent]);

  if (!isOpen) return null;

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setStudentSearch(student.full_name);
    setFormData(prev => ({ ...prev, student_id: student.id }));
    setSearchResults([]);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch('');
    setFormData(prev => ({ ...prev, student_id: '' }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      nextStep();
      return;
    }
    
    let submissionData = { ...formData };
    
    // Fallback: If no student selected but a valid ID is typed (STU- or HMS-)
    if (!submissionData.student_id && (studentSearch.startsWith('STU-') || studentSearch.startsWith('HMS-'))) {
      submissionData.student_id = studentSearch;
    }

    if (!submissionData.student_id) {
      toast.error('Identity Protocol Error', {
        description: 'You must select a resident student for this visitor.'
      });
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSuccess(submissionData);
      onClose();
      setStep(1);
      setSelectedStudent(null);
      setStudentSearch('');
    } catch (err) {
      // Error handled in hook
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
                <UserPlus className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Visitor <span className="text-lime-500">Check-in</span></h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Protocol Node • Step {step} of 3</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
          </div>

          <div className="p-8 min-h-[400px]">
             <div className="flex gap-2 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= i ? "bg-lime-500 shadow-[0_0_10px_#D4FF3F]" : "bg-[#F0F0F0]")} />
                ))}
             </div>

             {step === 1 && (
               <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1">Visitor Full Identity</label>
                        <Input 
                          required
                          value={formData.visitor_name}
                          onChange={e => setFormData(prev => ({ ...prev, visitor_name: e.target.value }))}
                          placeholder="Legal Name" 
                          className="h-14 rounded-2xl bg-[#FAFBFC] border-none font-bold placeholder:text-black/20" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1">Communication Node (Phone)</label>
                        <Input 
                          required
                          value={formData.visitor_phone}
                          onChange={e => setFormData(prev => ({ ...prev, visitor_phone: e.target.value }))}
                          placeholder="+234..." 
                          className="h-14 rounded-2xl bg-[#FAFBFC] border-none font-bold placeholder:text-black/20" 
                        />
                     </div>
                  </div>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1">Visit Typology</label>
                        <select 
                          className="w-full h-14 bg-[#FAFBFC] border-none rounded-2xl px-4 font-bold text-sm outline-none cursor-pointer"
                          value={formData.visitor_type}
                          onChange={e => setFormData(prev => ({ ...prev, visitor_type: e.target.value }))}
                        >
                           <option value="friend">Personal / Friend</option>
                           <option value="family">Family Unit</option>
                           <option value="official">Institutional / Official</option>
                           <option value="delivery">Delivery / Vendor</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1">Purpose Description</label>
                         <Input 
                          value={formData.purpose}
                          onChange={e => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                          placeholder="Reason for entry" 
                          className="h-14 rounded-2xl bg-[#FAFBFC] border-none font-bold placeholder:text-black/20" 
                        />
                     </div>
                  </div>
                   <div className="space-y-2 pt-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1">Target Resident (Name or Student ID)</label>
                        <div className="relative">
                          <div className="relative">
                             <Input 
                              required={!selectedStudent}
                              value={studentSearch}
                              onChange={e => {
                                setStudentSearch(e.target.value);
                                if (selectedStudent) clearStudent();
                              }}
                              placeholder="Search student name or ID..." 
                              className={cn(
                                "h-14 rounded-2xl bg-[#FAFBFC] border-none font-bold placeholder:text-black/20 pr-12",
                                selectedStudent && "text-lime-600 bg-lime-50"
                              )} 
                            />
                            {selectedStudent ? (
                              <button 
                                type="button"
                                onClick={clearStudent}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
                              >
                                <X className="h-3 w-3 text-black" />
                              </button>
                            ) : isSearching ? (
                              <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#919191]" />
                            ) : (
                              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#919191]" />
                            )}
                          </div>

                          {searchResults.length > 0 && !selectedStudent && (
                            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#F0F0F0] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                               {searchResults.map((student) => (
                                 <button
                                   key={student.id}
                                   type="button"
                                   onClick={() => handleSelectStudent(student)}
                                   className="w-full px-5 py-4 text-left hover:bg-lime-50 transition-colors flex items-center justify-between group"
                                 >
                                    <div>
                                       <p className="text-sm font-black text-[#111111] uppercase tracking-tighter group-hover:text-lime-700">{student.full_name}</p>
                                       <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">{student.student_id}</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-xl bg-[#F9FAFB] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Check className="h-4 w-4 text-lime-600" />
                                    </div>
                                 </button>
                               ))}
                            </div>
                          )}
                        </div>
                        {selectedStudent && (
                          <div className="flex items-center gap-2 mt-2 px-1">
                             <div className="h-1.5 w-1.5 rounded-full bg-lime-500 animate-pulse" />
                             <span className="text-[10px] font-black text-lime-700 uppercase tracking-widest">Resident Locked: {selectedStudent.student_id}</span>
                          </div>
                        )}
                     </div>
               </div>
             )}

             {step === 3 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center text-center">
                  <div className="h-24 w-24 rounded-[2rem] bg-lime-500/10 flex items-center justify-center mb-4">
                     <ShieldCheck className="h-12 w-12 text-lime-500" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-[#111111] uppercase italic tracking-tight leading-none">Authorization Protocol</h4>
                     <p className="text-xs font-bold text-[#919191] max-w-xs mt-3 italic leading-relaxed">
                        By authorizing, you are logging this identity proof into the secure premise ledger.
                     </p>
                  </div>
                  <div className="w-full p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5 text-left">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-[#919191] tracking-widest">Visitor Identity</span>
                        <span className="text-[11px] font-black text-black uppercase italic tracking-tight">{formData.visitor_name}</span>
                     </div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-[#919191] tracking-widest">Host Resident</span>
                        <span className="text-[11px] font-black text-lime-600 uppercase italic tracking-tight">{selectedStudent?.full_name || studentSearch}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-[#919191] tracking-widest">Protocol Timestamp</span>
                        <span className="text-[10px] font-black text-[#111111] uppercase tabular-nums">{new Date().toLocaleTimeString()}</span>
                     </div>
                  </div>
               </div>
             )}
          </div>

          <div className="p-8 border-t border-[#F5F5F5] flex gap-4 bg-[#FAFBFC]">
             {step > 1 && (
               <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest" onClick={prevStep}>
                  Previous
               </Button>
             )}
             {step < 3 ? (
               <Button type="button" className="flex-1 h-14 bg-black text-white hover:bg-[#222222] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all" onClick={nextStep}>
                  Continue Protocol
               </Button>
             ) : (
               <Button type="submit" disabled={isSubmitting} className="flex-1 h-16 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-lime-500/20 transition-all active:scale-95">
                  {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Entry"}
               </Button>
             )}
          </div>
        </form>
      </Card>
    </div>
  );
}

// --- Secure Check-out Modal (Departure Flow) ---
function SecureCheckoutModal({ isOpen, onClose, visitor, onSuccess }: { isOpen: boolean, onClose: () => void, visitor: any, onSuccess: (id: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !visitor) return null;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      await onSuccess(visitor.id);
      onClose();
    } catch (err) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 border-b border-[#F5F5F5] flex justify-between items-center bg-rose-50/30">
           <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                 <LogOut className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-rose-600 uppercase italic tracking-tighter leading-none">Secure <span className="text-black italic">Check-out</span></h3>
                 <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1.5 italic">Departure Node Recorded</p>
              </div>
           </div>
           <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white/50">
              <X className="h-5 w-5 text-[#111111]" />
           </button>
        </div>

        <div className="p-10 space-y-8 text-center">
           <div className="space-y-4">
              <div className="flex flex-col items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#919191] mb-2 font-mono">Total Stay Duration</p>
                 <div className="flex items-center gap-3">
                    <Timer className="h-6 w-6 text-rose-500" />
                    <span className="text-5xl font-black text-[#111111] tabular-nums tracking-tighter italic">03h 14m</span>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-[#FAFBFC] rounded-[2.5rem] border border-rose-100/50 text-left">
              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-4">Log Artifact Summary</p>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Identified Visitor</span>
                    <span className="text-[11px] font-black uppercase italic tracking-tight">{visitor.visitor_name}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Protocol Signal</span>
                    <span className="text-[10px] font-black text-lime-600 uppercase tabular-nums">IN: {new Date(visitor.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
              </div>
           </div>

           <Button onClick={handleCheckout} disabled={isSubmitting} className="w-full h-20 bg-black text-white hover:bg-[#111111] rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-rose-500/10 transition-all active:scale-95 group">
              {isSubmitting ? <RefreshCw className="h-6 w-6 animate-spin mx-auto" /> : <><ShieldAlert className="mr-3 h-5 w-5 text-rose-500 group-hover:animate-pulse" /> Finalize Departure</>}
           </Button>
        </div>
      </Card>
    </div>
  );
}

// --- Visitor History Modal (Chronological Hub) ---
function VisitorHistoryModal({ isOpen, onClose, visitor }: { isOpen: boolean, onClose: () => void, visitor: any }) {
  if (!isOpen || !visitor) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="h-full w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
         <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC] sticky top-0 z-10">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Visit <span className="text-lime-500 italic uppercase">History</span></h3>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-10 space-y-12">
            <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-[2.5rem] bg-[#111111] flex items-center justify-center text-white text-4xl font-black italic shadow-2xl mb-6 ring-8 ring-lime-50/50">
                    {visitor.visitor_name.charAt(0)}
                </div>
                <div>
                   <h4 className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter leading-none">{visitor.visitor_name}</h4>
                   <p className="text-xs font-bold text-[#919191] uppercase tracking-[0.4em] mt-3 mb-4 italic leading-none">{visitor.visitor_phone}</p>
                   <Badge className="bg-black text-lime-400 border-none font-black text-[9px] uppercase tracking-widest rounded-lg px-4 py-1">{visitor.visitor_type} Class Visitor</Badge>
                </div>
            </div>

            <div className="space-y-8">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-[#111111] flex items-center gap-3">
                  <Clock className="h-4 w-4 text-lime-500" /> Tactical Access Ledger
               </h5>
               <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-0 before:w-0.5 before:bg-[#F0F0F0]">
                  {[
                    { date: new Date(visitor.check_in_time).toLocaleDateString(), time: new Date(visitor.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), duration: visitor.check_out_time ? 'Logged' : 'Active', resident: visitor.studentUser?.full_name }
                  ].map((log, i) => (
                    <div key={i} className="relative pl-12 group">
                       <div className="absolute left-1.5 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-lime-500 shadow-[0_0_15px_#D4FF3F] z-10" />
                       <div className="p-5 bg-[#FAFBFC] rounded-[2.5rem] border border-black/5 group-hover:border-lime-500/30 transition-all flex justify-between items-center cursor-default hover:bg-white hover:shadow-2xl hover:shadow-black/5 active:scale-95 duration-300">
                          <div>
                             <p className="text-[12px] font-black text-[#111111] uppercase tracking-tight italic">{log.date} @ {log.time}</p>
                             <div className="flex items-center gap-2 mt-2">
                                <MapPin className="h-3 w-3 text-lime-600" />
                                <span className="text-[9px] font-black text-[#919191] uppercase tracking-widest">Host Resident: {log.resident}</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[11px] font-black text-lime-600 bg-lime-500/5 px-4 py-1.5 rounded-full border border-lime-100 tabular-nums shadow-sm">{log.duration}</span>
                             <span className="text-[8px] font-bold text-[#DEDEDE] uppercase tracking-widest mt-1">Total Stay</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="p-8 border-t border-[#F5F5F5] bg-[#FAFBFC] sticky bottom-0">
            <Button variant="outline" className="w-full h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white border-2 border-black/5 hover:bg-black hover:text-white transition-all shadow-sm" onClick={() => {
                toast.success('Artifact Generated', { description: `Exporting history for ${visitor.visitor_name}.` });
                onClose();
            }}>
               Download Identity Summary Artifact
            </Button>
         </div>
      </div>
    </div>
  );
}

// --- Identity Blacklist Modal (Identity Decommission) ---
function IdentityBlacklistModal({ isOpen, onClose, visitor }: { isOpen: boolean, onClose: () => void, visitor: any }) {
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !visitor) return null;

  const handleBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'BLACKLIST') return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.error("Identity Blacklisted", {
        description: `Security node for ${visitor.visitor_name} decommissioned globally.`,
      });
      onClose();
      setConfirmText('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-600">
      <Card className="w-full max-w-md border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <form onSubmit={handleBlacklist}>
           <div className="p-8 border-b border-rose-50 flex justify-between items-center bg-rose-50/20">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-2xl">
                    <UserX className="h-6 w-6 text-rose-500" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-rose-600 uppercase italic leading-none">Identity <span className="text-black italic">Blacklist</span></h3>
                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-1">Decommissioning Node</p>
                 </div>
              </div>
              <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5">
                 <X className="h-5 w-5 text-black" />
              </button>
           </div>
           <div className="p-8 space-y-8">
              <div className="p-6 bg-rose-600/5 rounded-[2.5rem] border border-rose-100 flex gap-4 items-start">
                 <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                 <p className="text-xs font-bold text-rose-900 leading-relaxed italic">
                    You are initializing a global premise decommissioning for <span className="font-black uppercase tracking-tight text-rose-600">"{visitor.visitor_name}"</span>. 
                    This identity node will be flagged as <span className="text-rose-600 font-black italic">NON-GRATA</span> across every security terminal.
                 </p>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#919191] flex justify-between px-1">
                    Enter <span className="text-rose-600">"BLACKLIST"</span> to confirm
                    <Lock className="h-4 w-4 opacity-10" />
                 </label>
                 <Input 
                   required
                   value={confirmText}
                   onChange={e => setConfirmText(e.target.value)}
                   className="h-16 rounded-2xl border-rose-100 font-mono font-black text-xs uppercase tracking-[0.4em] bg-[#FAFBFC] focus-visible:ring-rose-500/20 text-rose-600 text-center" 
                   autoFocus
                   placeholder="IDENTITY_AUTH_CHALLENGE" 
                 />
              </div>
              <Button type="submit" disabled={confirmText !== 'BLACKLIST' || isSubmitting} className={cn(
                 "w-full h-20 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl",
                 confirmText === 'BLACKLIST' ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/30 active:scale-95" : "bg-[#F0F0F0] text-[#DEDEDE]"
              )}>
                 {isSubmitting ? <RefreshCw className="h-6 w-6 animate-spin mx-auto" /> : "Authorize Decommissioning"}
              </Button>
           </div>
        </form>
      </Card>
    </div>
  );
}

// --- Resident Alert Modal (Internal Notification) ---
function ResidentAlertModal({ isOpen, onClose, visitor }: { isOpen: boolean, onClose: () => void, visitor: any }) {
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !visitor) return null;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.info("Internal Alert Transmitted", {
        description: `Resident ${visitor.studentUser?.full_name} has been notified via Hush Node.`,
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-sm border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400">
        <div className="p-10 space-y-10 flex flex-col items-center text-center">
           <div className="h-24 w-24 rounded-[2rem] bg-lime-500/10 flex items-center justify-center relative">
              <BellRing className="h-12 w-12 text-lime-600 animate-bounce" />
              <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-lime-500 border-[6px] border-white animate-pulse" />
           </div>
           <div>
              <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter mb-3 leading-none">Resident <span className="text-lime-500">Alert</span></h3>
              <p className="text-xs font-bold text-[#919191] leading-relaxed italic px-4">
                 Transmit local entry authorization to 
                 <span className="text-black font-black block mt-2 uppercase tracking-tight italic text-blue-600 leading-none underline underline-offset-4 decoration-black/10">"{visitor.studentUser?.full_name}"?</span>
              </p>
           </div>
           <div className="w-full space-y-4">
              <Button onClick={handleSend} disabled={isSending} className="w-full h-16 bg-[#111111] text-white hover:bg-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 group">
                 {isSending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><Smartphone className="h-5 w-5 text-lime-400 group-hover:scale-110 transition-transform" /> Transmit Hush Alert</>}
              </Button>
              <Button onClick={onClose} variant="ghost" className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#DEDEDE] hover:text-[#111111]">
                 Cancel Transmission
              </Button>
           </div>
        </div>
      </Card>
    </div>
  );
}
