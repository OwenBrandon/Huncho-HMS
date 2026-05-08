import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Plus, 
  AlertCircle, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  User,
  Filter,
  MoreVertical,
  ChevronDown,
  Wrench,
  Zap,
  X,
  ChevronRight,
  RefreshCw,
  UserPlus,
  History,
  MapPin,
  Building,
  Check,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints } from '../hooks/useComplaints';
import { supabase } from '../../lib/supabase';
import { cn } from '../components/ui/utils';
import type { ComplaintStatus, ComplaintPriority } from '../types';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';

export function ComplaintsPage() {
  const { user } = useAuth();
  const { complaints, isLoading, createComplaint, acknowledgeComplaint, assignComplaint, resolveComplaint } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredComplaints = complaints.filter((complaint) => {
    const studentUser = complaint.student?.user;
    const matchesSearch =
      complaint.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (studentUser?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || complaint.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || complaint.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAction = async (ticketId: string, id: string, action: string, status?: ComplaintStatus) => {
    if (status === 'in_progress') {
      await acknowledgeComplaint(id);
    }
    toast.success(`Ticket ${ticketId} Action`, {
      description: `${action} protocol initiated successfully.`,
    });
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'open': return 'bg-[#111111]/10 text-[#555555]';
      case 'in_progress': return 'bg-blue-500/10 text-blue-600';
      case 'resolved': return 'bg-lime-500/20 text-lime-700';
      case 'closed': return 'bg-[#F9FAFB] text-[#919191]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityInfo = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'critical': return { color: 'text-rose-600', bg: 'bg-rose-50', badge: 'bg-rose-500 text-white' };
      case 'high': return { color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-500 text-white' };
      case 'medium': return { color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-500 text-black' };
      case 'low': return { color: 'text-gray-600', bg: 'bg-gray-50', badge: 'bg-[#111111] text-white' };
    }
  };

  const openCount = complaints.filter((c) => c.status === 'open').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const criticalCount = complaints.filter((c) => c.priority === 'critical').length;

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'assign' | 'resolve'>('view');

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]/50 md:p-8 p-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tactical Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#111111] uppercase">
            {user?.role === 'maintenance_staff' ? 'Operations' : 'Complaint'} <span className="text-lime-500">{user?.role === 'maintenance_staff' ? 'Board' : 'Terminal'}</span>
          </h1>
          <p className="text-sm font-medium text-[#919191]">
            {user?.role === 'maintenance_staff' 
              ? 'Active dispatch management and task resolution tracking.' 
              : 'Comprehensive resolution matrix and maintenance telemetry.'}
          </p>
        </div>
        {user?.role === 'student' && (
          <Button 
            className="rounded-2xl bg-[#111111] text-white hover:bg-lime-500 hover:text-black font-black text-[10px] uppercase tracking-widest h-14 px-8 transition-all active:scale-95 shadow-xl shadow-black/10"
            onClick={() => setIsLogModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-3 text-lime-400" /> New Complaint Log
          </Button>
        )}
      </div>

      <LogComplaintModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onSuccess={createComplaint}
      />

      <TicketLifecycleModal 
        isOpen={isLifecycleModalOpen}
        onClose={() => setIsLifecycleModalOpen(false)}
        complaint={selectedComplaint}
        mode={modalMode}
        setMode={setModalMode}
        onAssign={assignComplaint}
        onResolve={resolveComplaint}
      />

      {/* KPI Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(user?.role === 'maintenance_staff' ? [
          { label: 'Active Dispatch', value: inProgressCount, icon: Wrench, bg: 'bg-[#111111]', color: 'text-lime-500', trend: 'In Field' },
          { label: 'Pending Verification', value: openCount, icon: Clock, bg: 'bg-amber-500/10', color: 'text-amber-600', trend: 'Queue' },
          { label: 'Critical Interventions', value: criticalCount, icon: ShieldAlert, bg: 'bg-rose-500/10', color: 'text-rose-600', trend: 'Immediate' },
          { label: 'Completion Rate', value: `${complaints.length > 0 ? Math.round((resolvedCount / complaints.length) * 100) : 100}%`, icon: CheckCircle2, bg: 'bg-lime-500/10', color: 'text-lime-600', trend: 'Metrics' }
        ] : [
          { label: 'Total Reports', value: complaints.length, icon: Activity, bg: 'bg-lime-500/10', color: 'text-lime-600', trend: 'Global' },
          { label: 'Action Required', value: criticalCount, icon: ShieldAlert, bg: 'bg-rose-500/10', color: 'text-rose-600', trend: 'Immediate' },
          { label: 'Active Tasks', value: inProgressCount, icon: Wrench, bg: 'bg-blue-500/10', color: 'text-blue-600', trend: 'Operational' },
          { label: 'Resolved Nodes', value: resolvedCount, icon: CheckCircle2, bg: 'bg-[#111111]/5', color: 'text-[#111111]', trend: 'Efficiency' },
        ]).map((stat, i) => (
          <Card 
            key={i} 
            className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2rem] overflow-hidden group cursor-pointer hover:border-lime-500/50 border border-transparent transition-all"
            onClick={() => {
              if (stat.label.includes('Critical')) {
                setSelectedPriority('critical');
              } else if (stat.label.includes('Active')) {
                setSelectedStatus('in_progress');
              } else if (stat.label.includes('Resolved')) {
                setSelectedStatus('resolved');
              } else if (stat.label.includes('Reports') || stat.label.includes('Dispatch')) {
                setSelectedStatus('all');
                setSelectedPriority('all');
              }
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <Badge className="bg-[#111111] text-lime-400 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-lime-500 mr-1.5 animate-pulse" />
                  {stat.trend}
                </Badge>
              </div>
              <h3 className="text-3xl font-black text-[#111111] leading-none mb-1 tabular-nums">{stat.value}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#919191] italic">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Center */}
      <Card className="border-none shadow-2xl shadow-black/5 rounded-[2rem] bg-white overflow-hidden">
        <CardContent className="p-4 bg-white/40 backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#919191]" />
              <Input
                placeholder="Operational Search by Ticket ID, Subject or Personnel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-white border-white shadow-md rounded-2xl font-bold text-sm focus-visible:ring-lime-500"
              />
            </div>
            <div className="flex gap-3">
               <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-14 bg-[#111111] text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest appearance-none min-w-[160px] cursor-pointer hover:bg-lime-500 hover:text-black transition-all outline-none"
                  >
                    <option value="all">Global Status</option>
                    <option value="open">Open Logs</option>
                    <option value="in_progress">Active Maintenance</option>
                    <option value="resolved">Resolved Nodes</option>
                    <option value="closed">Closed Archive</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-30" />
               </div>
               <div className="relative">
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="h-14 bg-[#111111] text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest appearance-none min-w-[160px] cursor-pointer hover:bg-lime-500 hover:text-black transition-all outline-none"
                  >
                    <option value="all">Priority Matrix</option>
                    <option value="low">Low Impact</option>
                    <option value="medium">Medium Load</option>
                    <option value="high">High Conflict</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-30" />
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registry Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {filteredComplaints.map((complaint) => {
          const priority = getPriorityInfo(complaint.priority);
          return (
            <Card 
              key={complaint.id} 
              className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden group hover:translate-y-[-4px] transition-all duration-500 cursor-pointer"
              onClick={() => {
                setSelectedComplaint(complaint);
                setModalMode('view');
                setIsLifecycleModalOpen(true);
              }}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-5">
                  <div className={cn("mt-1 rounded-2xl p-3 shadow-inner group-hover:scale-110 transition-transform duration-500", priority.bg)}>
                    <AlertCircle className={cn("h-6 w-6", priority.color)} />
                  </div>

                  <div className="flex-1 space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-black text-[#111111] uppercase italic tracking-tighter leading-none group-hover:text-lime-600 transition-colors">{complaint.title}</h3>
                        <p className="text-[10px] font-mono font-black text-[#919191] mt-1 tracking-widest">{complaint.ticket_number}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={cn("rounded-xl px-3 py-1 font-black text-[8px] uppercase tracking-widest border-none shadow-sm", priority.badge)}>
                          {complaint.priority}
                        </Badge>
                        <Badge className={cn("rounded-xl px-3 py-1 font-black text-[8px] uppercase tracking-widest border-none shadow-sm", getStatusColor(complaint.status))}>
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-[#555555] leading-relaxed italic border-l-2 border-lime-500/20 pl-4">{complaint.description}</p>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[10px] font-black uppercase tracking-widest text-[#919191] pt-2">
                      {user?.role !== 'student' && (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-lime-500" />
                          <span>Student: <span className="text-[#111111] font-black">{complaint.student?.user?.full_name}</span></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Filter className="h-3 w-3 text-lime-500" />
                        <span>Layer: <span className="text-[#111111] font-black">{complaint.category.replace('_', ' ')}</span></span>
                      </div>
                      {complaint.assigned_user && (
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-lime-500" />
                          <span>Unit: <span className="text-[#111111] font-black">{complaint.assigned_user?.full_name}</span></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-lime-500" />
                        <span>Logged: <span className="text-[#111111] font-black">{new Date(complaint.created_at).toLocaleDateString()}</span></span>
                      </div>
                    </div>

                    {complaint.resolution_notes && (
                      <div className="rounded-2xl bg-lime-500/10 border border-lime-500/20 p-5 relative overflow-hidden group/note">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/note:scale-110 transition-transform">
                          <CheckCircle2 className="h-10 w-10 text-lime-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#111111] mb-1">Resolution Protocol Logged:</p>
                        <p className="text-sm font-bold text-lime-800 italic leading-relaxed">{complaint.resolution_notes}</p>
                      </div>
                    )}

                    {user?.role !== 'student' && complaint.status !== 'resolved' && (
                      <div className="flex gap-3 pt-4">
                        {complaint.status === 'open' ? (
                          user?.role === 'maintenance_staff' ? (
                            <Button 
                              size="sm" 
                              className="h-11 rounded-xl bg-lime-500 text-black hover:bg-lime-600 font-black text-[9px] uppercase tracking-[0.2em] px-6 transition-all shadow-lg active:scale-95 border-none" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(complaint.ticket_number, complaint.id, 'Acknowledge Dispatch', 'in_progress');
                              }}
                            >
                              Acknowledge Dispatch
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-11 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] px-6 border-[#111111] border-2 hover:bg-[#111111] hover:text-white transition-all shadow-lg active:scale-95" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(complaint);
                                setModalMode('assign');
                                setIsLifecycleModalOpen(true);
                              }}
                            >
                              Assign to Unit
                            </Button>
                          )
                        ) : complaint.status === 'in_progress' ? (
                          <Button 
                            size="sm" 
                            className="h-11 rounded-xl bg-[#111111] text-white hover:bg-lime-500 hover:text-black font-black text-[9px] uppercase tracking-[0.2em] px-8 transition-all shadow-lg active:scale-95 border-none" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(complaint);
                              setModalMode('resolve');
                              setIsLifecycleModalOpen(true);
                            }}
                          >
                            Finalize Resolution
                          </Button>
                        ) : null}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-11 w-11 rounded-xl bg-[#F9FAFB] hover:bg-white hover:shadow-xl transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="h-5 w-5 text-[#919191]" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredComplaints.length === 0 && (
          <Card className="md:col-span-2 border-none bg-white/50 rounded-[3rem] shadow-inner border-dashed border-2 border-white">
            <CardContent className="py-24 text-center">
              <Zap className="mx-auto h-16 w-16 text-[#919191]/20 animate-pulse" />
              <h3 className="mt-8 font-black text-2xl text-[#111111] uppercase italic tracking-tighter">No Active Protocols</h3>
              <p className="mt-2 text-sm font-bold text-[#919191] uppercase tracking-widest">System terminal is clear. Check high-layer filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end pt-4 italic">
        <p className="text-[10px] font-black text-[#919191]/40 tracking-[0.2em] uppercase">Security Integrity: Locked • Resolution Latency: 42m • Node Sync Active</p>
      </div>
    </div>
  );
}

// --- Ticket Lifecycle Modal (Unified View) ---
function TicketLifecycleModal({ isOpen, onClose, complaint, mode, setMode, onAssign, onResolve }: any) {
  const [isActioning, setIsActioning] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStaff() {
      const { data } = await supabase.from('users').select('*').eq('role', 'maintenance_staff');
      setStaffList(data || []);
    }
    if (isOpen && mode === 'assign') fetchStaff();
  }, [isOpen, mode]);

  if (!isOpen || !complaint) return null;

  const handleDispatch = async () => {
    if (!selectedStaffId) {
      toast.error("Selection Required", { description: "Please select a maintenance operative for dispatch." });
      return;
    }
    setIsActioning(true);
    try {
      await onAssign(complaint.id, selectedStaffId);
      toast.success("Dispatch Unit Synchronized");
      onClose();
    } finally {
      setIsActioning(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionText.trim()) {
      toast.error("Telemetry Required", { description: "Please enter final resolution protocol details." });
      return;
    }
    setIsActioning(true);
    try {
      await onResolve(complaint.id, resolutionText);
      toast.success("Ticket Verification Sealed");
      onClose();
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
              {mode === 'assign' ? <UserPlus className="h-5 w-5 text-lime-400" /> : mode === 'resolve' ? <CheckCircle2 className="h-5 w-5 text-lime-400" /> : <ShieldAlert className="h-5 w-5 text-lime-400" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">
                {mode === 'view' ? 'Protocol' : mode === 'assign' ? 'Staff' : 'Resolution'} <span className="text-lime-500">{mode === 'view' ? 'Detail' : mode === 'assign' ? 'Dispatch' : 'Finalization'}</span>
              </h3>
              <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">{complaint.ticket_number} • Operation Matrix</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-[#111111]" />
          </button>
        </div>

        <div className="flex h-[500px]">
          {/* Left: Info Scroll */}
          <div className="flex-1 overflow-y-auto p-8 border-r border-[#F5F5F5] space-y-6">
             <div>
                <Badge className="bg-[#111111] text-lime-400 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">{complaint.category.replace('_', ' ')}</Badge>
                <h4 className="text-2xl font-black text-[#111111] uppercase italic leading-tight">{complaint.title}</h4>
                <p className="text-sm font-medium text-[#555555] mt-3 leading-relaxed italic border-l-2 border-lime-500/20 pl-4">{complaint.description}</p>
             </div>

             <Separator className="bg-[#F5F5F5]" />

             <div className="space-y-4">
                <h5 className="text-[10px] font-black text-[#111111] uppercase tracking-widest flex items-center gap-2">
                   <User className="h-3 w-3 text-lime-500" /> Requester Node
                </h5>
                <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-2xl border border-black/5">
                   <Avatar className="h-10 w-10 rounded-xl border-2 border-white">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${complaint.student_id}`} />
                      <AvatarFallback>S</AvatarFallback>
                   </Avatar>
                   <div>
                      <p className="text-xs font-black text-[#111111] uppercase italic">{complaint.student?.user?.full_name}</p>
                      <p className="text-[9px] font-bold text-[#919191] uppercase tracking-widest">ID: {complaint.student?.student_id} • {complaint.student?.department}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h5 className="text-[10px] font-black text-[#111111] uppercase tracking-widest flex items-center gap-2">
                   <History className="h-3 w-3 text-lime-500" /> Operational History
                </h5>
                <div className="space-y-3 pl-2">
                   {[
                     { time: '09:42', label: 'Ticket Logged', desc: 'Auto-synchronized via system.' },
                     { time: '10:05', label: 'Priority Assigned', desc: `Assessed as ${complaint.priority}.` }
                   ].map((h, i) => (
                     <div key={i} className="relative pl-6 pb-2 last:pb-0 outline-none">
                        <div className="absolute left-0 top-1 h-2 w-2 rounded-full bg-lime-500" />
                        <div className="absolute left-[3px] top-3 bottom-0 w-[2px] bg-[#F5F5F5] last:hidden" />
                        <p className="text-[9px] font-black text-[#111111] uppercase">{h.label} <span className="text-[#919191] ml-2 font-mono">[{h.time}]</span></p>
                        <p className="text-[8px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">{h.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Right: Actions */}
          <div className="w-[280px] bg-[#FAFBFC] p-8 space-y-6">
             {mode === 'view' && (
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] mb-4">Command Actions</p>
                   {complaint.status === 'open' && (
                     <Button className="w-full h-14 bg-[#111111] text-white rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => setMode('assign')}>
                        Initialize Dispatch
                     </Button>
                   )}
                   {complaint.status === 'in_progress' && (
                     <Button className="w-full h-14 bg-lime-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => setMode('resolve')}>
                        Enter Resolution
                     </Button>
                   )}
                   <Button variant="outline" className="w-full h-14 border-[#F0F0F0] font-black text-[10px] uppercase tracking-widest" onClick={() => { toast.success("Tier Escalated", { description: "Complaint escalated to higher authority." }); onClose(); }}>Escalate Tier</Button>
                   <Button variant="ghost" className="w-full h-14 text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest" onClick={() => { toast.error("Protocol Rejected", { description: "Complaint has been dismissed." }); onClose(); }}>Reject Protocol</Button>
                </div>
             )}

             {mode === 'assign' && (
                <div className="h-full flex flex-col space-y-4">
                   <p className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] mb-2">Staff Directory</p>
                   <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                      {staffList.map((staff, i) => (
                        <div 
                          key={staff.id} 
                          onClick={() => setSelectedStaffId(staff.id)}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer group",
                            selectedStaffId === staff.id ? "border-lime-500 bg-lime-50" : "bg-white border-black/5 hover:border-lime-500/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                                selectedStaffId === staff.id ? "bg-lime-500" : "bg-[#F9FAFB] group-hover:bg-lime-500/20"
                              )}>
                                <User className={cn("h-4 w-4", selectedStaffId === staff.id ? "text-black" : "text-[#919191]")} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase italic">{staff.full_name}</p>
                                <Badge className="bg-lime-500/10 text-lime-700 border-none text-[6px] px-1 py-0">Active</Badge>
                              </div>
                            </div>
                            {selectedStaffId === staff.id && <Check className="h-4 w-4 text-lime-600" />}
                          </div>
                        </div>
                      ))}
                   </div>
                   <Button disabled={isActioning} className="w-full h-14 bg-[#111111] text-white rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={handleDispatch}>
                      {isActioning ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm Dispatch'}
                   </Button>
                   <Button variant="ghost" className="w-full text-[9px] uppercase font-bold text-[#919191]" onClick={() => setMode('view')}>Back to Profile</Button>
                </div>
             )}

             {mode === 'resolve' && (
                <div className="h-full flex flex-col space-y-4">
                   <p className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] mb-2">Technical Report</p>
                   <textarea 
                     value={resolutionText}
                     onChange={(e) => setResolutionText(e.target.value)}
                     placeholder="Enter final resolution protocol details..." 
                     className="flex-1 w-full bg-white border border-[#F0F0F0] rounded-xl p-4 text-[10px] font-bold text-[#555555] focus:ring-lime-500 focus:outline-none resize-none"
                   />
                   <Button disabled={isActioning} className="w-full h-14 bg-lime-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={handleResolve}>
                      {isActioning ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Seal Resolution'}
                   </Button>
                   <Button variant="ghost" className="w-full text-[9px] uppercase font-bold text-[#919191]" onClick={() => setMode('view')}>Back to Profile</Button>
                </div>
             )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// --- Log Complaint Modal (Student) ---
export function LogComplaintModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: (c: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState('maintenance');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSuccess({
        category: category.toLowerCase(),
        title: subject,
        description: description,
      });
      onClose();
    } catch (err: any) {
      // Error handled by hook
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
                <AlertCircle className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">New <span className="text-lime-500">Complaint</span></h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Register Operational Request</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Issue Category</label>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Plumbing', icon: MapPin },
                   { label: 'Electrical', icon: Zap },
                   { label: 'Network', icon: Building },
                   { label: 'Others', icon: Filter }
                 ].map((cat) => (
                   <button
                     key={cat.label}
                     type="button"
                     onClick={() => setCategory(cat.label)}
                     className={cn(
                       "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                       category === cat.label ? "border-lime-500 bg-lime-50 shadow-inner" : "border-[#F0F0F0] hover:border-[#111111]/10"
                     )}
                   >
                     <cat.icon className={cn("h-4 w-4", category === cat.label ? "text-lime-600" : "text-[#919191]")} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                   </button>
                 ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Operational Subject</label>
              <input 
                required 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe the core issue..." 
                className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-6 font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all font-mono" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Description Logic</label>
              <textarea 
                required 
                rows={3} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide full telemetry data of the problem..." 
                className="w-full bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl p-4 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all resize-none italic" 
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-[#111111] hover:bg-lime-500 hover:text-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <>Log Request <ChevronRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
