import React, { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  mockDashboardAnalytics, 
  mockPayments, 
  mockComplaints, 
  mockVisitors, 
  mockAllocations, 
  mockUsers, 
  mockTodos,
  revenueStreamData,
  departmentalBudgetData,
  paymentComplianceData,
  fiscalEventLog
} from '../data/mockData';
import { 
  Users, 
  Building, 
  CreditCard, 
  AlertCircle, 
  UserCheck, 
  TrendingUp, 
  Bed, 
  CheckCircle,
  MoreVertical,
  ChevronRight,
  Clock,
  Plus,
  Check,
  MessageSquare,
  Users2,
  ShieldCheck,
  CheckCircle2,
  Activity,
  DollarSign,
  UserPlus,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp as TrendingUpIcon,
  Zap,
  Target,
  Upload,
  X,
  RefreshCw,
  ArrowRightLeft,
  Landmark as Bank,
  Wrench,
  Package,
  Settings,
  Hammer,
  Thermometer,
  ZapOff,
  ClipboardList,
  AlertOctagon,
  Video,
  Eye,
  Radio,
  VideoOff,
  UserX,
  User,
  Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, ComposedChart, Line, RadialBarChart, RadialBar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { LogComplaintModal } from './ComplaintsPage';
import { useDashboard } from '../hooks/useDashboard';

// --- Noticeboard Overlay ---
export function NoticeboardSheet({ isOpen, onClose, role, missions, onRefresh }: { isOpen: boolean, onClose: () => void, role?: string, missions?: any[], onRefresh?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const displayNotices = (missions || [])
    .filter((m: any) => m.assigned_role === 'student' || m.assigned_role === 'all')
    .map((m: any) => ({
      title: m.title,
      date: new Date(m.created_at).toLocaleDateString(),
      desc: m.description,
      urgent: m.priority === 'high' || m.priority === 'critical'
    }));

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('missions').insert({
        title,
        description: desc,
        priority: isUrgent ? 'high' : 'medium',
        assigned_role: 'student',
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Operational Directive Published", { description: "Broadcast dispatched to all active nodes." });
      setTitle('');
      setDesc('');
      setIsUrgent(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (error: any) {
      toast.error("Broadcast Failed", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] border-l border-[#F0F0F0] p-0 bg-[#FAFBFC] overflow-y-auto">
        <SheetHeader className="p-8 border-b border-[#F0F0F0] bg-white sticky top-0 z-10 shadow-sm flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center">
              <Radio className="h-5 w-5 text-lime-600" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter text-[#111111] leading-none">Global <span className="text-lime-500">Noticeboard</span></SheetTitle>
              <SheetDescription className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Institutional Broadcasts</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="p-8 space-y-8">
          {role !== 'student' && (
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F0F0F0] space-y-4 text-left">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#111111] flex items-center gap-2">
                   <Target className="h-4 w-4 text-lime-600" /> New Broadcast
                </h4>
                 <form onSubmit={handleBroadcast} className="space-y-4">
                    <input 
                      required 
                      placeholder="Directive Title" 
                      className="w-full h-12 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-bold text-xs" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea 
                      required 
                      placeholder="Broadcast details..." 
                      className="w-full h-24 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl p-4 font-bold text-xs resize-none" 
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    />
                    <div className="flex items-center gap-2 px-1">
                      <input 
                        type="checkbox" 
                        id="urgent-broadcast" 
                        checked={isUrgent} 
                        onChange={(e) => setIsUrgent(e.target.checked)}
                        className="rounded border-[#F0F0F0]"
                      />
                      <label htmlFor="urgent-broadcast" className="text-[10px] font-black uppercase tracking-widest text-[#919191] cursor-pointer">Mark as Urgent Protocol</label>
                    </div>
                    <Button disabled={isSubmitting} type="submit" className="w-full bg-black text-lime-400 hover:bg-[#222222] font-black text-[10px] uppercase tracking-widest h-12 rounded-xl">
                      {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Dispatch Directive'}
                    </Button>
                 </form>
             </div>
          )}
           <div className="space-y-4 text-left">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#919191]">Recent Broadcasts</h4>
              <div className="space-y-3">
                {displayNotices.length > 0 ? (
                  displayNotices.map((n, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white border border-[#F0F0F0] hover:border-lime-500/30 transition-all cursor-default">
                       <div className="flex justify-between items-start mb-2">
                          <h5 className="text-sm font-black text-[#111111] uppercase tracking-tight">{n.title}</h5>
                          {n.urgent && <Badge className="bg-rose-500 text-white text-[8px] uppercase tracking-widest px-2 border-none">Urgent</Badge>}
                       </div>
                       <p className="text-xs font-bold text-[#555555] mb-3">{n.desc}</p>
                       <span className="text-[9px] font-black uppercase text-[#919191] italic tracking-widest flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> {n.date}
                       </span>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center space-y-4 bg-white rounded-3xl border border-dashed border-[#E5E5E5]">
                    <Radio className="h-10 w-10 text-[#E5E5E5] mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#919191]">No Active Broadcasts</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Financial Ledger Overlay ---
export function FinancialLedgerSheet({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const invoices = [
    { id: 'INV-2026-004', desc: 'Fall Term Hosteling Fee', amount: 'CFA 450.00', status: 'Pending', date: 'Oct 15, 2026' },
    { id: 'INV-2026-003', desc: 'Maintenance Penalty', amount: 'CFA 25.00', status: 'Paid', date: 'Oct 01, 2026' },
    { id: 'INV-2026-002', desc: 'Monthly Laundry Pass', amount: 'CFA 15.00', status: 'Paid', date: 'Sep 15, 2026' },
    { id: 'INV-2026-001', desc: 'Registration & Deposit', amount: 'CFA 1,200.00', status: 'Paid', date: 'Aug 20, 2026' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[600px] border-l border-[#F0F0F0] p-0 bg-[#FAFBFC] overflow-y-auto">
        <SheetHeader className="p-8 border-b border-[#F0F0F0] bg-white sticky top-0 z-10 shadow-sm flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
              <Bank className="h-5 w-5 text-lime-400" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter text-[#111111] leading-none">Financial <span className="text-lime-500">Ledger</span></SheetTitle>
              <SheetDescription className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Full Transaction History</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-lime-500 p-6 rounded-3xl text-left shadow-lg shadow-lime-500/20">
                 <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-2">Total Paid</p>
                 <h4 className="text-3xl font-black italic tabular-nums">CFA 1,240.00</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl text-left border border-[#F0F0F0] shadow-sm">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#919191] mb-2">Outstanding</p>
                 <h4 className="text-3xl font-black italic tabular-nums text-rose-500">CFA 450.00</h4>
              </div>
           </div>
           
           <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0] text-left">
              <div className="p-4 bg-[#111111] text-white flex justify-between items-center">
                 <h5 className="text-[10px] font-black uppercase tracking-widest">Recent Nodes</h5>
              </div>
              <div className="divide-y divide-[#F0F0F0]">
                 {invoices.map((inv, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors">
                       <div>
                          <p className="font-black text-xs uppercase tracking-tight text-[#111111]">{inv.desc}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#919191] mt-1">{inv.id} • {inv.date}</p>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                          <span className="font-black text-sm italic">{inv.amount}</span>
                          <Badge className={cn("border-none text-[8px] uppercase tracking-widest px-2 py-0.5", inv.status === 'Paid' ? "bg-lime-500/10 text-lime-700" : "bg-rose-500/10 text-rose-700")}>
                             {inv.status}
                          </Badge>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <Button className="w-full bg-black text-white hover:bg-[#222222] font-black text-[10px] uppercase tracking-widest h-14 rounded-2xl shadow-xl transition-all active:scale-95">
              Download Fiscal Artifact (PDF)
           </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Fund Requisition Modal ---
function FundRequisitionModal({ isOpen, onClose, role }: { isOpen: boolean, onClose: () => void, role: string }) {
  const { navigate } = useNavigation();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setAmount('');
        setNotes('');
        setCategory('');
        navigate('payments');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-none bg-white rounded-[2.5rem] shadow-2xl shadow-black/40 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Fund <span className="text-lime-500">Requisition</span></h3>
              <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Originating Role: {role}</p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-[#111111]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 rounded-full bg-lime-500 flex items-center justify-center mb-6 shadow-xl shadow-lime-500/20">
                <CheckCircle2 className="h-10 w-10 text-black" />
              </div>
              <h4 className="text-xl font-black text-[#111111] uppercase italic">Request Sent!</h4>
              <p className="text-xs font-bold text-[#919191] uppercase tracking-widest mt-2">Appearing in Finance Hub now.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Amount Requested (CFA)</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#111111]">CFA</div>
                   <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full h-16 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-12 font-black text-lg focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Expenditure Category</label>
                <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-16 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-6 font-bold text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all appearance-none" >
                  <option value="">Select Category</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Supplies">Operational Supplies</option>
                  <option value="Sanitary">Sanitary & Housekeeping</option>
                  <option value="Emergency">Emergency Funds</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Justification</label>
                <textarea required value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Explain why these funds are required..." className="w-full h-24 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl p-4 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all resize-none" />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-[#111111] hover:bg-lime-500 hover:text-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 transition-all active:scale-[0.98]" >
                {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <>Submit Request <ArrowRightLeft className="h-4 w-4 ml-2" /></>}
              </Button>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}

// --- Export Analytics Modal ---
function ExportAnalyticsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { navigate } = useNavigation();
  const [format, setFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Intelligence Dispatch Successful", {
        description: `Telemetry report has been compiled and exported as ${format.toUpperCase()}.`,
      });
      onClose();
      navigate('reports');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
              <Upload className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Export <span className="text-lime-500">Analytics</span></h3>
              <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Select Format & Dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-[#111111]" />
          </button>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {['pdf', 'csv', 'xlsx'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-2 group",
                  format === f ? "border-lime-500 bg-lime-50" : "border-[#F0F0F0] hover:border-black/10"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center mb-1",
                  format === f ? "bg-lime-500 text-black" : "bg-[#F9FAFB] text-[#919191]"
                )}>
                  {f === 'pdf' ? <Activity className="h-5 w-5" /> : f === 'csv' ? <ClipboardList className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{f}</span>
              </button>
            ))}
          </div>
          <Button onClick={handleExport} disabled={isExporting} className="w-full h-16 bg-[#111111] hover:bg-lime-500 hover:text-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
            {isExporting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <>Finalize Dispatch <ChevronRight className="h-4 w-4 ml-2" /></>}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// --- Staff Unit Modal ---
function StaffUnitModal({ isOpen, onClose, group }: { isOpen: boolean, onClose: () => void, group: any }) {
  const { navigate } = useNavigation();
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#111111] text-white">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-lime-500 text-black flex items-center justify-center">
                <Users className="h-5 w-5" />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">{group.name} <span className="text-lime-500">Unit</span></h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Active Operational Roster: {group.members} Members</p>
             </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="p-6 h-[400px] overflow-y-auto space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-black/5 group hover:bg-white hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${group.id}${i}`} />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div>
                   <p className="font-black text-xs text-[#111111] uppercase italic">Personnel Node {i + 101}</p>
                   <p className="text-[9px] font-bold text-[#919191] uppercase tracking-widest">{i % 2 === 0 ? 'On-Duty' : 'Standby'}</p>
                </div>
              </div>
              <Badge className={cn("rounded-lg border-none text-[8px] font-black uppercase px-2 py-1", i % 2 === 0 ? "bg-lime-500 text-black" : "bg-gray-200 text-gray-500")}>
                {i % 2 === 0 ? 'Optimal' : 'Standard'}
              </Badge>
            </div>
          ))}
        </div>
        <div className="p-6 pt-0">
          <Button 
            className="w-full h-14 bg-[#111111] text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
            onClick={() => { onClose(); navigate('settings'); }}
          >
            Manage Unit Permissions
          </Button>
        </div>
      </Card>
    </div>
  );
}

// --- Enrollment Detail Modal ---
function EnrollmentDetailModal({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) {
  const { navigate } = useNavigation();
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">{data.title} <span className="text-lime-500">Pipeline</span></h3>
              <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Enrollment Density: {data.allocated} / {data.capacity} Capacity</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-[#111111]" />
          </button>
        </div>
        <div className="p-8 grid grid-cols-3 gap-6">
          {[
            { label: 'New Applied', val: data.new, color: 'text-rose-500' },
            { label: 'Verification', val: data.verification, color: 'text-amber-500' },
            { label: 'Interview', val: data.interview, color: 'text-blue-500' }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 bg-[#F9FAFB] rounded-[2rem] border border-black/5 text-center">
              <p className={cn("text-3xl font-black mb-1", stat.color)}>{stat.val}</p>
              <p className="text-[9px] font-black uppercase text-[#111111] tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="px-8 pb-8 space-y-3">
          <Button 
            className="w-full h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            onClick={() => { onClose(); navigate('allocations'); }}
          >
            Batch Process Verification
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-xl border-[#F0F0F0] font-black text-[10px] uppercase tracking-widest"
            onClick={() => { onClose(); navigate('reports'); }}
          >
            Download Waitlist PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}

// --- Directive / Task Creation Modal ---
function DirectiveModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { navigate } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Operational Directive Published", {
        description: "Task has been synchronized across target personnel timelines.",
      });
      onClose();
      navigate('attendance', 'planner');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleCreate}>
          <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
                <Plus className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Direct <span className="text-lime-500">Command</span></h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Issue Tactical Directives</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Directive Title</label>
              <input required placeholder="e.g. Block A Sanitary Sweep" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-6 font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-lime-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Target Unit</label>
                  <select className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-bold text-[10px] uppercase">
                    <option>Wardens</option>
                    <option>Maintenance</option>
                    <option>Security</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Priority</label>
                  <select className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-xl px-4 font-bold text-[10px] uppercase">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High (ASAP)</option>
                  </select>
               </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-[#111111] hover:bg-lime-500 hover:text-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Publish Directive"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// --- Task Detail Modal ---
function TaskDetailModal({ isOpen, onClose, task }: { isOpen: boolean, onClose: () => void, task: any }) {
  const { navigate } = useNavigation();
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#111111] text-white">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-lime-500 text-black flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Task <span className="text-lime-500">Details</span></h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Assigned to: {task.assigned_role}</p>
             </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <h4 className="text-2xl font-black text-[#111111] uppercase italic">{task.title}</h4>
            <p className="text-sm font-medium text-[#919191] mt-2 leading-relaxed">{task.description}</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-black/5">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-lime-600" />
              <div>
                <p className="text-[10px] font-black uppercase text-[#919191]">Due Date</p>
                <p className="text-xs font-black text-[#111111]">{task.due_date}</p>
              </div>
            </div>
            <Badge className="bg-lime-500 text-black border-none font-black text-[10px] px-3 py-1 rounded-lg uppercase">{task.priority}</Badge>
          </div>
          <div className="pt-4 space-y-3">
            <Button 
              className="w-full h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              onClick={() => { onClose(); navigate('attendance', 'planner'); }}
            >
              Go to Planner Hub
            </Button>
            <Button variant="outline" className="w-full h-14 rounded-xl border-[#F0F0F0] font-black text-[10px] uppercase tracking-widest" onClick={onClose}>
              Dismiss View
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
// --- Log Incident Sheet ---
function LogIncidentSheet({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { navigate } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Incident Logged", {
        description: "The operational incident has been recorded and dispatched to the Warden Unit.",
      });
      onClose();
      navigate('attendance', 'planner');
    }, 1500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-[#111111] border-l border-white/5 text-white sm:max-w-md p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black uppercase italic tracking-tight text-white">Log <span className="text-rose-500">Incident</span></SheetTitle>
                <SheetDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Operational Protocol 104-B</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1">Incident Type</label>
              <select required className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-black text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all appearance-none text-white">
                <option value="" className="bg-[#111111]">Select Type</option>
                <option value="disciplinary" className="bg-[#111111]">Disciplinary Issue</option>
                <option value="maintenance" className="bg-[#111111]">Critical Maintenance</option>
                <option value="medical" className="bg-[#111111]">Medical Emergency</option>
                <option value="security" className="bg-[#111111]">Security Breach</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1">Location / Block</label>
              <input required placeholder="e.g. Block B, Room 204" className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-black text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1">Forensic Description</label>
              <textarea required placeholder="Provide detailed operational intelligence..." className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none text-white/80" />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/10 transition-all active:scale-[0.98]">
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Finalize Incident Log"}
            </Button>
          </form>

          <div className="p-8 bg-white/2 border-t border-white/5">
            <p className="text-[9px] font-bold text-white/20 uppercase text-center tracking-widest">Incident data is synchronized with central command timeline.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Schedule Detail Sheet ---
function ScheduleSheet({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { navigate } = useNavigation();
  if (!isOpen) return null;

  const timeline = [
    { time: '09:00 AM', title: 'Block A - Routine Room Inspection', status: 'completed', category: 'Operational' },
    { time: '11:00 AM', title: 'Meeting with Security Staff', status: 'in-progress', category: 'Strategic' },
    { time: '02:00 PM', title: 'Supervise plumbing repair in 204', status: 'pending', category: 'Maintenance' },
    { time: '05:00 PM', title: 'Review visitor logs', status: 'pending', category: 'Admin' },
    { time: '07:30 PM', title: 'Mess Quality Assurance Check', status: 'pending', category: 'Mess' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-white border-l border-[#F0F0F0] sm:max-w-md p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 border-b border-[#F5F5F5] bg-[#FAFBFC]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#111111] text-lime-400 flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black uppercase italic tracking-tight text-[#111111]">Daily <span className="text-lime-500">Timeline</span></SheetTitle>
                <SheetDescription className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Command Schedule: Nov 8, 2026</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-8">
            <div className="relative space-y-8 pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-[#111111] via-[#F0F0F0] to-[#F0F0F0]" />
              
              {timeline.map((item, i) => (
                <div key={i} className="relative">
                  <div className={cn(
                    "absolute -left-8 top-1 h-6 w-6 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-all",
                    item.status === 'completed' ? "bg-lime-500" : item.status === 'in-progress' ? "bg-blue-500 animate-pulse" : "bg-gray-200"
                  )}>
                    {item.status === 'completed' && <Check className="h-2 w-2 text-black" />}
                  </div>
                  <div className="bg-[#F9FAFB] border border-[#F0F0F0] rounded-[1.5rem] p-5 hover:bg-white hover:shadow-xl transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-[#919191] uppercase tracking-widest tabular-nums">{item.time}</span>
                      <Badge className={cn("text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-none", 
                        item.category === 'Strategic' ? "bg-purple-500/10 text-purple-600" : 
                        item.category === 'Maintenance' ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600")}>
                        {item.category}
                      </Badge>
                    </div>
                    <h4 className={cn("text-sm font-black uppercase italic tracking-tight text-[#111111]", item.status === 'completed' && "line-through opacity-40")}>{item.title}</h4>
                    <div className="mt-4 flex items-center gap-2">
                       <Button 
                        size="sm" 
                        className="h-7 px-3 bg-[#111111] text-white text-[8px] font-black uppercase tracking-widest rounded-lg"
                        onClick={() => { onClose(); navigate('attendance', 'planner'); }}
                       >
                         Update Status
                       </Button>
                       <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-3 border-[#F0F0F0] text-[8px] font-black uppercase tracking-widest rounded-lg"
                        onClick={() => { onClose(); navigate('attendance', 'planner'); }}
                       >
                         View Details
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-8 border-t border-[#F5F5F5]">
            <Button 
              className="w-full h-14 bg-lime-500 hover:bg-lime-600 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              onClick={() => { onClose(); navigate('attendance', 'planner'); }}
            >
              Add Timeline Entry <Plus className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Complaint Detail Sheet ---
function ComplaintDetailSheet({ isOpen, onClose, complaint }: { isOpen: boolean, onClose: () => void, complaint: any }) {
  const { navigate } = useNavigation();
  const [isResolving, setIsResolving] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  if (!isOpen || !complaint) return null;

  const handleResolve = () => {
    setIsResolving(true);
    setTimeout(() => {
      setIsResolving(false);
      toast.success("Node Resolved", { description: "Issue has been marked as resolved." });
      onClose();
      navigate('complaints');
    }, 1500);
  };

  const handleEscalate = () => {
    setIsEscalating(true);
    setTimeout(() => {
      setIsEscalating(false);
      toast.error("Case Escalated", { description: "Issue routed to higher command." });
      onClose();
      navigate('attendance', 'planner');
    }, 1500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-white border-l border-[#F0F0F0] sm:max-w-md p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 border-b border-[#F5F5F5] bg-[#FAFBFC]">
            <div className="flex items-center gap-4">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg", 
                complaint.priority === 'High' ? "bg-rose-500 text-white" : "bg-[#111111] text-lime-400")}>
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black uppercase italic tracking-tight text-[#111111]">Case <span className="text-rose-500">File</span></SheetTitle>
                <SheetDescription className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Logged: {complaint.time} • Node: {complaint.room}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="flex-1 p-8 space-y-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic">Issue Intelligence</p>
              <h3 className="text-2xl font-black text-[#111111] uppercase italic leading-tight">{complaint.issue}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#F0F0F0]">
                <p className="text-[9px] font-black text-[#919191] uppercase tracking-widest mb-1">Priority Level</p>
                <Badge className={cn("rounded-lg border-none text-[10px] font-black uppercase px-3 py-1", 
                  complaint.priority === 'High' ? "bg-rose-500 text-white" : "bg-amber-500 text-black")}>
                  {complaint.priority}
                </Badge>
              </div>
              <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#F0F0F0]">
                <p className="text-[9px] font-black text-[#919191] uppercase tracking-widest mb-1">Operational Status</p>
                <p className="text-[10px] font-black text-[#111111] uppercase italic flex items-center gap-2">
                   <span className={cn("h-2 w-2 rounded-full", complaint.status === 'Resolved' ? "bg-lime-500" : "bg-blue-500")} />
                   {complaint.status}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-[#111111] rounded-[2rem] text-white">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-8 w-8 rounded-xl bg-lime-500 text-black flex items-center justify-center">
                      <User className="h-4 w-4" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Assigned Personnel</p>
                      <p className="text-xs font-black uppercase italic">Maintenance Unit Delta</p>
                   </div>
                </div>
                <Button 
                  className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                  onClick={() => { onClose(); navigate('settings'); }}
                >
                  Re-assign Personnel
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest pl-1">Resolution Protocol</p>
              <textarea placeholder="Enter resolution notes..." className="w-full h-24 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl p-4 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all resize-none" />
            </div>
          </div>

          <div className="p-8 bg-[#FAFBFC] border-t border-[#F5F5F5] grid grid-cols-2 gap-4">
             <Button 
              variant="outline" 
              disabled={isEscalating || isResolving}
              className="h-14 rounded-xl border-[#F0F0F0] font-black text-[10px] uppercase tracking-widest"
              onClick={handleEscalate}
             >
               {isEscalating ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Escalate Case"}
             </Button>
             <Button 
              disabled={isResolving || isEscalating}
              className="h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              onClick={handleResolve}
             >
               {isResolving ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Resolve Node"}
             </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const ChartDefs = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D4FF3F" />
        <stop offset="100%" stopColor="#86EFAC" />
      </linearGradient>
      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#D8B4FE" />
      </linearGradient>
      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#93C5FD" />
      </linearGradient>
      <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#FBCFE8" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  </svg>
);

export function DashboardPage() {
  const { user } = useAuth();
  const dashboardData = useDashboard(user?.id);
  const { stats, isLoading } = dashboardData;

  // Different dashboard views based on role
  if (user?.role === 'admin') {
    return <AdminDashboard {...dashboardData} />;
  } else if (user?.role === 'warden') {
    return <WardenDashboard {...dashboardData} />;
  } else if (user?.role === 'student') {
    return <StudentDashboard {...dashboardData} />;
  } else if (user?.role === 'auditor') {
    return <AuditorDashboard {...dashboardData} />;
  } else if (user?.role === 'finance_officer') {
    return <FinanceDashboard {...dashboardData} />;
  } else if (user?.role === 'maintenance_staff') {
    return <MaintenanceDashboard {...dashboardData} />;
  } else if (user?.role === 'security') {
    return <SecurityDashboard {...dashboardData} />;
  }

  return <AdminDashboard {...dashboardData} />;
}

function AdminDashboard({ stats, revenueData, enrollmentGroups, staffCounts, missions, recentActivity, isLoading }: any) {
  const { navigate } = useNavigation();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStaffGroup, setSelectedStaffGroup] = useState<any>(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [isDirectiveModalOpen, setIsDirectiveModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const kpiStats = [
    { label: 'Gross Revenue Sync', value: stats ? `CFA ${(stats.revenue / 1000).toFixed(0)}k` : '...', icon: DollarSign, color: 'text-lime-500', bg: 'bg-lime-500/10', trend: stats ? `${stats.growth}%` : '...', status: 'optimal' },
    { label: 'Active Enrollment', value: stats ? stats.students.toString() : '...', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Live', status: 'optimal' },
    { label: 'Pending Complaints', value: stats ? stats.complaints.toString().padStart(2, '0') : '...', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'Audit', status: 'critical' },
    { label: 'Global Occupancy', value: stats && stats.rooms > 0 ? `${((stats.students / stats.rooms) * 100).toFixed(1)}%` : '...', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'Live', status: 'optimal' },
  ];

  const enrollmentData = enrollmentGroups || [];

  const summaryData = [
    { name: 'Allocated', value: stats ? stats.students : 0, color: '#D4FF3F' }, 
    { name: 'Available', value: stats ? Math.max(0, stats.rooms - stats.students) : 0, color: '#111111' },  
  ];

  const adminTasks = missions || [];

  const staffGroups = staffCounts || [];

  const [timeframe, setTimeframe] = React.useState('6M');

  const activeData = revenueData?.length > 0 ? revenueData : [
    { name: 'Jan', revenue: 0 },
    { name: 'Feb', revenue: 0 },
    { name: 'Mar', revenue: 0 },
    { name: 'Apr', revenue: 0 },
    { name: 'May', revenue: 0 },
    { name: 'Jun', revenue: 0 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{label} 2026</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-black text-white italic leading-tight">Revenue <span className="text-[#D4FF3F]">CFA {payload[0].value.toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#F9FAFB]/50">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-[#111111] uppercase">
            Admin <span className="text-lime-500">Terminal</span>
          </h1>
          <p className="text-sm font-medium text-[#919191]">Today is Monday, 8th November 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="rounded-xl bg-[#111111] text-white hover:bg-lime-500 hover:text-black font-black text-[10px] uppercase tracking-widest h-10 px-6 transition-all active:scale-95 shadow-lg shadow-black/5"
            onClick={() => setIsRequestModalOpen(true)}
          >
            <DollarSign className="h-4 w-4 mr-2 text-lime-400" /> Requisition Funds
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-[#F0F0F0]">
            <Clock className="h-4 w-4 text-[#919191]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#111111]">Feb 18 — Mar 18</span>
          </div>
          <Button variant="outline" className="rounded-xl border-[#F0F0F0] font-black text-[10px] uppercase tracking-widest h-10 px-4 group" onClick={() => setIsExportModalOpen(true)}>
            Export Analytics
          </Button>
        </div>
      </div>

      <FundRequisitionModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        role="Admin"
      />

      <ExportAnalyticsModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <StaffUnitModal 
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        group={selectedStaffGroup}
      />

      <EnrollmentDetailModal 
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        data={selectedEnrollment}
      />

      <DirectiveModal 
        isOpen={isDirectiveModalOpen}
        onClose={() => setIsDirectiveModalOpen(false)}
      />

      <TaskDetailModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
      />

      {/* KPI Telemetry Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiStats.map((stat, i) => (
          <Card key={i} className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2rem] overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <Badge className={cn(
                  "border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center shadow-sm",
                  stat.status === 'critical' ? "bg-rose-500 text-white" : "bg-[#111111] text-lime-400"
                )}>
                  {stat.trend}
                </Badge>
              </div>
              <h3 className="text-3xl font-black text-[#111111] leading-none mb-1 tabular-nums">{stat.value}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#111111] opacity-60 italic">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Enrollment Terminal */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[3rem] overflow-hidden">
            <div className="p-8 border-b border-[#F0F0F0]/50 flex items-center justify-between bg-[#FAFBFC]/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-lime-400" />
                </div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Enrollment <span className="text-lime-500">Matrix</span></h3>
              </div>
              <Button 
                variant="ghost" 
                className="rounded-xl h-10 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-white hover:shadow-sm"
                onClick={() => navigate('students')}
              >
                View Full Registry <ChevronRight className="h-4 w-4 text-lime-500" />
              </Button>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#FAFBFC]">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-black text-[#111111] h-14 pl-8 text-[10px] uppercase tracking-widest italic">Hostel / Unit</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 text-center text-[10px] uppercase tracking-widest italic">New Applied</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 text-center text-[10px] uppercase tracking-widest italic">Verification</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 text-center text-[10px] uppercase tracking-widest italic">Interview</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 pr-8 text-right text-[10px] uppercase tracking-widest italic">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentData.map((row: any, i: any) => (
                    <TableRow 
                      key={i} 
                      className="hover:bg-lime-50/30 transition-all border-b border-[#F0F0F0]/50 last:border-0 h-20 cursor-pointer"
                      onClick={() => {
                        setSelectedEnrollment(row);
                        setIsEnrollmentModalOpen(true);
                      }}
                    >
                      <TableCell className="pl-8">
                        <div>
                          <p className="font-black text-sm text-[#111111] uppercase italic tracking-tight">{row.title}</p>
                          <p className="text-[10px] font-bold text-[#919191] mt-1 uppercase tracking-widest">Cap: {row.capacity}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-rose-500/10 text-rose-700 border-none font-black text-[9px] px-3 py-1 rounded-lg">
                          {row.new} Students
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-amber-500/10 text-amber-700 border-none font-black text-[9px] px-3 py-1 rounded-lg">
                          {row.verification} Checked
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-500/10 text-blue-700 border-none font-black text-[9px] px-3 py-1 rounded-lg">
                          {row.interview} Waiting
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg transition-all">
                          <ChevronRight className="h-5 w-5 text-[#919191]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Revenue Overview reconstructed from reference */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[3rem] overflow-hidden">
            <div className="p-8 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-white tracking-tighter">Revenue <span className="text-white/40">Overview</span></h3>
              
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                {['1W', '1M', '3M', '1Y', '6M'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                      timeframe === tf 
                        ? "bg-[#222222] text-white shadow-lg" 
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    {tf}
                  </button>
                ))}
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button 
                  className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <Upload className="h-3 w-3" /> Export
                </button>
              </div>
            </div>

            <div className="h-[320px] w-full mt-8 px-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4FF3F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4FF3F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#ffffff08" strokeDasharray="0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#ffffff30', fontSize: 10, fontWeight: 900 }} 
                    dy={15}
                  />
                  <YAxis 
                    tickFormatter={(value) => `CFA ${value}K`}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#ffffff30', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D4FF3F', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#D4FF3F" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#revenueGradient)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Tactical KPI Footer */}
            <div className="p-8 pt-4 flex flex-wrap items-center gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Total</span>
                <span className="text-lg font-black text-white tabular-nums tracking-tighter">CFA {stats ? (stats.revenue / 1000).toFixed(1) : '...'}K</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Growth</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-lime-400 tabular-nums tracking-tighter">+{stats ? stats.growth : '...'}%</span>
                  <TrendingUp className="h-4 w-4 text-lime-400" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Avg</span>
                <span className="text-lg font-black text-white tabular-nums tracking-tighter">CFA {stats ? (stats.revenue / 6000).toFixed(1) : '...'}K</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Personnel Hub */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Support <span className="text-lime-500 italic">Units</span></h3>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Personnel status.</p>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 rounded-xl h-10 font-black text-[9px] uppercase tracking-widest"
                  onClick={() => navigate('attendance')}
                >
                  Roster <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {staffGroups.map((group: any, i: any) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedStaffGroup(group);
                    setIsStaffModalOpen(true);
                  }}
                >
                  <div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tight group-hover:text-lime-400 transition-colors">{group.name}</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Active: {group.members}</p>
                  </div>
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((_, idx) => (
                      <Avatar key={idx} className="h-8 w-8 border-4 border-[#111111] ring-0 transition-transform group-hover:-translate-y-1">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${group.id}${idx}`} />
                        <AvatarFallback className="text-[10px] font-black bg-[#222222] text-white">S</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Operational Timeline */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[3rem] overflow-hidden border border-white relative">
            <div className="p-8 flex items-center justify-between bg-[#FAFBFC]/30">
              <div>
                <CardTitle className="text-[#111111] text-xl font-black uppercase italic tracking-tighter">My <span className="text-lime-500 italic">Timeline</span></CardTitle>
                <CardDescription className="text-[#919191] font-bold text-[10px] uppercase tracking-widest mt-1">Command directives.</CardDescription>
              </div>
              <Button 
                className="h-10 px-4 bg-[#111111] hover:bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-black/10"
                onClick={() => setIsDirectiveModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Direct
              </Button>
            </div>
            <CardContent className="p-6 space-y-4">
              {adminTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic">No active directives.</p>
                </div>
              ) : adminTasks.map((task: any, i: number) => (
                <div key={task.id} className={cn("group relative pl-8 pb-4 last:pb-0", task.status === 'completed' && "opacity-60")}>
                  <div className="absolute left-3 top-2 bottom-0 w-px bg-[#F0F0F0] group-last:bg-transparent" />
                  <div className={cn(
                    "absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white shadow-md transition-all flex items-center justify-center z-10",
                    task.status === 'completed' ? "bg-lime-500" :
                    task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-[#111111]'
                  )}>
                    {task.status === 'completed' ? (
                      <Check className="h-2 w-2 text-[#111111]" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                  <div 
                    className={cn(
                      "p-4 bg-white border border-[#F0F0F0] rounded-2xl group-hover:border-[#111111] transition-all cursor-pointer relative overflow-hidden group/card",
                      task.status === 'completed' && "bg-[#F9FAFB]/80 border-transparent shadow-inner"
                    )}
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#919191] tabular-nums tracking-widest uppercase">
                          {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {task.assigned_role && (
                          <Badge className="text-[6px] font-black uppercase px-1.5 py-0 rounded-md border-none bg-blue-500/10 text-blue-600">
                            {task.assigned_role}
                          </Badge>
                        )}
                      </div>
                      <Badge className={cn("text-[7px] font-black py-0.5 px-2 rounded-md border-none", 
                        task.priority === 'high' ? 'bg-rose-500 text-white' : 
                        task.priority === 'medium' ? 'bg-amber-500 text-black' : 'bg-gray-100 text-gray-500')}>
                        {task.priority?.toUpperCase() || 'NORMAL'}
                      </Badge>
                    </div>
                    <h5 className={cn(
                      "font-black text-xs text-[#111111] uppercase italic tracking-tight transition-all",
                      task.status === 'completed' && "line-through text-[#919191]"
                    )}>{task.title}</h5>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WardenDashboard({ stats, recentActivity, missions, isLoading, refresh }: any) {
  const { navigate } = useNavigation();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLogIncidentOpen, setIsLogIncidentOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isNoticeboardOpen, setIsNoticeboardOpen] = useState(false);
  const [isComplaintDetailOpen, setIsComplaintDetailOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  const operationsStats = [
    { 
      title: 'Active Stays', 
      value: stats ? stats.students.toString() : '...', 
      subtext: 'Currently occupied units', 
      icon: <Building className="h-6 w-6 text-lime-400" />,
      cardColor: "bg-gradient-to-br from-white to-[#F9FAFB]",
      shadow: "shadow-2xl shadow-lime-500/5",
      iconBoxBg: "bg-black shadow-lg shadow-black/20",
      textColor: "text-[#111111]",
      subtextColor: "text-lime-600",
      watermark: <ShieldCheck className="h-24 w-24 text-black" />,
      action: () => navigate('allocations')
    },
    { 
      title: 'Critical Alerts', 
      value: stats ? stats.complaints.toString() : '...', 
      subtext: 'Needs immediate action', 
      icon: <AlertCircle className="h-6 w-6 text-lime-400" />,
      cardColor: "bg-gradient-to-br from-[#111111] to-[#222222]",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-white/10 backdrop-blur-md",
      textColor: "text-white",
      subtextColor: "text-white/40",
      watermark: <AlertCircle className="h-24 w-24 text-white" />,
      action: () => navigate('complaints')
    },
    { 
      title: 'On Leave', 
      value: '0', 
      subtext: 'Students out of hostel', 
      icon: <Clock className="h-6 w-6 text-lime-600" />,
      cardColor: "bg-white",
      shadow: "shadow-2xl shadow-lime-500/5",
      iconBoxBg: "bg-lime-500/10",
      textColor: "text-[#111111]",
      subtextColor: "text-[#919191]",
      watermark: <Clock className="h-24 w-24 text-lime-500" />,
      action: () => navigate('attendance')
    },
  ];

  const complaints = recentActivity
    .filter((a: any) => a.type === 'complaint')
    .map((a: any) => ({
      room: 'Global', 
      issue: a.title,
      status: a.status,
      priority: 'Medium',
      time: new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

  const tasks = [
    { time: '09:00 - 10:00 AM', title: 'Block A - Routine Room Inspection', type: 'Routine' },
    { time: '11:00 - 11:30 AM', title: 'Meeting with Security Staff', type: 'Meeting' },
    { time: '02:00 - 04:00 PM', title: 'Supervise plumbing repair in 204', type: 'Maintenance' },
    { time: '05:00 - 05:30 PM', title: 'Review visitor logs', type: 'Admin' },
  ];

  const buildingStatus = [
    { name: 'Block A', occupancy: '98%', complaints: 4, status: 'Normal' },
    { name: 'Block B', occupancy: '85%', complaints: 12, status: 'Attention' },
    { name: 'Block C', occupancy: '100%', complaints: 1, status: 'Optimal' },
  ];

  const issueTrendData = [
    { name: 'Nov 1', resolved: 32, pending: 8 },
    { name: '2', resolved: 38, pending: 2 },
    { name: '3', resolved: 12, pending: 28 },
    { name: '4', resolved: 18, pending: 22 },
    { name: '5', resolved: 15, pending: 25 },
    { name: '6', resolved: 28, pending: 12 },
    { name: '7', resolved: 24, pending: 16 },
    { name: '8', resolved: 35, pending: 5 },
    { name: '9', resolved: 22, pending: 18 },
    { name: '10', resolved: 36, pending: 4 },
    { name: '11', resolved: 38, pending: 2 },
    { name: '12', resolved: 38, pending: 2 },
    { name: 'Today', resolved: 15, pending: 25 },
  ];

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">Warden <span className="text-lime-500">Operations</span></h1>
          <p className="text-sm font-medium text-[#919191]">Intelligent operational management tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="rounded-2xl border-lime-500/20 bg-white hover:bg-lime-50 text-[#111111] font-black h-12 px-6 transition-all active:scale-95 shadow-lg shadow-black/5 uppercase tracking-widest text-[10px]"
            onClick={() => setIsNoticeboardOpen(true)}
          >
            <Radio className="mr-2 h-5 w-5 text-lime-500" />
            Notice Board
          </Button>
          <Button 
            variant="outline"
            className="rounded-2xl border-lime-500/20 bg-white hover:bg-lime-50 text-[#111111] font-black h-12 px-6 transition-all active:scale-95 shadow-lg shadow-black/5 uppercase tracking-widest text-[10px]"
            onClick={() => setIsRequestModalOpen(true)}
          >
            <Bank className="mr-2 h-5 w-5 text-lime-500" />
            Request Funds
          </Button>
          <Button 
            className="rounded-2xl bg-black hover:bg-black/90 text-white font-bold h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none uppercase tracking-widest text-[10px]"
            onClick={() => setIsLogIncidentOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5 text-lime-400" />
            Log Incident
          </Button>
        </div>
      </div>

      <FundRequisitionModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        role="Warden"
      />

      <LogIncidentSheet 
        isOpen={isLogIncidentOpen}
        onClose={() => setIsLogIncidentOpen(false)}
      />

      <ScheduleSheet 
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />

      <ComplaintDetailSheet 
        isOpen={isComplaintDetailOpen}
        onClose={() => setIsComplaintDetailOpen(false)}
        complaint={selectedComplaint}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {operationsStats.map((s, i) => (
          <Card 
            key={i} 
            className={cn("border-none rounded-[2rem] overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 active:scale-[0.98]", s.cardColor, s.shadow)}
            onClick={s.action}
          >
            <CardContent className="p-6 relative h-[160px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                {s.watermark}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", s.iconBoxBg)}>
                  {s.icon}
                </div>
                <p className={cn("text-sm font-black uppercase tracking-widest", s.title === 'Critical Alerts' ? 'text-white/60 text-[10px]' : 'text-[#111111]')}>
                  {s.title}
                </p>
              </div>
              <h3 className={cn("text-5xl font-black leading-none mb-1 tabular-nums", s.textColor)}>{s.value}</h3>
              <div className="flex items-center justify-between mt-auto">
                <p className={cn("text-xs font-bold uppercase italic", s.subtextColor)}>{s.subtext}</p>
                <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", s.textColor === 'text-white' ? 'text-white/40' : 'text-[#111111]/40')} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Top Row Grid */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          {/* Operations Schedule Table */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden flex-1 flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Today's <span className="text-lime-500">Schedule</span></h3>
                <Button 
                  variant="ghost" 
                  className="text-xs font-black text-[#111111] uppercase tracking-widest hover:bg-[#F0F0F0] rounded-xl flex items-center"
                  onClick={() => setIsScheduleOpen(true)}
                >
                  VIEW ALL <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50 flex-1">
                <Table>
                  <TableHeader className="bg-[#FAFBFC]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic w-1/4">Time Span</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic w-1/2">Task Description</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic text-right">Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task: any, i: any) => (
                      <TableRow 
                        key={i} 
                        className="hover:bg-[#F9FAFB] transition-colors group border-b border-[#F0F0F0]/50 last:border-0 cursor-pointer"
                        onClick={() => setIsScheduleOpen(true)}
                      >
                        <TableCell className="py-4 px-6 text-xs font-black text-[#555555] opacity-70 tracking-tighter tabular-nums">{task.time}</TableCell>
                        <TableCell className="py-4 text-xs font-black text-[#111111] uppercase tracking-tight">{task.title}</TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Badge variant="outline" className="rounded-lg border-none bg-[#F3F4F6] text-[#555555] font-black text-[9px] uppercase tracking-widest">
                            {task.type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col">
          {/* Building Status */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden flex-1 group/block">
             <div className="p-8">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Block <span className="text-lime-500">Status</span></h3>
                 <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/40 hover:text-white font-black text-[8px] uppercase tracking-widest h-8"
                  onClick={() => navigate('rooms')}
                 >
                   Inventory
                 </Button>
               </div>
               <div className="space-y-6">
                 {buildingStatus.map((block, i) => (
                   <div 
                    key={i} 
                    className="space-y-2 relative cursor-pointer group/item"
                    onClick={() => navigate('rooms')}
                   >
                     <div className="flex justify-between items-center z-10 relative">
                       <span className="text-xs font-black uppercase tracking-wider text-white bg-[#111111]/80 backdrop-blur-md px-2 rounded-lg group-hover/item:text-lime-400 transition-colors">{block.name}</span>
                       <span className={cn(
                         "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                         block.status === 'Normal' ? "bg-white/10 text-white" :
                         block.status === 'Attention' ? "bg-lime-500 text-black" :
                         "bg-emerald-500 text-white"
                       )}>{block.status}</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                         <div 
                          className={cn("h-full rounded-full transition-all duration-1000", block.status === 'Attention' ? "bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.5)]" : "bg-white/80")} 
                          style={{ width: block.occupancy }} 
                         />
                       </div>
                       <span className="text-[10px] font-black text-white w-8 text-right tabular-nums">{block.occupancy}</span>
                     </div>
                     <div className="text-[9px] font-black uppercase tracking-widest text-white/40 italic flex justify-between items-center">
                       <span>{block.complaints} active issues</span>
                       <ChevronRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          {/* Critical Complaints */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden flex-1 flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Critical <span className="text-red-500">Alerts</span></h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-red-500 text-[10px] font-black text-white shadow-lg shadow-red-500/20 tabular-nums">3</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-xs font-black text-[#111111] uppercase tracking-widest hover:bg-[#F0F0F0] rounded-xl flex items-center"
                  onClick={() => navigate('complaints')}
                >
                  VIEW ALL <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50 flex-1">
                <Table>
                  <TableHeader className="bg-[#FAFBFC]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic">Location</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic">Issue</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Priority</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Status</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((c: any, i: any) => (
                      <TableRow 
                        key={i} 
                        className="hover:bg-[#F9FAFB] transition-colors group border-b border-[#F0F0F0]/50 last:border-0 cursor-pointer"
                        onClick={() => {
                          setSelectedComplaint(c);
                          setIsComplaintDetailOpen(true);
                        }}
                      >
                        <TableCell className="py-4 px-6 text-xs font-black text-[#111111] uppercase tracking-tight">{c.room}</TableCell>
                        <TableCell className="py-4 text-xs font-black text-[#555555] uppercase tracking-tight italic">{c.issue}</TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge 
                            className={cn(
                              "rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                              c.priority === 'High' ? "bg-red-500/15 text-red-700" : 
                              c.priority === 'Medium' ? "bg-amber-500/15 text-amber-700" : 
                              "bg-[#F3F4F6] text-[#555555]"
                            )}
                          >
                            {c.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                           <span className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#111111]">
                             <div className={cn(
                               "h-2 w-2 rounded-full",
                               c.status === 'Resolved' ? "bg-lime-500" : 
                               c.status === 'In Progress' ? "bg-blue-500" : 
                               "bg-amber-500"
                             )} />
                             {c.status}
                           </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right text-[10px] font-bold text-[#919191] italic tracking-tighter tabular-nums">{c.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col">
          {/* Issue Trend Area Chart -> Replaced with Stacked Bar matching user specifications */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2.5rem] overflow-hidden flex-1 flex flex-col">
             <div className="p-8 pb-0">
               <h3 className="text-base font-black text-[#111111] uppercase tracking-widest italic">Complaint Resolution</h3>
               <div className="mt-4">
                 <h2 className="text-5xl font-black text-[#111111] tracking-tight tabular-nums leading-none mb-1">84%</h2>
                 <p className="text-xs font-bold text-[#919191] uppercase tracking-widest italic">16 pending issues</p>
               </div>
             </div>
             <div className="flex-1 min-h-[180px] mt-6 pb-6 pr-6">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={issueTrendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                   <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={(props: any) => {
                      const { x, y, payload } = props;
                      if(payload.value === 'Nov 1' || payload.value === 'Today') {
                        return <text x={x} y={y + 10} fill="#919191" fontSize={10} fontWeight={900} textAnchor="middle">{payload.value}</text>;
                      }
                      return <g></g>;
                    }}
                   />
                   <YAxis
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 40]}
                    domain={[0, 40]}
                    tick={{ fill: '#919191', fontSize: 10, fontWeight: 900 }}
                    width={35}
                   />
                   <Tooltip 
                     cursor={{ fill: '#FAFAFA' }}
                     contentStyle={{ borderRadius: '1rem', border: 'none', background: '#111111', color: '#fff', fontSize: '12px', fontWeight: 900, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ color: '#D4FF3F' }}
                   />
                   <Bar 
                     dataKey="resolved" 
                     stackId="a"
                     fill="#111111" 
                     radius={[0, 0, 4, 4]} 
                     barSize={12}
                   />
                   <Bar 
                     dataKey="pending" 
                     stackId="a"
                     fill="#D4FF3F" 
                     radius={[4, 4, 0, 0]} 
                     barSize={12}
                   />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ stats, studentData, missions, revenueData, recentActivity, isLoading, refresh }: any) {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [isNoticeboardOpen, setIsNoticeboardOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  
  const expenditureData = revenueData?.length > 0 ? revenueData : [
    { name: 'Jun', value: 0 },
    { name: 'Jul', value: 0 },
    { name: 'Aug', value: 0 },
    { name: 'Sep', value: 0 },
    { name: 'Oct', value: 0 },
    { name: 'Nov', value: 0 },
  ];

  const studentStats = [
    { 
      title: 'Room Assignment', 
      value: studentData?.room || '...', 
      subtext: `${studentData?.building || '...'} - ${studentData?.roomType || '...'}`, 
      icon: <Bed className="h-6 w-6 text-[#D4FF3F]" />,
      cardColor: "bg-gradient-to-br from-[#111111] to-[#222222]",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-white/10 backdrop-blur-md",
      textColor: "text-white",
      subtextColor: "text-[#D4FF3F] font-black drop-shadow-[0_0_8px_rgba(212,255,63,0.4)] tracking-widest",
      watermark: <Building className="h-24 w-24 text-white" />
    },
    { 
      title: 'Term Expenditure', 
      value: studentData ? `CFA ${studentData.expenditure.toLocaleString()}` : '...', 
      subtext: 'Total spent this semester', 
      icon: <TrendingUp className="h-6 w-6 text-[#111111]" />,
      cardColor: "bg-[#D4FF3F]",
      shadow: "shadow-2xl shadow-[#D4FF3F]/20",
      iconBoxBg: "bg-black/10 backdrop-blur-md",
      textColor: "text-[#111111]",
      subtextColor: "text-[#111111] font-black tracking-widest opacity-80",
      watermark: <TrendingUp className="h-24 w-24 text-[#111111]" />
    },
    { 
      title: 'Active Requests', 
      value: studentData?.activeRequests.toString() || '0', 
      subtext: 'Awaiting Maintenance', 
      icon: <AlertCircle className="h-6 w-6 text-[#111111]" />,
      cardColor: "bg-white",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-black/5",
      textColor: "text-[#111111]",
      subtextColor: "text-[#111111] font-black opacity-50 tracking-widest",
      watermark: <MessageSquare className="h-24 w-24 text-black" />
    },
  ];

  const recentInvoices = (studentData?.recentInvoices || []).map((inv: any) => ({
    id: inv.id.split('-')[0].toUpperCase(),
    desc: 'Hostel Services Payment',
    amount: `CFA ${inv.amount}`,
    status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
    date: new Date(inv.created_at).toLocaleDateString()
  }));

  const notices = missions
    .filter((m: any) => m.assigned_role === 'student' || m.assigned_role === 'all')
    .map((m: any) => ({
      title: m.title,
      date: new Date(m.created_at).toLocaleDateString(),
      desc: m.description,
      urgent: m.priority === 'high'
    }));

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">Student <span className="text-lime-500">Portal</span></h1>
          <p className="text-sm font-bold text-[#919191] uppercase tracking-widest italic">Welcome back, {user?.full_name || 'Student'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-2xl bg-black hover:bg-black/90 text-white font-bold h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none" onClick={() => navigate('complaints')}>
            <Plus className="mr-2 h-5 w-5 text-lime-400" />
            New Request
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studentStats.map((s, i) => (
          <Card key={i} className={cn("border-none rounded-[2rem] overflow-hidden group", s.cardColor, s.shadow)}>
            <CardContent className="p-6 relative h-[160px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                {s.watermark}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", s.iconBoxBg)}>
                  {s.icon}
                </div>
                <p className={cn("text-sm font-black uppercase tracking-widest", s.title === 'Room Assignment' ? 'text-white/60 text-[10px]' : (s.title === 'Current Balance' ? 'text-[#111111]/60 text-[10px]' : 'text-[#111111]'))}>
                  {s.title}
                </p>
              </div>
              <h3 className={cn("text-5xl font-black leading-none mb-1 tabular-nums", s.textColor)}>{s.value}</h3>
              <p className={cn("text-xs font-bold uppercase italic tracking-wider mt-2", s.subtextColor)}>{s.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          {/* Recent Invoices Table */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden flex-1 flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Financial <span className="text-lime-500">Records</span></h3>
                <Button variant="ghost" className="text-xs font-black text-[#111111] uppercase tracking-widest hover:bg-[#F0F0F0] rounded-xl flex items-center" onClick={() => setIsLedgerOpen(true)}>VIEW ALL <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50 flex-1">
                <Table>
                  <TableHeader className="bg-[#FAFBFC]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic w-1/4">Invoice ID</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic w-1/2">Description</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic text-center">Status</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((inv: any, i: any) => (
                      <TableRow key={i} className="hover:bg-[#F9FAFB] transition-colors group border-b border-[#F0F0F0]/50 last:border-0">
                        <TableCell className="py-4 px-6 text-xs font-black text-[#111111] uppercase tracking-tight">{inv.id}</TableCell>
                        <TableCell className="py-4 text-xs font-black text-[#555555] opacity-70 tracking-tighter italic">{inv.desc}</TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <Badge variant="outline" className={cn(
                            "rounded-md border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-sm",
                            inv.status === 'Paid' ? "bg-lime-500/15 text-lime-800" : "bg-amber-500/15 text-amber-800"
                          )}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right text-xs font-black tracking-tighter tabular-nums text-[#111111]">{inv.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col">
          {/* Hostel Notices List */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden flex-1 flex flex-col">
             <div className="p-8 flex-1 flex flex-col">
               <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-8">Hostel <span className="text-lime-500">Notices</span></h3>
               <div className="space-y-6 flex-1">
                 {notices.map((notice: any, i: any) => (
                   <div key={i} className="space-y-2 relative border-b border-white/10 pb-4 last:border-0 last:pb-0">
                     <div className="flex justify-between items-start z-10 relative">
                       <span className={cn(
                        "text-xs font-black uppercase tracking-wider",
                         notice.urgent ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" : "text-lime-400"
                        )}>
                         {notice.title}
                       </span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#919191]">{notice.date}</span>
                     </div>
                     <p className="text-[11px] font-medium text-white/60 italic leading-relaxed">
                       {notice.desc}
                     </p>
                   </div>
                 ))}
               </div>
               
               <Button className="w-full mt-6 bg-white hover:bg-[#F0F0F0] text-[#111111] font-black uppercase tracking-widest border-none rounded-2xl h-14 text-xs transition-transform hover:-translate-y-1" onClick={() => setIsNoticeboardOpen(true)}>
                 View Noticeboard
               </Button>
             </div>
          </Card>
        </div>
      </div>
      {/* Split Bottom Row */}
      <div className="grid grid-cols-12 gap-6 pb-6 mt-2">
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          <Card className="border-none shadow-2xl shadow-lime-500/10 bg-[#111111] rounded-[2.5rem] overflow-hidden flex flex-col h-[380px]">
             <div className="p-8 pb-0">
               <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Expenditure <span className="text-lime-500">Trend</span></h3>
               <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mt-1">LAST 6 MONTHS LOG</p>
             </div>
             <div className="flex-1 mt-6 px-4 pb-6 -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={expenditureData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#D4FF3F" stopOpacity={0.6}/>
                       <stop offset="95%" stopColor="#D4FF3F" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} 
                    dy={10}
                   />
                   <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }}
                    tickFormatter={(val) => `CFA ${val}`}
                    width={50}
                   />
                   <Tooltip 
                     cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                     contentStyle={{ borderRadius: '1rem', border: 'none', background: '#D4FF3F', color: '#111111', fontSize: '12px', fontWeight: 900, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' }}
                     itemStyle={{ color: '#111111' }}
                     formatter={(value) => [`CFA ${value}`, 'Amount']}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="value" 
                     stroke="#D4FF3F" 
                     strokeWidth={5} 
                     fillOpacity={1} 
                     fill="url(#colorExp)" 
                     activeDot={{ r: 8, fill: '#111111', stroke: '#D4FF3F', strokeWidth: 3 }}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col">
          {/* Room Service / Cleaning Schedule */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2.5rem] overflow-hidden flex-1 flex flex-col h-[380px]">
             <div className="p-8 flex-1 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                 <CheckCircle className="h-32 w-32 text-[#111111]" />
               </div>
               <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight mb-6 z-10">Room <span className="text-lime-500">Service</span></h3>
               <div className="flex-1 space-y-4 z-10 flex flex-col justify-center">
                 <div className="bg-[#FAFBFC] rounded-2xl p-4 border border-[#F0F0F0] flex flex-col gap-3 group hover:border-lime-200 hover:shadow-[0_0_15px_rgba(212,255,63,0.1)] transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-[#111111] uppercase tracking-widest">Deep Cleaning</h4>
                        <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Tomorrow, 10:00 AM</p>
                      </div>
                      <Badge className="bg-lime-500/15 text-lime-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Scheduled</Badge>
                    </div>
                 </div>
                 <div className="bg-[#FAFBFC] rounded-2xl p-4 border border-[#F0F0F0] flex flex-col gap-3 group hover:border-lime-200 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-[#111111] uppercase tracking-widest">Laundry Pickup</h4>
                        <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Friday, 08:00 AM</p>
                      </div>
                      <Badge className="bg-[#F0F0F0] text-[#555555] border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Pending</Badge>
                    </div>
                 </div>
               </div>
               <Button className="w-full mt-6 bg-[#111111] hover:bg-black text-white font-black uppercase tracking-widest border-none rounded-2xl h-14 text-xs transition-transform hover:-translate-y-1 z-10" onClick={() => navigate('complaints')}>
                 Request Service
               </Button>
             </div>
          </Card>
        </div>
      </div>
      <NoticeboardSheet 
        isOpen={isNoticeboardOpen} 
        onClose={() => setIsNoticeboardOpen(false)} 
        role="student" 
        missions={missions}
        onRefresh={refresh}
      />
      <FinancialLedgerSheet isOpen={isLedgerOpen} onClose={() => setIsLedgerOpen(false)} />
    </div>
  );
}
function AuditorDashboard({ stats, revenueData, recentActivity, isLoading }: any) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState('');
  const [processMessage, setProcessMessage] = useState('');

  const auditStats = [
    { 
      title: 'Capital Audited', 
      value: stats ? `CFA ${(stats.revenue / 1000000).toFixed(1)}M` : '...', 
      subtext: 'Verified ledger volume', 
      icon: <CreditCard className="h-6 w-6 text-[#111111]" />,
      cardColor: "bg-[#D4FF3F]",
      shadow: "shadow-2xl shadow-lime-500/10",
      iconBoxBg: "bg-black/10 backdrop-blur-md",
      textColor: "text-[#111111]",
      subtextColor: "text-[#111111] opacity-60",
      watermark: <CheckCircle className="h-24 w-24 text-[#111111]" />
    },
    { 
      title: 'Discrepancy Flags', 
      value: stats ? stats.complaints.toString() : '...', 
      subtext: 'Ledger nodes requiring sync', 
      icon: <AlertCircle className="h-6 w-6 text-lime-400" />,
      cardColor: "bg-[#111111]",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-white/10 backdrop-blur-md",
      textColor: "text-white",
      subtextColor: "text-white/40",
      watermark: <AlertCircle className="h-24 w-24 text-white" />
    },
    { 
      title: 'Integrity Index', 
      value: stats && stats.growth ? `${(100 - parseFloat(stats.growth)).toFixed(0)}%` : '97%', 
      subtext: 'Avg. hostel compliance score', 
      icon: <Users className="h-6 w-6 text-lime-600" />,
      cardColor: "bg-white",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-lime-500/10",
      textColor: "text-[#111111]",
      subtextColor: "text-[#919191]",
      watermark: <ShieldCheck className="h-24 w-24 text-lime-500" />
    },
  ];

  const auditMatrix = (recentActivity || []).slice(0, 5).map((a: any) => ({
    node: a.title,
    value: a.type === 'payment' ? `CFA ${a.amount}` : 'N/A',
    sync: 'Synced',
    compliance: '100%',
    time: new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const auditProtocols = [
    { time: '09:00 AM', title: 'Revenue Reconciliation Loop', type: 'Finance' },
    { time: '11:30 AM', title: 'Block B Room Allocation Audit', type: 'Inventory' },
    { time: '02:00 PM', title: 'Student Late Fee Validation', type: 'Compliance' },
  ];

  const auditPieData = [
    { name: 'Financial Audit', value: 85, fill: '#D4FF3F' }, 
    { name: 'Stay Verification', value: 65, fill: '#A855F7' },
    { name: 'Inventory sync', value: 45, fill: '#3B82F6' },
    { name: 'Risk Protocol', value: 92, fill: '#F59E0B' },
  ];

  const revenuePulseData = [
    { month: 'Jun', verified: 1200000, target: 1100000, variance: 100000 },
    { month: 'Jul', verified: 1500000, target: 1400000, variance: 100000 },
    { month: 'Aug', verified: 1300000, target: 1450000, variance: -150000 },
    { month: 'Sep', verified: 1800000, target: 1700000, variance: 100000 },
    { month: 'Oct', verified: 2100000, target: 2000000, variance: 100000 },
    { month: 'Nov', verified: 2400000, target: 2200000, variance: 200000 },
  ];

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500 pb-10">
      {/* Tactical Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[#111111] uppercase italic">Auditor <span className="text-lime-500">Terminal</span></h1>
          <p className="text-sm font-medium text-[#919191]">Financial integrity and compliance oversight engine.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="rounded-2xl bg-[#111111] hover:bg-black text-white font-black uppercase tracking-widest h-14 px-8 shadow-xl shadow-black/10 transition-all border-none active:scale-95"
            onClick={() => setIsExportModalOpen(true)}
          >
             Generate Report
          </Button>
        </div>
      </div>

      {/* Audit KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {auditStats.map((s, i) => (
          <Card key={i} className={cn("border-none rounded-[2rem] overflow-hidden group", s.cardColor, s.shadow)}>
            <CardContent className="p-6 relative h-[160px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                {s.watermark}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", s.iconBoxBg)}>
                  {s.icon}
                </div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", s.cardColor === 'bg-[#111111]' ? 'text-white/60' : 'text-[#111111]')}>
                  {s.title}
                </p>
              </div>
              <h3 className={cn("text-5xl font-black leading-none mb-1 tabular-nums", s.textColor)}>{s.value}</h3>
              <p className={cn("text-[10px] font-black uppercase italic tracking-widest", s.subtextColor)}>{s.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Protocol Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          {/* Audit Integrity Matrix */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden flex-1 flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Audit <span className="text-lime-500">Integrity Matrix</span></h3>
                <Badge className="bg-[#111111] text-lime-400 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl">Live Sync: Active</Badge>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50 flex-1">
                <Table>
                  <TableHeader className="bg-[#FAFBFC]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic">Hostel Node</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic">Ledger Value</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Protocol Sync</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Compliance</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic text-right">Last Check</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(auditMatrix || []).map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-[#F9FAFB] transition-colors group border-b border-[#F0F0F0]/50 last:border-0 h-[64px]">
                        <TableCell className="py-4 px-6 text-xs font-black text-[#111111] uppercase tracking-tight">{row.node}</TableCell>
                        <TableCell className="py-4 text-xs font-black text-[#555555] opacity-70 tracking-tighter tabular-nums">{row.value}</TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge 
                            className={cn(
                              "rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                              row.sync === 'Synced' ? "bg-lime-500/15 text-lime-700" : 
                              row.sync === 'Attention' ? "bg-red-500/15 text-red-700" : 
                              "bg-amber-500/15 text-amber-700"
                            )}
                          >
                            {row.sync}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#111111] italic">{row.compliance}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right text-[10px] font-bold text-[#919191] italic tracking-tighter tabular-nums">{row.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col">
          {/* Compliance Summary Radial Bar Chart */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden flex-1">
            <div className="p-8 pb-4">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Audit <span className="text-lime-500">Breakdown</span></h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Regional Verification Distribution</p>
            </div>
            
            <div className="h-[260px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="30%" 
                  outerRadius="100%" 
                  barSize={10} 
                  data={auditPieData}
                  startAngle={180}
                  endAngle={-180}
                >
                  <RadialBar
                    background={{ fill: 'rgba(255,255,255,0.05)' }}
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 8, fontWeight: 900 }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: '#D4FF3F', color: '#111111', fontSize: '10px', fontWeight: 900 }}
                    itemStyle={{ color: '#111111' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="px-8 pb-8 space-y-2 mt-4">
              {auditPieData.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.fill }} />
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{s.name}</span>
                  </div>
                  <span className="text-[9px] font-black text-white italic">{s.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Protocol Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          {/* Synchronized Revenue Pulse Hub */}
          <Card className="border-none shadow-2xl shadow-lime-500/10 bg-[#111111] rounded-[2.5rem] overflow-hidden flex flex-col h-[400px]">
             <div className="p-8 pb-0">
               <div className="flex justify-between items-start">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic">Revenue Pulse Trend</p>
                   <div className="flex items-center gap-4">
                     <h2 className="text-4xl font-black text-white tracking-tighter tabular-nums">CFA 2,410,854</h2>
                     <Badge className="bg-lime-500/15 text-lime-400 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
                       +12.5%
                     </Badge>
                   </div>
                 </div>
                 <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/70 font-black text-[9px] uppercase tracking-widest h-10 px-4 flex items-center gap-2 hover:bg-white/10">
                   THIS YEAR <ChevronRight className="h-3 w-3 rotate-90" />
                 </Button>
               </div>
             </div>
             
             <div className="flex-1 mt-6 px-4 pb-6 -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenuePulseData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorPulseSync" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#D4FF3F" stopOpacity={0.6}/>
                       <stop offset="95%" stopColor="#D4FF3F" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                   <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} 
                    dy={12}
                    padding={{ left: 20, right: 20 }}
                   />
                   <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }}
                    tickFormatter={(val) => `CFA ${val/1000000}M`}
                    width={60}
                    domain={['dataMin - 500000', 'dataMax + 200000']}
                   />
                   <Tooltip 
                     cursor={{ stroke: '#D4FF3F', strokeWidth: 1, strokeDasharray: '4 4' }}
                     content={({ active, payload, label }: any) => {
                       if (active && payload && payload.length) {
                         return (
                           <div className="bg-[#111111] p-4 rounded-2xl shadow-2xl border border-white/10">
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{label}, 2026</p>
                             <div className="flex items-center gap-2">
                               <div className="h-2 w-2 rounded-full bg-lime-400" />
                               <p className="text-sm font-black text-white uppercase italic">Verified: <span className="text-lime-400">CFA {payload[0].value.toLocaleString()}</span></p>
                             </div>
                           </div>
                         );
                       }
                       return null;
                     }}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="verified" 
                     stroke="#D4FF3F" 
                     strokeWidth={5} 
                     fillOpacity={1} 
                     fill="url(#colorPulseSync)"
                     activeDot={{ r: 8, fill: '#111111', stroke: '#D4FF3F', strokeWidth: 4 }}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col">
          {/* Verification Protocols checklist */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden flex-1 flex flex-col h-[400px]">
             <div className="p-8 flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <ShieldCheck className="h-32 w-32 text-[#111111]" />
                </div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight mb-6 z-10">Verification <span className="text-lime-500">Protocols</span></h3>
                <div className="flex-1 space-y-4 z-10 flex flex-col justify-center">
                  {auditProtocols.map((protocol, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-[#F0F0F0] flex items-center justify-between group hover:border-lime-400 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-[#F0F0F0] pr-4">
                            <span className="text-[10px] font-black text-[#111111] tracking-tighter uppercase">{protocol.time}</span>
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black text-[#111111] uppercase tracking-tight">{protocol.title}</h4>
                            <p className="text-[8px] font-black text-lime-600 uppercase tracking-[0.2em] mt-0.5">{protocol.type}</p>
                          </div>
                       </div>
                       <div className="h-6 w-6 rounded-full border-2 border-[#F0F0F0] group-hover:border-lime-500 group-hover:bg-lime-500/10 flex items-center justify-center transition-all">
                          <CheckCircle className="h-3 w-3 text-lime-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-8 bg-[#111111] hover:bg-black text-white font-black uppercase tracking-widest border-none rounded-2xl h-14 text-xs transition-transform hover:-translate-y-1 z-10 shadow-lg shadow-black/10"
                  onClick={() => {
                    setProcessTitle("Protocol Execution");
                    setProcessMessage("Synchronizing operational nodes with central command...");
                    setIsProcessOpen(true);
                  }}
                >
                  Execute Protocol Batch
                </Button>
            </div>
          </Card>
        </div>
      </div>
      <ExportAnalyticsModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
      <SystemProcessOverlay 
        isOpen={isProcessOpen} 
        onClose={() => setIsProcessOpen(false)} 
        title={processTitle} 
        message={processMessage} 
      />
    </div>
  );
}

function FinanceDashboard({ stats, revenueData, recentActivity, isLoading }: any) {
  const { navigate } = useNavigation();
  const [timeframe, setTimeframe] = useState<'6M' | '1Y' | 'ALL'>('6M');
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState('');
  const [processMessage, setProcessMessage] = useState('');

  const filteredRevenueData = revenueData;

  const financeKPIs = [
    { label: 'Gross Revenue Pulse', value: stats ? `CFA ${(stats.revenue / 1000).toFixed(0)}k` : '...', icon: DollarSign, color: 'text-lime-500', bg: 'bg-lime-500/10', trend: stats ? `${stats.growth}%` : '...', status: 'optimal' },
    { label: 'Collection Velocity', value: '82.4%', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Target: 85%', status: 'optimal' },
    { label: 'Delinquency Depth', value: 'CFA 480k', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'Critical', status: 'critical' },
    { label: 'Active Invoices', value: stats ? stats.complaints.toString() : '...', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Audit', status: 'warning' },
  ];

  const pendingSettlements = (recentActivity || [])
    .filter((a: any) => a.type === 'payment' && a.status !== 'paid')
    .slice(0, 4)
    .map((p: any) => ({
      name: p.title.replace('Payment from ', ''),
      id: p.id.slice(0, 8).toUpperCase(),
      balance: `CFA ${p.amount}`,
      status: 'Pending',
      since: new Date(p.date).toLocaleDateString()
    }));

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500 pb-10">
      {/* Finance Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">Fiscal <span className="text-lime-500">Command</span></h1>
          <p className="text-sm font-medium text-[#919191]">Forensic financial oversight and revenue telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-2xl border-[#111111] border-2 font-black text-[10px] uppercase tracking-widest h-12 px-6 group hover:bg-[#111111] hover:text-white transition-all"
            onClick={() => navigate('attendance')}
          >
            Finance Roster <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1" />
          </Button>
          <Button 
            className="rounded-2xl bg-black hover:bg-black/90 text-white font-black h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none"
            onClick={() => {
              setProcessTitle("Invoice Generation");
              setProcessMessage("Dispatching digital artifacts to student nodes...");
              setIsProcessOpen(true);
            }}
          >
            <Plus className="mr-2 h-5 w-5 text-lime-400" />
            Dispatch Invoice
          </Button>
        </div>
      </div>

      {/* Finance KPI Suite */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {financeKPIs.map((s, i) => (
          <Card key={i} className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2rem] overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
                <Badge className={cn(
                  "border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                  s.status === 'critical' ? "bg-rose-500 text-white" : s.status === 'warning' ? "bg-amber-500 text-black" : "bg-[#111111] text-lime-400"
                )}>
                  {s.trend}
                </Badge>
              </div>
              <h3 className="text-3xl font-black text-[#111111] tracking-tighter tabular-nums mb-1">{s.value}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#919191] italic">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Fiscal Inflow Stream */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 pb-0">
               <div className="flex justify-between items-center">
                 <div>
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Fiscal <span className="text-lime-500">Inflow Stream</span></h3>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 italic">Quarterly collection variance per sector</p>
                 </div>
                 <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl">
                    {(['6M', '1Y', 'ALL'] as const).map(t => (
                      <button 
                        key={t} 
                        onClick={() => setTimeframe(t)}
                        className={cn(
                          "px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", 
                          timeframe === t ? "bg-lime-500 text-black shadow-lg shadow-lime-500/20" : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
               </div>
            </CardHeader>
            <div className="h-[320px] w-full mt-8 px-4">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={filteredRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHostelBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4FF3F" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#D4FF3F" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} dy={15} />
                    <YAxis tickFormatter={v => `CFA ${v}k`} axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} />
                    <Tooltip 
                      cursor={{ stroke: 'rgba(212, 255, 63, 0.1)', strokeWidth: 40 }}
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          const total = payload.reduce((acc: number, curr: any) => acc + curr.value, 0);
                          return (
                            <div className="bg-[#111111]/90 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white/10 min-w-[200px] animate-in zoom-in-95 duration-200">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                                <span>{label} 2026</span>
                                <span className="text-lime-400">Live Sync</span>
                              </p>
                              <div className="space-y-3">
                                {payload.map((entry: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                      <div className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(212,255,63,0.5)]" style={{ backgroundColor: entry.color }} />
                                      <span className="text-[11px] font-black text-white uppercase tracking-tight">{entry.name === 'hostel' ? 'Hostel Node' : 'Mess Cluster'}</span>
                                    </div>
                                    <span className="text-sm font-black text-white tabular-nums tracking-tighter">CFA {entry.value.toLocaleString()}k</span>
                                  </div>
                                ))}
                                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                                  <span className="text-[10px] font-black text-lime-500 uppercase italic">Total Inflow</span>
                                  <span className="text-lg font-black text-white tabular-nums tracking-tighter">CFA {total.toLocaleString()}k</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hostel" fill="url(#colorHostelBar)" radius={[10, 10, 0, 0]} barSize={30} />
                    <Line type="monotone" dataKey="mess" stroke="#3B82F6" strokeWidth={5} dot={{ r: 6, fill: '#111111', stroke: '#3B82F6', strokeWidth: 3 }} activeDot={{ r: 8, fill: '#3B82F6' }} />
                 </ComposedChart>
               </ResponsiveContainer>
            </div>
            <div className="p-8 flex items-center gap-8">
               <div className="flex items-center gap-3">
                 <div className="h-3 w-3 rounded-full bg-lime-500" />
                 <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Hostel Node</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="h-3 w-3 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Mess Cluster</span>
               </div>
            </div>
          </Card>

          {/* Departmental Payouts */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[3rem] overflow-hidden">
             <div className="p-8 border-b border-[#F0F0F0]/50 flex items-center justify-between bg-[#FAFBFC]/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                    <Activity className="h-5 w-5 text-lime-400" />
                  </div>
                  <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Departmental <span className="text-lime-500">Expenditure</span></h3>
                </div>
                <Button variant="ghost" className="rounded-xl h-10 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-white">
                  Full Ledger <ChevronRight className="h-4 w-4 text-lime-500" />
                </Button>
             </div>
             <div className="p-8">
                <div className="h-[280px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentalBudgetData} layout="vertical">
                         <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                         <XAxis type="number" hide />
                         <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{ fill: '#111111', fontSize: 10, fontWeight: 900 }} width={100} />
                         <Tooltip 
                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                            content={({ active, payload, label }: any) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const utilization = ((data.spent / data.allocated) * 100).toFixed(1);
                                return (
                                  <div className="bg-white p-5 rounded-[2rem] shadow-2xl border border-[#F0F0F0] min-w-[220px] animate-in slide-in-from-left-2 duration-200">
                                    <h4 className="text-[12px] font-black text-[#111111] uppercase italic mb-4 border-b border-[#F0F0F0] pb-2">{label} Sector</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-[#919191] uppercase tracking-widest">Allocated</span>
                                        <span className="text-sm font-black text-[#111111] tabular-nums tracking-tighter">CFA {data.allocated.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                          <div className="h-2 w-2 rounded-full bg-lime-500" />
                                          <span className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Spent</span>
                                        </div>
                                        <span className="text-sm font-black text-lime-600 tabular-nums tracking-tighter">CFA {data.spent.toLocaleString()}</span>
                                      </div>
                                      <div className="pt-3 mt-3 border-t border-[#F0F0F0] flex items-center justify-between">
                                        <span className="text-[9px] font-black text-[#111111] uppercase italic">Utilization</span>
                                        <Badge className="bg-[#111111] text-lime-400 border-none font-black text-[10px] px-2 py-0.5 rounded-lg">{utilization}%</Badge>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                         />
                         <Bar dataKey="spent" radius={[0, 10, 10, 0]} barSize={20}>
                           {departmentalBudgetData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Bar>
                         <Bar dataKey="allocated" fill="#f0f0f0" radius={[0, 10, 10, 0]} barSize={20} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Fiscal Event Log */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[3rem] overflow-hidden">
             <CardHeader className="p-8">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Fiscal <span className="text-lime-500 italic">Pulse Log</span></h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Real-time settlement sync</p>
             </CardHeader>
             <CardContent className="p-6 pt-0 space-y-6">
                {fiscalEventLog.map((event, i) => (
                  <div key={i} className="flex gap-4 relative">
                     {i !== fiscalEventLog.length - 1 && <div className="absolute left-[7px] top-6 bottom-[-24px] w-px bg-white/10" />}
                     <div className="h-4 w-4 rounded-full border-2 border-lime-500/20 bg-[#111111] flex items-center justify-center z-10">
                        <div className={cn("h-1.5 w-1.5 rounded-full", event.status === 'verified' ? 'bg-lime-500' : event.status === 'flagged' ? 'bg-rose-500' : 'bg-amber-500')} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{event.student}</p>
                           <span className="text-[9px] font-black text-lime-400 tabular-nums">CFA {event.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{event.type} • {event.method}</p>
                        <p className="text-[8px] font-bold text-white/30 mt-1 italic">{event.time}</p>
                     </div>
                  </div>
                ))}
             </CardContent>
          </Card>

          {/* Pending Settlements Registry */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[3rem] overflow-hidden">
             <div className="p-8 flex items-center justify-between border-b border-[#F0F0F0]">
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Active <span className="text-rose-500">Debtors</span></h3>
                <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Top 4 Risk</Badge>
             </div>
             <CardContent className="p-6 space-y-4">
                {(pendingSettlements || []).map((debtor: any, i: number) => (
                  <div key={i} className="p-4 bg-[#FAFBFC] rounded-2xl border border-[#F0F0F0] hover:border-rose-300 transition-all group">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <h4 className="text-xs font-black text-[#111111] uppercase italic tracking-tight">{debtor.name}</h4>
                           <p className="text-[9px] font-bold text-[#919191] uppercase tracking-widest">{debtor.id}</p>
                        </div>
                        <Badge className={cn("text-[8px] font-black px-2 py-0.5 rounded-md border-none", debtor.status === 'Overdue' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black')}>
                           {debtor.status.toUpperCase()}
                        </Badge>
                     </div>
                     <div className="flex justify-between items-end">
                        <span className="text-xl font-black text-[#111111] tabular-nums tracking-tighter">{debtor.balance}</span>
                        <span className="text-[9px] font-bold text-[#919191] uppercase italic">Since: {debtor.since}</span>
                     </div>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest h-12 rounded-2xl group"
                  onClick={() => {
                    setProcessTitle("Delinquency Protocol");
                    setProcessMessage("Broadcasting final notices to high-risk debtors...");
                    setIsProcessOpen(true);
                  }}
                >
                   Dispatch Final Notices <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
      <SystemProcessOverlay 
        isOpen={isProcessOpen} 
        onClose={() => setIsProcessOpen(false)} 
        title={processTitle} 
        message={processMessage} 
      />
    </div>
  );
}

function MaintenanceDashboard({ stats, maintenanceStats, recentActivity, isLoading }: any) {
  const { navigate } = useNavigation();
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState('');
  const [processMessage, setProcessMessage] = useState('');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  const operationsStats = [
    { 
      title: 'Active Work Orders', 
      value: maintenanceStats ? maintenanceStats.activeWorkOrders.toString() : '...', 
      subtext: 'In progress or assigned', 
      icon: <Wrench className="h-6 w-6 text-lime-400" />,
      cardColor: "bg-gradient-to-br from-[#111111] to-[#222222]",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-white/10 backdrop-blur-md",
      textColor: "text-white",
      subtextColor: "text-white/40",
      watermark: <Wrench className="h-24 w-24 text-white" />
    },
    { 
      title: 'Critical Issues', 
      value: '2', 
      subtext: 'Requires immediate action', 
      icon: <AlertCircle className="h-6 w-6 text-rose-500" />,
      cardColor: "bg-rose-50 border border-rose-100",
      shadow: "shadow-2xl shadow-rose-500/5",
      iconBoxBg: "bg-white shadow-sm",
      textColor: "text-rose-900",
      subtextColor: "text-rose-600",
      watermark: <AlertCircle className="h-24 w-24 text-rose-500" />
    },
    { 
      title: 'Avg. Resolution Time', 
      value: '2.4', 
      subtext: 'Hours per incident', 
      icon: <Clock className="h-6 w-6 text-[#111111]" />,
      cardColor: "bg-white border border-[#F0F0F0]",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-[#FAFBFC] border border-[#F0F0F0]",
      textColor: "text-[#111111]",
      subtextColor: "text-[#919191]",
      watermark: <Activity className="h-24 w-24 text-black" />
    },
    { 
      title: 'Inventory Alerts', 
      value: '5', 
      subtext: 'Low stock items detected', 
      icon: <Package className="h-6 w-6 text-amber-500" />,
      cardColor: "bg-amber-50 border border-amber-100",
      shadow: "shadow-2xl shadow-amber-500/5",
      iconBoxBg: "bg-white shadow-sm",
      textColor: "text-amber-900",
      subtextColor: "text-amber-600",
      watermark: <Package className="h-24 w-24 text-amber-500" />
    },
  ];

  const maintenanceTasks = (recentActivity || [])
    .filter((a: any) => a.type === 'complaint')
    .slice(0, 4)
    .map((c: any) => ({
      title: c.title,
      location: 'Block A - 204', 
      priority: 'Medium',
      time: new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: c.status,
      type: 'General'
    }));

  const crewRoster = [
    { name: 'Alpha Squad', members: 4, specialty: 'Electrical', active: true },
    { name: 'Beta Plumbers', members: 3, specialty: 'Plumbing', active: true },
    { name: 'Gamma HVAC', members: 2, specialty: 'HVAC/Cooling', active: false },
    { name: 'Delta General', members: 5, specialty: 'Carpentry', active: true },
  ];

  const issueTrendData = [
    { name: 'Mon', new: 12, resolved: 15 },
    { name: 'Tue', new: 8, resolved: 10 },
    { name: 'Wed', new: 18, resolved: 12 },
    { name: 'Thu', new: 5, resolved: 18 },
    { name: 'Fri', new: 14, resolved: 10 },
    { name: 'Sat', new: 22, resolved: 8 },
    { name: 'Sun', new: 4, resolved: 20 },
  ];

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500 pb-10 bg-[#F9FAFB]/50">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">Maintenance <span className="text-lime-500">Terminal</span></h1>
          <p className="text-sm font-medium text-[#919191]">Infrastructure issue tracking and resolution nexus.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-2xl border-lime-500/20 bg-white hover:bg-lime-50 text-[#111111] font-black h-12 px-6 transition-all shadow-lg shadow-black/5 uppercase tracking-widest text-[10px]"
            onClick={() => {
              setProcessTitle("Inventory Audit");
              setProcessMessage("Synchronizing supply nodes with central logistics...");
              setIsProcessOpen(true);
            }}
          >
            <Package className="mr-2 h-5 w-5 text-lime-500" />
            Check Inventory
          </Button>
          <Button 
            className="rounded-2xl bg-black hover:bg-black/90 text-white font-bold h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none"
            onClick={() => setIsComplaintModalOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5 text-lime-400" />
            Work Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {operationsStats.map((s, i) => (
          <Card key={i} className={cn("border-none rounded-[2rem] overflow-hidden group", s.cardColor, s.shadow)}>
            <CardContent className="p-6 relative h-[160px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                {s.watermark}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-black/5", s.iconBoxBg)}>
                  {s.icon}
                </div>
                <p className={cn("text-xs font-black uppercase tracking-widest", s.title === 'Active Work Orders' ? 'text-white/60 text-[10px]' : s.textColor)}>
                  {s.title}
                </p>
              </div>
              <h3 className={cn("text-5xl font-black leading-none mb-1 tabular-nums", s.textColor)}>{s.value}</h3>
              <p className={cn("text-[9px] font-bold uppercase italic", s.subtextColor)}>{s.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Work Orders Matrix */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden flex-1">
            <div className="p-8 pb-4 flex items-center justify-between border-b border-[#F0F0F0]/50 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-lime-400" />
                </div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Active <span className="text-lime-500">Work Orders</span></h3>
              </div>
              <Button 
                variant="ghost" 
                className="text-xs font-black text-[#111111] uppercase tracking-widest hover:bg-[#F0F0F0] rounded-xl flex items-center"
                onClick={() => navigate('complaints')}
              >
                Open Dispatch <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="p-0">
              <Table>
                <TableHeader className="bg-[#FAFBFC]">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-black text-[#111111] h-14 pl-8 text-[10px] uppercase tracking-widest italic col-span-2">Task</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Priority</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Assigned</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 pr-8 text-[10px] uppercase tracking-widest italic text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {(maintenanceTasks || []).map((task: any, i: number) => (
                    <TableRow key={i} className="hover:bg-lime-50/30 transition-colors group border-b border-[#F0F0F0]/50 last:border-0 h-20">
                      <TableCell className="pl-8">
                        <div>
                          <p className="font-black text-sm text-[#111111] uppercase italic tracking-tight">{task.title}</p>
                          <p className="text-[10px] font-bold text-[#919191] mt-1 uppercase tracking-widest">{task.location}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("border-none font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest", 
                          task.priority === 'High' ? 'bg-rose-500/10 text-rose-700' : 
                          task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-700' : 'bg-[#F0F0F0] text-[#555555]'
                        )}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-[#111111]/5 text-[#111111] border border-black/5 font-black text-[9px] px-3 py-1 rounded-lg">
                          {task.type} Unit
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl hover:bg-lime-500 hover:text-black hover:shadow-lg transition-all group-hover:bg-[#111111] group-hover:text-lime-400"
                          onClick={() => {
                            toast.success("Dispatch Acknowledged", {
                              description: `Task "${task.title}" has been added to your active field queue.`,
                            });
                          }}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-[#F9FAFB] border-t border-[#F0F0F0]/50 flex justify-center">
              <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-[#919191] hover:text-[#111111]">+ 12 More Pending Operations</Button>
            </div>
          </Card>

          {/* Performance Trend Chart */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden flex-1">
             <div className="p-8 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Resolution <span className="text-lime-500">Velocity</span></h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">New vs Resolved Issues (7-Day Pull)</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lime-500" />
                    <span className="text-[9px] font-black uppercase text-white/60">Resolved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[9px] font-black uppercase text-white/60">Reported</span>
                  </div>
                </div>
             </div>
             
             <div className="h-[260px] w-full px-6 mt-4 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={issueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#ffffff40', fontSize: 10, fontWeight: 900}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#ffffff40', fontSize: 10, fontWeight: 900}} dx={-10} />
                    <Tooltip 
                      cursor={{fill: '#ffffff05'}}
                      contentStyle={{backgroundColor: '#111111', borderRadius: '16px', border: '1px solid #ffffff10'}}
                      itemStyle={{fontSize: '12px', fontWeight: 900}}
                    />
                    <Bar dataKey="resolved" fill="#D4FF3F" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Line type="monotone" dataKey="new" stroke="#F43F5E" strokeWidth={3} dot={{r: 4, fill: '#F43F5E', stroke: '#111111', strokeWidth: 2}} />
                  </ComposedChart>
                </ResponsiveContainer>
             </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Active Teams */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-white border border-[#F0F0F0] rounded-[2.5rem] overflow-hidden flex-1">
            <CardHeader className="p-8 border-b border-[#F0F0F0]/50 bg-[#FAFBFC]">
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tighter">Tactical <span className="text-lime-500">Units</span></h3>
              <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Crew deployment status.</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
              {crewRoster.map((crew, i) => (
                <div key={i} className="flex flex-col p-4 bg-[#F9FAFB] rounded-2xl border border-[#F0F0F0] group hover:border-[#111111] transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shadow-sm", crew.active ? 'bg-[#111111]' : 'bg-[#E5E5E5]')}>
                        <Users className={cn("h-4 w-4", crew.active ? 'text-lime-400' : 'text-[#919191]')} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#111111] uppercase uppercase tracking-tight">{crew.name}</p>
                        <p className="text-[9px] font-bold text-[#919191] tracking-widest">{crew.members} Operatives • {crew.specialty}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("border-none text-[8px] font-black uppercase tracking-widest", crew.active ? 'bg-lime-500 text-black' : 'bg-[#E5E5E5] text-[#919191]')}>
                      {crew.active ? 'Deployed' : 'Standby'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Action Hub */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden text-center relative p-8 group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-500">
               <ShieldAlert className="h-32 w-32 text-white" />
             </div>
             <div className="h-16 w-16 mx-auto bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-center mb-6">
               <AlertOctagon className="h-8 w-8 text-white" />
             </div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Emergency Override</h3>
             <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-8 leading-relaxed">
               Bypass standard request protocols and signal Immediate Infrastructure Failure to Admin Node.
             </p>
             <Button className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 transition-all rounded-2xl border-none">
               Trigger Protocol Zero
             </Button>
          </Card>
        </div>
      </div>
      <LogComplaintModal 
        isOpen={isComplaintModalOpen} 
        onClose={() => setIsComplaintModalOpen(false)} 
        onSuccess={() => {
          setIsComplaintModalOpen(false);
          toast.success("Work Order Registered", {
            description: "System node updated via Maintenance Terminal."
          });
        }}
      />
      <SystemProcessOverlay 
        isOpen={isProcessOpen} 
        onClose={() => setIsProcessOpen(false)} 
        title={processTitle} 
        message={processMessage} 
      />
    </div>
  );
}

function SecurityDashboard({ stats, securityStats: securityLiveData, visitorLogs, recentActivity, isLoading }: any) {
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState('');
  const [processMessage, setProcessMessage] = useState('');
  const [isIncidentSheetOpen, setIsIncidentSheetOpen] = useState(false);

  const securityKPIs = [
    { 
      title: 'Active Gate Passes', 
      value: securityLiveData ? securityLiveData.activeVisitors.toString() : '...', 
      subtext: 'Visitors currently on premises', 
      icon: <UserCheck className="h-6 w-6 text-lime-400" />,
      cardColor: "bg-gradient-to-br from-[#111111] to-[#222222]",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-white/10 backdrop-blur-md",
      textColor: "text-white",
      subtextColor: "text-white/40",
      watermark: <UserCheck className="h-24 w-24 text-white" />
    },
    { 
      title: 'Gate Exceptions', 
      value: '3', 
      subtext: 'Denied entry or overstay', 
      icon: <UserX className="h-6 w-6 text-rose-500" />,
      cardColor: "bg-rose-50 border border-rose-100",
      shadow: "shadow-2xl shadow-rose-500/5",
      iconBoxBg: "bg-white shadow-sm",
      textColor: "text-rose-900",
      subtextColor: "text-rose-600",
      watermark: <UserX className="h-24 w-24 text-rose-500" />
    },
    { 
      title: 'Active Patrols', 
      value: '4 Units', 
      subtext: 'Covering Zones A, C & Perimeter', 
      icon: <Radio className="h-6 w-6 text-[#111111]" />,
      cardColor: "bg-white border border-[#F0F0F0]",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-[#FAFBFC] border border-[#F0F0F0]",
      textColor: "text-[#111111]",
      subtextColor: "text-[#919191]",
      watermark: <ShieldCheck className="h-24 w-24 text-black" />
    },
    { 
      title: 'Total Scans Today', 
      value: '142', 
      subtext: 'Identities authenticated', 
      icon: <Users2 className="h-6 w-6 text-lime-600" />,
      cardColor: "bg-lime-50 border border-lime-100",
      shadow: "shadow-2xl shadow-lime-500/5",
      iconBoxBg: "bg-white shadow-sm",
      textColor: "text-lime-900",
      subtextColor: "text-lime-700",
      watermark: <Users2 className="h-24 w-24 text-lime-500" />
    },
  ];

  const recentAccessLogs = (visitorLogs || []).map((v: any) => ({
    name: v.full_name,
    type: v.visit_purpose,
    time: new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    gate: 'Main North',
    status: v.check_out_time ? 'Cleared' : 'On-Site'
  }));

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500 pb-10 bg-[#F9FAFB]/50">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">Security <span className="text-lime-500">Terminal</span></h1>
          <p className="text-sm font-medium text-[#919191]">Campus perimeter and access control oversight.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-2xl border-rose-500/20 bg-white hover:bg-rose-50 text-rose-600 font-black h-12 px-6 transition-all shadow-lg shadow-rose-500/5 uppercase tracking-widest text-[10px]"
            onClick={() => setIsIncidentSheetOpen(true)}
          >
            <AlertCircle className="mr-2 h-5 w-5 text-rose-500" />
            Log Incident
          </Button>
          <Button 
            className="rounded-2xl bg-black hover:bg-black/90 text-white font-bold h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none"
            onClick={() => {
              setProcessTitle("ID Verification");
              setProcessMessage("Cross-referencing biometric nodes with identity database...");
              setIsProcessOpen(true);
            }}
          >
            <UserCheck className="mr-2 h-5 w-5 text-lime-400" />
            Verify ID Pass
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityKPIs.map((s: any, i: any) => (
          <Card key={i} className={cn("border-none rounded-[2rem] overflow-hidden group", s.cardColor, s.shadow)}>
            <CardContent className="p-6 relative h-[160px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                {s.watermark}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-black/5", s.iconBoxBg)}>
                  {s.icon}
                </div>
                <p className={cn("text-xs font-black uppercase tracking-widest", s.title === 'Active Gate Passes' ? 'text-white/60 text-[10px]' : s.textColor)}>
                  {s.title}
                </p>
              </div>
              <h3 className={cn("text-5xl font-black leading-none mb-1 tabular-nums", s.textColor)}>{s.value}</h3>
              <p className={cn("text-[9px] font-bold uppercase italic", s.subtextColor)}>{s.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Live Access Matrix */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden flex-1">
            <div className="p-8 pb-4 flex items-center justify-between border-b border-[#F0F0F0]/50 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-lime-400" />
                </div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Live <span className="text-lime-500">Access Matrix</span></h3>
              </div>
              <Button variant="ghost" className="text-xs font-black text-[#111111] uppercase tracking-widest hover:bg-[#F0F0F0] rounded-xl flex items-center">Full Log <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
            
            <div className="p-0">
              <Table>
                <TableHeader className="bg-[#FAFBFC]">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-black text-[#111111] h-14 pl-8 text-[10px] uppercase tracking-widest italic col-span-2">Visitor / Entity</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Type</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Entry Node</TableHead>
                    <TableHead className="font-black text-[#111111] h-14 pr-8 text-[10px] uppercase tracking-widest italic text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {recentAccessLogs.map((log: any, i: number) => (
                    <TableRow key={i} className="hover:bg-lime-50/30 transition-colors group border-b border-[#F0F0F0]/50 last:border-0 h-20">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", log.status === 'Denied' ? 'bg-rose-100 text-rose-600' : 'bg-[#F0F0F0] text-[#111111]')}>
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-black text-sm text-[#111111] uppercase italic tracking-tight">{log.name}</p>
                            <p className="text-[10px] font-bold text-[#919191] mt-0.5 uppercase tracking-widest">{log.time}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-[#111111]/5 text-[#111111] border border-black/5 font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest">
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-[10px] font-black uppercase text-[#555555] italic">{log.gate}</span>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                         <Badge className={cn("border-none font-black text-[9px] px-4 py-1.5 rounded-lg uppercase tracking-widest", 
                          log.status === 'Cleared' ? 'bg-lime-500/20 text-lime-800' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        )}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-[#F9FAFB] border-t border-[#F0F0F0]/50 flex justify-center">
              <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-[#919191] hover:text-[#111111]">+ View Historical Register</Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Action Hub */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Action Hub - Emergency */}
          <Card className="border-none shadow-2xl shadow-black/5 bg-rose-600 rounded-[2.5rem] overflow-hidden text-center relative p-8 group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
               <ShieldAlert className="h-32 w-32 text-black" />
             </div>
             <div className="h-16 w-16 mx-auto bg-black rounded-2xl shadow-lg shadow-black/20 flex items-center justify-center mb-6 relative z-10">
               <AlertOctagon className="h-8 w-8 text-rose-500" />
             </div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2 relative z-10">Lockdown Override</h3>
             <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-8 leading-relaxed relative z-10">
               Seal all mechanical perimeter gates and broadcast Level-5 hazard alert to Admin nodes.
             </p>
             <Button 
               className="w-full h-14 bg-black hover:bg-black/80 text-rose-500 font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 transition-all rounded-2xl border-none relative z-10"
               onClick={() => {
                 setProcessTitle("Lockdown Protocol");
                 setProcessMessage("Sealing perimeter gates and broadcasting hazard alerts...");
                 setIsProcessOpen(true);
               }}
             >
               Initiate Protocols
             </Button>
          </Card>
        </div>
      </div>
      <LogIncidentSheet 
        isOpen={isIncidentSheetOpen} 
        onClose={() => setIsIncidentSheetOpen(false)} 
      />
      <SystemProcessOverlay 
        isOpen={isProcessOpen} 
        onClose={() => setIsProcessOpen(false)} 
        title={processTitle} 
        message={processMessage} 
      />
    </div>
  );
}


// --- System Process Overlay ---
function SystemProcessOverlay({ isOpen, onClose, title, message }: { isOpen: boolean, onClose: () => void, title: string, message: string }) {
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
          return p + Math.floor(Math.random() * 10) + 2;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="relative mx-auto h-32 w-32">
           <svg className="h-full w-full -rotate-90">
             <circle
               cx="64"
               cy="64"
               r="60"
               stroke="currentColor"
               strokeWidth="8"
               fill="transparent"
               className="text-white/5"
             />
             <circle
               cx="64"
               cy="64"
               r="60"
               stroke="currentColor"
               strokeWidth="8"
               fill="transparent"
               strokeDasharray={377}
               strokeDashoffset={377 - (377 * progress) / 100}
               className="text-lime-500 transition-all duration-300 ease-out"
             />
           </svg>
           <div className="absolute inset-0 flex items-center justify-center">
              {isComplete ? <CheckCircle2 className="h-12 w-12 text-lime-500 animate-in zoom-in duration-300" /> : <RefreshCw className="h-12 w-12 text-white animate-spin-slow" />}
           </div>
        </div>
        
        <div className="space-y-3">
           <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{isComplete ? "Process Sealed" : "Synchronizing..."}</h3>
           <div className="space-y-1">
             <p className="text-[10px] font-black text-lime-500 uppercase tracking-[0.3em]">{title}</p>
             <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{message}</p>
           </div>
        </div>

        {isComplete ? (
          <Button onClick={onClose} className="w-full h-14 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-lime-500/20 animate-in slide-in-from-bottom-4 duration-500">
             Clear Protocol
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-lime-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest tabular-nums">{progress}% Complete</p>
          </div>
        )}
      </div>
    </div>
  );
}
