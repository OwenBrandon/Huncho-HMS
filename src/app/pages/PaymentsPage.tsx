import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { 
  Search, Plus, Download, CreditCard, AlertCircle, Wallet, 
  ChevronDown, CheckCircle2, ChevronLeft, ChevronRight,
  FileText, Bell, AlertTriangle, Lock, RefreshCw, History, 
  ExternalLink, MoreVertical, ShieldCheck, Fingerprint,
  Gavel, Zap, FileSearch, ArrowRightLeft, AlertOctagon,
  Landmark, Receipt, Scale, ShieldAlert, Target, Activity,
  UserPlus, ArrowUpRight, ArrowDownLeft, Landmark as Bank,
  X, Trash2, Printer, Eye, Link, 
  Calendar, CreditCard as CardIcon, Server, Cpu
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../components/ui/hover-card';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '../components/ui/sheet';
import { useAuth } from '../contexts/AuthContext';
import { usePayments } from '../hooks/usePayments';
import { supabase } from '../../lib/supabase';
import { cn } from '../components/ui/utils';
import { Payment } from '../types';
import { toast } from 'sonner';

type PaymentTab = 'inflow' | 'requests' | 'ledger' | 'reconciliation';

export function PaymentsPage() {
  const { user } = useAuth();
  const { payments, requisitions, isLoading, createPayment, createRequisition, processRequisition, updatePayment, updateRequisition } = usePayments();
  const [selectedTab, setSelectedTab] = useState<PaymentTab>('inflow');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Tactical Operational State
  const ledgerState = useMemo(() => {
    if (selectedTab === 'inflow') {
      return payments.map(p => ({
        ...p,
        entityName: p.student?.user?.full_name || 'STUDENT',
        studentNode: p.student?.student_id || 'SYSTEM',
        liquidity_impact: 'inflow'
      }));
    }
    if (selectedTab === 'requests') {
      return requisitions.map(r => ({
        ...r,
        entityName: r.requester?.full_name || 'STAFF',
        studentNode: r.category,
        liquidity_impact: 'outflow',
        gl_account: r.category,
        notes: r.justification
      }));
    }
    // Ledger view: Combine both
    const inflows = payments.map(p => ({
      ...p,
      entityName: p.student?.user?.full_name || 'STUDENT',
      studentNode: p.student?.student_id || 'SYSTEM',
      liquidity_impact: 'inflow',
      gl_account: p.payment_type
    }));
    const outflows = requisitions.map(r => ({
      ...r,
      entityName: r.requester?.full_name || 'STAFF',
      studentNode: r.category,
      liquidity_impact: 'outflow',
      gl_account: r.category,
      notes: r.justification
    }));
    return [...inflows, ...outflows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [payments, requisitions, selectedTab]);

  // Modal & Wizard Registry
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isProcessOverlayOpen, setIsProcessOverlayOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState("");
  const [processMessage, setProcessMessage] = useState("");

  const filteredData = useMemo(() => {
    return ledgerState.filter((p) => {
      const matchesSearch = (p.entityName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (p.gl_account || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (p.physical_receipt_no || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [ledgerState, searchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Health Metrics
  const liquidCapital = 2240500; 
  const pendingRequestsCount = ledgerState.filter(p => p.authorization_status === 'pending_auth').length;
  const recentInflows = ledgerState.filter(p => p.liquidity_impact === 'inflow' && p.status === 'paid').length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-lime-500/10 text-lime-500';
      case 'pending': return 'bg-amber-500/10 text-amber-500';
      case 'overdue': return 'bg-rose-500/10 text-rose-500';
      case 'approved': return 'bg-blue-500/10 text-blue-500';
      case 'flagged': return 'bg-rose-500/20 text-rose-500 animate-pulse';
      case 'voided': return 'bg-[#111111] text-[#555555]';
      default: return 'bg-white/5 text-white/40';
    }
  };

  if (user?.role === 'student') {
    return <StudentPaymentTerminal />;
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFBFC] md:p-8 p-4 gap-8 animate-in fade-in duration-700 pb-20">
      {/* Tactical Modals & Sheets */}
      <LogPaymentWizard 
        isOpen={activeModal === 'log-payment'} 
        onClose={() => { setActiveModal(null); setWizardStep(1); }} 
        step={wizardStep}
        setStep={setWizardStep}
        onComplete={async (data: any) => {
          await createPayment({
            student_id: data.studentId,
            amount: Number(data.amount),
            payment_type: data.glAccount,
            payment_method: 'cash',
            transaction_id: data.receiptNo,
            status: 'paid',
            due_date: new Date().toISOString().split('T')[0],
            payment_date: new Date().toISOString().split('T')[0]
          });
          setActiveModal(null);
        }}
      />

      <RequisitionProcessModal 
        isOpen={activeModal === 'requisition'} 
        onClose={() => setActiveModal(null)} 
        transaction={selectedTransaction}
        onAction={async (action: 'approve' | 'deny') => {
          await processRequisition(selectedTransaction.id, action === 'approve' ? 'approved' : 'rejected');
          setActiveModal(null);
        }}
      />

      <ForensicSidePanel 
        isOpen={activeModal === 'forensic-details'} 
        onClose={() => setActiveModal(null)} 
        transaction={selectedTransaction} 
      />

      <StatementAuditProtocol 
        isOpen={activeModal === 'statement-audit'}
        onClose={() => setActiveModal(null)}
      />

      <NewRequisitionWizard
        isOpen={activeModal === 'new-requisition'}
        onClose={() => setActiveModal(null)}
        onComplete={async (data: any) => {
          await createRequisition({
            amount: Number(data.amount),
            category: data.glAccount,
            justification: data.notes
          });
          setActiveModal(null);
        }}
      />

      <EditTransactionWizard
        isOpen={activeModal === 'edit-log'}
        onClose={() => { setActiveModal(null); setEditFormData(null); }}
        formData={editFormData}
        onComplete={(updatedData: any) => {
          // Simplified for now, could wire to updatePayment
          toast.success("Entry Updated", { description: "System ledger synchronized." });
        }}
      />

      {/* Header & Offline Telemetry */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#111111] uppercase">
            Fiscal <span className="text-lime-500">Terminal</span>
          </h1>
          <p className="text-sm font-medium text-[#919191]">Manual Inflow Log & Institutional Fund Orchestration.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Card className="border-none bg-[#111111] rounded-2xl shadow-xl shadow-black/10 px-6 py-4 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-lime-400" />
             </div>
             <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Vault Balance</p>
                <h3 className="text-xl font-black text-white tabular-nums">CFA {liquidCapital.toLocaleString()}</h3>
             </div>
          </Card>
          <Card className="border-none bg-white rounded-2xl shadow-xl shadow-black/5 px-6 py-4 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Gavel className="h-5 w-5 text-amber-500" />
             </div>
             <div>
                <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">Pending Requests</p>
                <h3 className="text-xl font-black text-[#111111] tabular-nums">{pendingRequestsCount} Staff Nodes</h3>
             </div>
          </Card>
        </div>
      </div>

      {/* Primary Orchestration Tabs */}
      <div className="flex items-center gap-2 bg-[#F0F0F0] p-1.5 rounded-2xl w-fit">
        {[
          { id: 'inflow', label: 'Inflow Desk', icon: UserPlus, count: recentInflows },
          { id: 'requests', label: 'Request Hub', icon: Gavel, count: pendingRequestsCount },
          { id: 'ledger', label: 'Forensic Ledger', icon: FileSearch, count: null },
          { id: 'reconciliation', label: 'Physical Sync', icon: ArrowRightLeft, count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedTab(tab.id as PaymentTab);
              setCurrentPage(1);
            }}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              selectedTab === tab.id 
                ? "bg-[#111111] text-lime-400 shadow-xl shadow-black/10" 
                : "text-[#919191] hover:text-[#111111] hover:bg-white/50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== null && (
              <span className={cn(
                "ml-2 px-2 py-0.5 rounded-lg text-[10px] tabular-nums",
                selectedTab === tab.id ? "bg-lime-500 text-black" : "bg-white/80 text-[#111111]"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Operational Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919191]" />
          <Input
            placeholder="Search GL accounts, physical receipts, or student nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-16 bg-white border-none shadow-2xl shadow-black/5 rounded-3xl font-black text-sm uppercase tracking-widest focus-visible:ring-lime-500"
          />
        </div>
        <div className="flex gap-3">
          {selectedTab === 'inflow' && (
            <Button onClick={() => setActiveModal('log-payment')} className="h-16 rounded-3xl bg-lime-500 text-black hover:bg-lime-400 shadow-xl shadow-lime-500/20 px-8 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border-none">
              <Plus className="h-5 w-5" /> Log Offline Payment
            </Button>
          )}
          {selectedTab === 'requests' && (
            <Button onClick={() => setActiveModal('new-requisition')} className="h-16 rounded-3xl bg-[#111111] text-white hover:bg-black shadow-xl px-8 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border-none">
              <Activity className="h-5 w-5 text-lime-400" /> New Fund Requisition
            </Button>
          )}
          <Button onClick={() => { setProcessTitle("Batch Data Export"); setIsProcessOverlayOpen(true); }} variant="outline" className="h-16 rounded-3xl border-none bg-white shadow-xl shadow-black/5 px-8 font-black text-[10px] uppercase tracking-widest italic flex items-center gap-3 group">
            <Download className="h-5 w-5 group-hover:translate-y-1 transition-transform" /> Export Batch
          </Button>
        </div>
      </div>

      {/* Module Viewports */}
      <div className="flex-1 min-h-[600px] animate-in slide-in-from-bottom-8 duration-700">
        {selectedTab === 'inflow' && (
          <div className="grid grid-cols-1 gap-8">
            <Card className="border-none rounded-[3rem] bg-white shadow-2xl shadow-black/5 overflow-hidden">
               <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-lime-500 flex items-center justify-center">
                      <ArrowDownLeft className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Manual <span className="text-lime-500">Inflow Desk</span></h3>
                      <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">Recording physical student payments into system ledger.</p>
                    </div>
                  </div>
               </div>
               <div className="p-2 overflow-x-auto">
                 <Table>
                    <TableHeader className="bg-[#FAFBFC]">
                       <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="pl-10 font-black text-[10px] uppercase tracking-widest text-[#919191] h-16">Student Node</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#111111] h-16">Physical Receipt #</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#111111] h-16 text-right">Amount Logged</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#919191] h-16 text-center">Protocol Status</TableHead>
                          <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#919191] h-16 text-center">Verification</TableHead>
                          <TableHead className="pr-10 font-black text-[10px] uppercase tracking-widest h-16 text-right">Actions</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {paginatedData.map((p) => (
                          <TableRow key={p.id} className={cn("group hover:bg-[#FAFBFC] transition-all border-b border-[#F5F5F5]/50 last:border-0", p.status === 'voided' && 'opacity-50 grayscale')}>
                             <TableCell className="pl-10 py-6">
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-[#111111] uppercase tracking-tighter italic">{p.entityName}</span>
                                   <span className="text-[9px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">{p.studentNode}</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className="border-[#F0F0F0] text-[#111111] font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-white">
                                   {p.physical_receipt_no || 'MANUAL-ENTRY'}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right">
                                <span className="text-md font-black tabular-nums tracking-tighter text-lime-600">
                                   +CFA {p.amount.toLocaleString()}
                                </span>
                             </TableCell>
                             <TableCell className="text-center">
                                <Badge className={cn("border-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm", getStatusStyle(p.status))}>
                                   {p.status}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-center">
                                {p.has_digital_receipt ? (
                                   <div className="flex justify-center">
                                     <div className="h-8 w-8 rounded-lg bg-lime-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-4 w-4 text-lime-600" />
                                     </div>
                                   </div>
                                ) : (
                                   <span className="text-[9px] font-black text-rose-500 uppercase italic opacity-40">Scan Required</span>
                                )}
                             </TableCell>
                             <TableCell className="pr-10 text-right">
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-[#111111] hover:text-white transition-all">
                                         <MoreVertical className="h-5 w-5" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-[180px] bg-white rounded-2xl shadow-2xl border border-[#F0F0F0] p-2 animate-in fade-in zoom-in-95 duration-200">
                                      <DropdownMenuLabel className="text-[9px] font-black text-[#919191] uppercase tracking-widest px-2 py-1.5 italic">Tactical Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator className="bg-[#F5F5F5] my-1" />
                                      <DropdownMenuItem 
                                         onClick={() => {
                                            if (p.status === 'paid') return;
                                            updatePayment(p.id, { status: 'paid', payment_date: new Date().toISOString() });
                                            toast.success("Payment Settled", { description: "Institutional ledger updated." });
                                         }}
                                         disabled={p.status === 'paid'}
                                         className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-lime-500 hover:text-black cursor-pointer transition-colors group"
                                      >
                                         <CheckCircle2 className="h-4 w-4 text-lime-600 group-hover:text-black" /> Settle Invoice
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                         onClick={() => { setSelectedTransaction(p); setActiveModal('forensic-details'); }}
                                         className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-lime-50 hover:text-lime-700 cursor-pointer transition-colors group"
                                      >
                                         <FileText className="h-4 w-4 text-[#919191] group-hover:text-lime-500" /> View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                         onClick={() => { setProcessTitle("Receipt Printing"); setIsProcessOverlayOpen(true); }}
                                         className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-lime-50 hover:text-lime-700 cursor-pointer transition-colors group">
                                         <Receipt className="h-4 w-4 text-[#919191] group-hover:text-lime-500" /> Print Receipt
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                         onClick={() => { setEditFormData(p); setActiveModal('edit-log'); }}
                                         className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-lime-50 hover:text-lime-700 cursor-pointer transition-colors group">
                                         <Plus className="h-4 w-4 text-[#919191] group-hover:text-lime-500" /> Edit Entry
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-[#F5F5F5] my-1" />
                                      <DropdownMenuItem 
                                         onClick={() => {
                                            if (p.status === 'voided') return;
                                            updatePayment(p.id, { status: 'voided' });
                                            toast.error("Log Voided", { description: `Physical sync voided for ${p.id}.` });
                                         }}
                                         className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors group">
                                         <AlertOctagon className="h-4 w-4 text-rose-300 group-hover:text-rose-500" /> Void Log
                                      </DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
               </div>
            </Card>
          </div>
        )}

        {selectedTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedData.map((p) => (
              <Card key={p.id} className="border-none rounded-[2.5rem] bg-white shadow-2xl shadow-black/5 overflow-hidden group hover:scale-[1.02] transition-all border border-transparent hover:border-lime-500/20">
                <CardHeader className="p-6 border-b border-[#F5F5F5] bg-[#FAFBFC] flex flex-row items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#111111] flex items-center justify-center">
                         <ArrowUpRight className="h-4 w-4 text-lime-400" />
                      </div>
                      <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Fund Request</p>
                   </div>
                   <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5">{p.status}</Badge>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-[#111111] uppercase italic tracking-tight leading-tight">{p.entityName}</h4>
                        <p className="text-[9px] font-bold text-[#919191] uppercase tracking-widest mt-1 italic">{p.gl_account}</p>
                      </div>
                      <h3 className="text-2xl font-black text-rose-600 tabular-nums tracking-tighter">CFA {p.amount.toLocaleString()}</h3>
                   </div>
                   
                   <div className="p-5 bg-rose-50/30 rounded-2xl mb-8 border border-rose-100/50">
                      <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> Request Justification
                      </p>
                      <p className="text-[11px] font-medium text-[#111111] italic leading-relaxed">"{p.notes}"</p>
                   </div>

                   <div className="flex gap-3">
                      <Button 
                        onClick={() => { setSelectedTransaction(p); setActiveModal('requisition'); }}
                        className="flex-1 bg-[#111111] hover:bg-lime-500 hover:text-black text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-none transition-all shadow-lg active:scale-95"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Disburse
                      </Button>
                      <Button 
                        onClick={() => { setSelectedTransaction(p); setActiveModal('requisition'); }}
                        variant="outline" className="flex-1 border-rose-100 text-rose-600 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" /> Deny Log
                      </Button>
                   </div>
                </CardContent>
              </Card>
            ))}
            {paginatedData.length === 0 && (
              <div className="col-span-full h-80 flex flex-col items-center justify-center bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-dashed border-[#F0F0F0]">
                 <CheckCircle2 className="h-16 w-16 text-lime-400 mb-6 opacity-40 shrink-0" />
                 <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Request Hub Clear</h3>
                 <p className="text-sm font-bold text-[#919191] uppercase tracking-widest mt-2">No pending institutional fund requests found.</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'ledger' && (
          <Card className="border-none rounded-[3rem] bg-white shadow-2xl shadow-black/5 overflow-hidden">
             <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                    <History className="h-5 w-5 text-lime-400" />
                  </div>
                  <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Global <span className="text-lime-500">Forensic Ledger</span></h3>
                </div>
                <div className="flex gap-2">
                   <Badge className="bg-[#111111] text-lime-400 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-black/10">
                      SYSTEM SOURCE OF TRUTH
                   </Badge>
                </div>
             </div>
             <Table>
                <TableHeader className="bg-[#FAFBFC]">
                   <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="pl-10 font-black text-[10px] uppercase tracking-widest text-[#919191] italic h-16">Entity Node / Origin</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#111111] italic h-16">Classification Vector</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#111111] italic h-16 text-right">Fiscal Delta</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#919191] italic h-16 text-center">Protocol</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#919191] h-16 text-center">P-Receipt</TableHead>
                      <TableHead className="pr-10 font-black text-[10px] uppercase tracking-widest italic h-16 text-right">Audit</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {paginatedData.map((p) => (
                      <TableRow key={p.id} className={cn("group hover:bg-[#FAFBFC] transition-all border-b border-[#F5F5F5]/50 last:border-0", p.status === 'voided' && 'opacity-50 grayscale')}>
                         <TableCell className="pl-10 py-6">
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-[#111111] uppercase tracking-tighter italic leading-tight">{p.entityName}</span>
                               <span className="text-[9px] font-bold text-[#919191] uppercase tracking-widest mt-1">{p.id}</span>
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-[#111111] uppercase tracking-tight">{p.gl_account}</span>
                               <span className={cn(
                                 "text-[9px] font-black uppercase tracking-widest mt-1 italic",
                                 p.liquidity_impact === 'inflow' ? "text-lime-600" : "text-rose-500"
                               )}>{p.cost_center}</span>
                            </div>
                         </TableCell>
                         <TableCell className="text-right">
                            <span className={cn(
                              "text-md font-black tabular-nums tracking-tighter",
                              p.liquidity_impact === 'outflow' ? "text-rose-500" : "text-lime-600"
                            )}>
                               {p.liquidity_impact === 'outflow' ? '-' : '+'}CFA {p.amount.toLocaleString()}
                            </span>
                         </TableCell>
                         <TableCell className="text-center">
                            <Badge className={cn("border-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm", getStatusStyle(p.status))}>
                               {p.status}
                            </Badge>
                         </TableCell>
                         <TableCell className="text-center">
                            <span className="text-[10px] font-mono font-black text-[#555555] opacity-60">
                               {p.physical_receipt_no || 'SYSTEM-GEN'}
                            </span>
                         </TableCell>
                         <TableCell className="pr-10 text-right">
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-[#111111] hover:text-white transition-all scale-90">
                                     <MoreVertical className="h-4 w-4" />
                                  </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-[200px] bg-[#111111] rounded-2xl shadow-2xl border border-white/5 p-2 animate-in fade-in zoom-in-95 duration-200">
                                  <DropdownMenuLabel className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] px-2 py-1.5 italic">Audit Protocol</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                                  <DropdownMenuItem 
                                     onClick={() => {
                                        if (p.status === 'paid') return;
                                        updatePayment(p.id, { status: 'paid', payment_date: new Date().toISOString() });
                                        toast.success("Node Settled", { description: "Fiscal status synchronized." });
                                     }}
                                     disabled={p.status === 'paid'}
                                     className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-lime-400 hover:bg-lime-500 hover:text-black cursor-pointer transition-colors group"
                                  >
                                     <CheckCircle2 className="h-4 w-4 text-lime-500 group-hover:text-black" /> Mark as Paid
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                     onClick={() => { 
                                       setSelectedTransaction(p); 
                                       setProcessTitle("Forensic Trace Initialized");
                                       setProcessMessage(`Analyzing origin nodes for ${p.id}...`);
                                       setIsProcessOverlayOpen(true);
                                     }}
                                     className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-white/70 hover:bg-white/5 hover:text-lime-400 cursor-pointer transition-colors group"
                                  >
                                     <Fingerprint className="h-4 w-4 text-white/20 group-hover:text-lime-500" /> Trace Origin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                     onClick={() => { 
                                       setProcessTitle("Physical Sync Verification"); 
                                       setProcessMessage("Cross-referencing physical artifacts with digital ledger...");
                                       setIsProcessOverlayOpen(true); 
                                     }}
                                     className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-white/70 hover:bg-white/5 hover:text-lime-400 cursor-pointer transition-colors group">
                                     <ArrowRightLeft className="h-4 w-4 text-white/20 group-hover:text-lime-500" /> Verify Physical Sync
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                     onClick={() => { 
                                       setProcessTitle("PDF Artifact Export"); 
                                       setProcessMessage("Generating high-fidelity forensic PDF document...");
                                       setIsProcessOverlayOpen(true); 
                                     }}
                                     className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-white/70 hover:bg-white/5 hover:text-lime-400 cursor-pointer transition-colors group">
                                     <Download className="h-4 w-4 text-white/20 group-hover:text-lime-500" /> Export PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                                  <DropdownMenuItem 
                                     onClick={() => {
                                        if (p.status === 'flagged') return;
                                        updatePayment(p.id, { status: 'flagged' });
                                        toast.warning("Node Flagged", { description: `Audit flag raised for ${p.id}.` });
                                     }}
                                     className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors group">
                                     <ShieldAlert className="h-4 w-4 opacity-50 group-hover:opacity-100" /> Flag for Audit
                                  </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
             <div className="p-8 bg-[#FAFBFC] flex justify-between items-center">
                <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic">Displaying Ledger Segment <span className="text-[#111111]">{currentPage}</span> of {totalPages}</p>
                <div className="flex gap-2">
                   <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-10 px-6 rounded-xl bg-white text-[#111111] hover:bg-lime-50 font-black text-[10px] uppercase tracking-widest border-none shadow-sm transition-all active:scale-95">Prev</Button>
                   <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-10 px-6 rounded-xl bg-white text-[#111111] hover:bg-lime-50 font-black text-[10px] uppercase tracking-widest border-none shadow-sm transition-all active:scale-95">Next</Button>
                </div>
             </div>
          </Card>
        )}

        {selectedTab === 'reconciliation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none rounded-[3.5rem] bg-white shadow-2xl shadow-black/5 p-12 flex flex-col items-center text-center">
               <div className="h-24 w-24 rounded-[2.5rem] bg-lime-500/10 flex items-center justify-center mb-10">
                  <Bank className="h-12 w-12 text-lime-600" />
               </div>
               <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter">Physical <span className="text-lime-500">Bank Sync</span></h3>
               <p className="text-sm font-medium text-[#919191] uppercase tracking-widest mt-4 px-10 leading-relaxed italic">
                 Manually synchronize your physical vault logs with institutional bank statements and POS settlement reports.
               </p>
               <Button onClick={() => setActiveModal('statement-audit')} className="mt-12 w-full h-16 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-[2rem] font-black text-[10px] uppercase tracking-widest border-none shadow-xl shadow-black/10 transition-all active:scale-95">
                 Initiate Manual Statement Audit
               </Button>
            </Card>

            <Card className="border-none rounded-[3.5rem] bg-[#111111] shadow-2xl shadow-black/20 p-12 flex flex-col items-center text-center group">
               <div className="h-24 w-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-10 border border-white/10 group-hover:border-lime-500/50 transition-all">
                  <RefreshCw className="h-12 w-12 text-lime-400 animate-spin-slow" />
               </div>
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter underline decoration-lime-500/20">Operational <span className="text-lime-500">Stability Index</span></h3>
               <p className="text-sm font-medium text-white/30 uppercase tracking-widest mt-4 px-10 leading-relaxed">
                 All manual logs are currently cross-referenced across 45 nodes for the previous 24-hour cycle.
               </p>
               <div className="mt-12 w-full p-8 bg-white/5 rounded-[2rem] border border-white/5 flex justify-between items-center group-hover:bg-white/10 transition-all">
                  <div className="text-left">
                     <p className="text-[10px] font-black text-lime-400 uppercase tracking-widest mb-1">Last System Sync</p>
                     <p className="text-sm font-black text-white uppercase italic font-mono tracking-widest">14 APR 2026 - 03:55 AM</p>
                  </div>
                  <ShieldCheck className="h-10 w-10 text-lime-500 opacity-40" />
               </div>
            </Card>
          </div>
        )}
      </div>
      <ProcessOverlay 
        isOpen={isProcessOverlayOpen} 
        onClose={() => setIsProcessOverlayOpen(false)} 
        title={processTitle} 
        message={processMessage}
      />
    </div>
  );
}

function ProcessOverlay({ isOpen, onClose, title, message }: any) {
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
             <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{message || "Accessing institutional nodes..."}</p>
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

// --- TACTICAL OPERATIONAL PROTOCOLS ---

function LogPaymentWizard({ isOpen, onClose, step, setStep, onComplete }: any) {
  const [formData, setFormData] = useState({ studentId: 'STU-9021', studentName: 'Sarah Wilson', amount: '5000', glAccount: 'Hostel Fees', receiptNo: 'PR-8821' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStudents() {
      if (searchTerm.length > 1) {
        setIsSearching(true);
        const { data } = await supabase
          .from('students')
          .select('*, user:users(*)')
          .or(`student_id.ilike.%${searchTerm}%, users.full_name.ilike.%${searchTerm}%`);
        setSearchResults(data?.map((s: any) => ({ id: s.id, name: s.user?.full_name, room: s.current_room_id })) || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }
    fetchStudents();
  }, [searchTerm]);

  const selectStudent = (student: any) => {
    setFormData({ ...formData, studentId: student.id, studentName: student.name });
    setSearchTerm(student.name);
    setSearchResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-md border-none bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-10 border-b border-[#F5F5F5] bg-[#FAFBFC] flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                  <UserPlus className="h-6 w-6 text-lime-400" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Inflow <span className="text-lime-500 italic">Registry</span></h3>
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Manual Fund orchestration</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-all bg-white border border-black/5">
               <X className="h-5 w-5 text-black" />
            </button>
         </div>

         <div className="p-10 space-y-6">
            <div className="flex justify-between items-center mb-4">
               {[1, 2, 3, 4].map(s => (
                 <div key={s} className={cn(
                   "h-1.5 flex-1 mx-1 rounded-full transition-all duration-500",
                   step >= s ? "bg-lime-500" : "bg-[#F0F0F0]"
                 )} />
               ))}
            </div>

            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                 <h4 className="text-xs font-black text-[#111111] uppercase tracking-widest italic">Step 1: Student Registry Node</h4>
                 <div className="relative">
                    <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#919191]", isSearching && "animate-pulse")} />
                    <Input 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm" 
                      placeholder="Search Student ID or Name..." 
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-black/5 z-20 overflow-hidden animate-in slide-in-from-top-2">
                        {searchResults.map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => selectStudent(s)}
                            className="w-full p-4 flex items-center justify-between hover:bg-lime-50 transition-colors text-left"
                          >
                            <div>
                              <p className="text-xs font-black text-[#111111] uppercase tracking-tight">{s.name}</p>
                              <p className="text-[9px] font-bold text-[#919191] uppercase tracking-widest">{s.id}</p>
                            </div>
                            <Badge className="bg-black/5 text-[#555555] border-none text-[8px] font-black">{s.room}</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                 </div>
                 <div className="p-4 bg-lime-50 rounded-2xl border border-lime-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="h-5 w-5 text-lime-600" />
                       <span className="text-xs font-bold text-lime-800">Verified Node: {formData.studentId}</span>
                    </div>
                 </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                 <h4 className="text-xs font-black text-[#111111] uppercase tracking-widest italic">Step 2: Fiscal Parameters</h4>
                 <div className="space-y-3">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-[#919191] uppercase tracking-widest pl-1">Amount (Excl. Tax)</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lime-600">CFA</span>
                          <Input 
                            type="number"
                            value={formData.amount} 
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            className="pl-14 h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm tabular-nums" 
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-[#919191] uppercase tracking-widest pl-1">GL Classification</label>
                       <Input 
                        value={formData.glAccount} 
                        onChange={(e) => setFormData({...formData, glAccount: e.target.value})}
                        className="h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm" 
                       />
                    </div>
                 </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                 <h4 className="text-xs font-black text-[#111111] uppercase tracking-widest italic">Step 3: Physical Artifact Registry</h4>
                 <div className="h-32 border-2 border-dashed border-[#F0F0F0] rounded-3xl flex flex-col items-center justify-center group hover:border-lime-500 transition-all cursor-pointer">
                    <ShieldCheck className="h-8 w-8 text-[#919191] group-hover:text-lime-500 mb-2 transition-colors" />
                    <span className="text-[10px] font-black text-[#919191] uppercase tracking-widest group-hover:text-[#111111]">Sync Physical Receipt</span>
                 </div>
                 <Input 
                  value={formData.receiptNo} 
                  onChange={(e) => setFormData({...formData, receiptNo: e.target.value})}
                  className="h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm" 
                  placeholder="Enter Physical Receipt Number..." 
                 />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                 <div className="text-center space-y-2">
                    <Badge className="bg-lime-500 text-black border-none text-[8px] font-black px-3 py-1 uppercase tracking-widest">Final Authorization</Badge>
                    <h4 className="text-4xl font-black text-[#111111] tracking-tighter">CFA {Number(formData.amount).toLocaleString()}</h4>
                    <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest italic">Logged to {formData.glAccount}</p>
                 </div>
                 <div className="p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5 space-y-3 shadow-inner">
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest">
                       <span className="text-[#919191]">Origin</span>
                       <span className="text-[#111111]">{formData.studentName}</span>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest">
                       <span className="text-[#919191]">Artifact</span>
                       <span className="text-[#111111]">{formData.receiptNo}</span>
                    </div>
                 </div>
              </div>
            )}
         </div>

         <div className="p-10 bg-[#FAFBFC] border-t border-[#F5F5F5] flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="h-14 w-20 rounded-2xl border border-black/5 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest hover:bg-[#F9FAFB] transition-all">
                 Back
              </button>
            )}
            <Button 
               onClick={() => {
                 if (step < 4) setStep(step + 1);
                 else {
                   onComplete(formData);
                   onClose();
                 }
               }} 
               className="flex-1 h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all"
            >
               {step === 4 ? 'Deploy Log' : 'Authorize Next Phase'}
            </Button>
         </div>
      </Card>
    </div>
  );
}


function RequisitionProcessModal({ isOpen, onClose, transaction, onAction }: any) {
  if (!isOpen || !transaction) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-sm border-none bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-10 space-y-8 text-center">
            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/20 relative">
               <Gavel className="h-10 w-10 text-white" />
               <div className="absolute inset-0 rounded-[2rem] border-2 border-amber-500 animate-ping opacity-20" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Fiscal <span className="text-amber-500">Challenge</span></h3>
               <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Fund Requisition Review</p>
            </div>

            <div className="p-6 bg-[#FAFBFC] rounded-3xl border border-black/5 text-left space-y-4">
               <div>
                  <p className="text-[8px] font-black text-[#919191] uppercase tracking-widest mb-1 italic">Requisition Source</p>
                  <p className="text-[11px] font-black text-[#111111] uppercase tracking-tighter leading-none">{transaction.entityName}</p>
               </div>
               <div>
                  <p className="text-[8px] font-black text-[#919191] uppercase tracking-widest mb-1 italic">Justification Artifact</p>
                  <p className="text-[11px] font-bold text-[#555555] italic leading-relaxed">"{transaction.notes}"</p>
               </div>
               <div className="pt-2 border-t border-black/5 flex justify-between items-end">
                  <span className="text-[9px] font-black text-[#919191] uppercase tracking-widest italic">Delta Sum</span>
                  <span className="text-2xl font-black text-rose-500 tabular-nums tracking-tighter">CFA {transaction.amount.toLocaleString()}</span>
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <Button onClick={() => { onAction('approve'); onClose(); }} className="h-16 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all">
                  Authorize Disbursement
               </Button>
               <Button onClick={() => { onAction('deny'); onClose(); }} variant="ghost" className="h-12 font-black text-[10px] uppercase tracking-widest text-rose-500 hover:bg-rose-50">
                  Denial Protocol
               </Button>
            </div>
         </div>
      </Card>
    </div>
  );
}

function ForensicSidePanel({ isOpen, onClose, transaction }: any) {
  if (!transaction) return null;
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-white border-none p-0 overflow-hidden">
         <div className="h-full flex flex-col">
            <div className="p-8 bg-[#111111] text-white">
               <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-lime-500 flex items-center justify-center">
                     <Fingerprint className="h-5 w-5 text-black" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Forensic <span className="text-lime-500">Origin</span></h3>
               </div>
               <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <div>
                     <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 italic">Transaction ID</p>
                     <p className="text-sm font-mono font-black text-white tracking-widest">{transaction.id}</p>
                  </div>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 italic">Status Pulse</p>
                        <Badge className="bg-lime-500 text-black border-none text-[8px] font-black uppercase px-2">{transaction.status}</Badge>
                     </div>
                     <h4 className="text-3xl font-black text-white tracking-tighter">CFA {transaction.amount.toLocaleString()}</h4>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] italic">Origin Timeline</h4>
                  <div className="space-y-6 pl-4 border-l-2 border-[#F0F0F0] relative">
                     {transaction.auditLog?.map((log: any, i: number) => (
                       <div key={i} className="relative">
                          <div className="absolute left-[-21px] top-1.5 h-3 w-3 rounded-full bg-white border-2 border-[#111111] z-10" />
                          <p className="text-[9px] font-black text-[#919191] tabular-nums tracking-widest uppercase">{log.time}</p>
                          <h5 className="text-[11px] font-black text-[#111111] uppercase tracking-tight mt-0.5">{log.action}</h5>
                          <p className="text-[10px] font-bold text-[#555555] italic">System Node: {log.user}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] italic">Technical Metadata</h4>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                       { icon: Landmark, label: 'GL Account', val: transaction.gl_account },
                       { icon: Activity, label: 'Cost Center', val: transaction.cost_center },
                       { icon: ShieldCheck, label: 'Auth Code', val: 'SYS-X902' },
                       { icon: Receipt, label: 'P-Artifact', val: transaction.physical_receipt_no || 'NA' },
                     ].map((m, i) => (
                       <div key={i} className="p-4 bg-[#FAFBFC] rounded-2xl border border-black/5">
                          <m.icon className="h-4 w-4 text-lime-600 mb-2" />
                          <p className="text-[8px] font-black text-[#919191] uppercase tracking-widest mb-0.5">{m.label}</p>
                          <p className="text-[10px] font-black text-[#111111] overflow-hidden text-ellipsis whitespace-nowrap">{m.val}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-[#F5F5F5] grid grid-cols-2 gap-3 bg-[#FAFBFC]">
               <Button onClick={() => toast.success("PDF Export Initiated", { description: "Forensic artifact generated." })} variant="outline" className="h-12 rounded-xl border-none shadow-sm font-black text-[9px] uppercase tracking-widest bg-white">
                  <Printer className="h-3 w-3 mr-2" /> PDF Export
               </Button>
               <Button onClick={() => { toast.warning("Node Flagged", { description: "Security override assigned." }); onClose(); }} className="h-12 rounded-xl bg-[#111111] text-white hover:bg-black font-black text-[9px] uppercase tracking-widest shadow-xl">
                  <ShieldAlert className="h-3 w-3 mr-2 text-lime-400" /> Flag Audit
               </Button>
            </div>
         </div>
      </SheetContent>
    </Sheet>
  );
}

function StatementAuditProtocol({ isOpen, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-lg border-none bg-[#111111] rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 text-white">
         <div className="p-12 text-center space-y-10">
            <div className="mx-auto h-24 w-24 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center relative group">
               <RefreshCw className="h-12 w-12 text-lime-400 animate-spin-slow group-hover:rotate-180 transition-transform duration-700" />
               <div className="absolute inset-0 rounded-[3rem] border-2 border-lime-500 animate-pulse opacity-20" />
            </div>
            
            <div className="space-y-3">
               <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none underline decoration-lime-500/20">Statement <span className="text-lime-500">Reconciliation</span></h3>
               <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] px-10 leading-relaxed">Cross-referencing institutional bank logs with manual physical artifacts.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'System Accuracy', val: '99.8%' },
                 { label: 'Unsynced Nodes', val: '04' },
               ].map(m => (
                 <div key={m.label} className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{m.label}</p>
                    <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{m.val}</p>
                 </div>
               ))}
            </div>

            <div className="flex flex-col gap-3">
               <Button onClick={() => { toast.success("Forensic Match Initialized", { description: "Reconciliation script running in background." }); onClose(); }} className="h-16 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl shadow-lime-500/20 transition-all">
                  Initialize forensic Match
               </Button>
               <Button onClick={onClose} variant="ghost" className="h-12 font-black text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-all">
                  Return to Dashboard
               </Button>
            </div>
         </div>
      </Card>
    </div>
  );
}

function NewRequisitionWizard({ isOpen, onClose, onComplete }: any) {
  const [formData, setFormData] = useState({ amount: '', glAccount: '', notes: '' });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-md border-none bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-10 border-b border-[#F5F5F5] bg-[#FAFBFC] flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                  <Activity className="h-6 w-6 text-lime-400" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Fund <span className="text-lime-500 text-[#111111]">Requisition</span></h3>
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Internal Request Logic</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-all bg-white border border-black/5">
               <X className="h-5 w-5 text-black" />
            </button>
         </div>

         <div className="p-10 space-y-6">
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-3">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-[#919191] uppercase tracking-widest pl-1">Amount (CFA)</label>
                     <Input value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm tabular-nums" placeholder="Enter requested amount..." />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-[#919191] uppercase tracking-widest pl-1">GL Account Designation</label>
                     <Input value={formData.glAccount} onChange={(e) => setFormData({...formData, glAccount: e.target.value})} className="h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm" placeholder="e.g. Maintenance, Security..." />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-[#919191] uppercase tracking-widest pl-1">Justification Protocol</label>
                     <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm" placeholder="Provide reason for request..." />
                  </div>
               </div>
            </div>
         </div>

         <div className="p-10 bg-[#FAFBFC] border-t border-[#F5F5F5] flex gap-3">
            <Button onClick={onClose} variant="outline" className="h-14 w-24 rounded-2xl border-none shadow-sm font-black text-[10px] uppercase tracking-widest">
               Cancel
            </Button>
            <Button 
               onClick={() => { onComplete(formData); onClose(); }} 
               className="flex-1 h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all"
            >
               Deploy Request
            </Button>
         </div>
      </Card>
    </div>
  );
}

function EditTransactionWizard({ isOpen, onClose, formData, onComplete }: any) {
  const [localData, setLocalData] = useState(formData || { amount: 0, gl_account: '', physical_receipt_no: '' });
  
  // Update local state when formData changes (when modal opens)
  React.useEffect(() => {
    if (formData) {
      setLocalData(formData);
    }
  }, [formData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-md border-none bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-10 border-b border-[#F5F5F5] bg-[#FAFBFC] flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-lime-500/10 flex items-center justify-center shadow-inner">
                  <Plus className="h-6 w-6 text-lime-600" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Edit <span className="text-lime-500">Entry</span></h3>
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Modify Ledger Node</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-all bg-white border border-black/5">
               <X className="h-5 w-5 text-black" />
            </button>
         </div>

         <div className="p-10 space-y-6">
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-3">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-[#919191] uppercase tracking-widest pl-1">Amount (CFA)</label>
                     <Input value={localData.amount} onChange={(e) => setLocalData({...localData, amount: Number(e.target.value) || 0})} type="number" className="h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm tabular-nums" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-[#919191] uppercase tracking-widest pl-1">GL Classification</label>
                     <Input value={localData.gl_account} onChange={(e) => setLocalData({...localData, gl_account: e.target.value})} className="h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-[#919191] uppercase tracking-widest pl-1">Physical Receipt No.</label>
                     <Input value={localData.physical_receipt_no || ''} onChange={(e) => setLocalData({...localData, physical_receipt_no: e.target.value})} className="h-12 rounded-xl bg-[#FAFBFC] border-none font-bold text-sm" />
                  </div>
               </div>
            </div>
         </div>

         <div className="p-10 bg-[#FAFBFC] border-t border-[#F5F5F5] flex gap-3">
            <Button onClick={onClose} variant="outline" className="h-14 w-24 rounded-2xl border-none shadow-sm font-black text-[10px] uppercase tracking-widest">
               Cancel
            </Button>
            <Button 
               onClick={() => { onComplete(localData); onClose(); }} 
               className="flex-1 h-14 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all"
            >
               Update Node
            </Button>
         </div>
      </Card>
    </div>
  );
}

function StudentPaymentTerminal() {
  const { user } = useAuth();
  const { payments, isLoading } = usePayments();
  const [searchTerm, setSearchTerm] = useState('');

  const myPayments = useMemo(() => {
    return payments.filter(p => p.student?.user_id === user?.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [payments, user]);

  const stats = useMemo(() => {
    const totalPaid = myPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const pending = myPayments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0);
    const overdue = myPayments.filter(p => p.status === 'overdue').length;
    return { totalPaid, pending, overdue };
  }, [myPayments]);

  const filteredPayments = useMemo(() => {
    return myPayments.filter(p => 
      p.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.physical_receipt_no || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [myPayments, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-[#FAFBFC] md:p-8 p-4 gap-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#111111] uppercase">
            My <span className="text-lime-500">Finances</span>
          </h1>
          <p className="text-sm font-medium text-[#919191]">Track your institutional fees, mess plans, and receipt artifacts.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Card className="border-none bg-[#111111] rounded-2xl shadow-xl shadow-black/10 px-6 py-4 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-lime-400" />
             </div>
             <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pending Balance</p>
                <h3 className="text-xl font-black text-white tabular-nums">CFA {stats.pending.toLocaleString()}</h3>
             </div>
          </Card>
          <Card className="border-none bg-white rounded-2xl shadow-xl shadow-black/5 px-6 py-4 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-lime-500" />
             </div>
             <div>
                <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">Total Settled</p>
                <h3 className="text-xl font-black text-[#111111] tabular-nums">CFA {stats.totalPaid.toLocaleString()}</h3>
             </div>
          </Card>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919191]" />
          <Input
            placeholder="Search by invoice type or receipt number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-16 bg-white border-none shadow-2xl shadow-black/5 rounded-3xl font-black text-sm uppercase tracking-widest focus-visible:ring-lime-500"
          />
        </div>
        <Button className="h-16 rounded-3xl bg-[#111111] text-white hover:bg-black shadow-xl px-8 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border-none transition-all hover:scale-105 active:scale-95">
          <CreditCard className="h-5 w-5 text-lime-400" /> Pay Pending Fees
        </Button>
      </div>

      {/* Payment History */}
      <Card className="border-none rounded-[3rem] bg-white shadow-2xl shadow-black/5 overflow-hidden">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-lime-500 flex items-center justify-center">
              <History className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Institutional <span className="text-lime-500">Ledger</span></h3>
              <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">Comprehensive history of your financial interactions.</p>
            </div>
          </div>
          {stats.overdue > 0 && (
            <Badge className="bg-rose-500/10 text-rose-600 border-none px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest animate-pulse">
              <AlertOctagon className="h-4 w-4 mr-2" /> {stats.overdue} Overdue Invoices
            </Badge>
          )}
        </div>
        <div className="p-2 overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FAFBFC]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="pl-10 font-black text-[10px] uppercase tracking-widest text-[#919191] h-16">Invoice Type</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#111111] h-16">Receipt ID</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#111111] h-16 text-right">Amount</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#919191] h-16 text-center">Status</TableHead>
                <TableHead className="pr-10 font-black text-[10px] uppercase tracking-widest h-16 text-right">Artifacts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => (
                <TableRow key={p.id} className="group hover:bg-[#FAFBFC] transition-all border-b border-[#F5F5F5]/50 last:border-0">
                  <TableCell className="pl-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#111111] uppercase tracking-tighter italic">{p.payment_type.replace('_', ' ')}</span>
                      <span className="text-[9px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Due: {p.due_date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#F0F0F0] text-[#111111] font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-white">
                      {p.physical_receipt_no || 'Pending Sync'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "text-md font-black tabular-nums tracking-tighter",
                      p.status === 'paid' ? "text-lime-600" : "text-rose-500"
                    )}>
                      CFA {p.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "border-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm",
                      p.status === 'paid' ? 'bg-lime-500/10 text-lime-500' : 'bg-amber-500/10 text-amber-500'
                    )}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-10 text-right">
                    <Button 
                      variant="ghost" 
                      className="h-10 px-4 rounded-xl hover:bg-[#111111] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest gap-2"
                      onClick={() => toast.info("Downloading Receipt", { description: "Generating secure PDF artifact..." })}
                      disabled={p.status !== 'paid'}
                    >
                      <Download className="h-4 w-4" /> Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                      <CreditCard className="h-12 w-12" />
                      <p className="text-xs font-black uppercase tracking-[0.2em]">No financial artifacts found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
