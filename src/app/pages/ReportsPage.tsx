import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  FileText, BarChart3, ShieldCheck, AlertCircle, Calendar as CalendarIcon, 
  Filter, Download, Search, Plus, ChevronRight, DownloadCloud,
  Layers, Clock, ArrowUpRight, Zap, Target, CreditCard, TrendingUp,
  Activity, ArrowDownLeft, Scale, PieChart as PieIcon, Landmark,
  ShieldAlert, Fingerprint, Receipt, History
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear } from 'date-fns';
import { Calendar } from '../components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '../components/ui/utils';
import { useReports } from '../hooks/useReports';
import { supabase } from '../../lib/supabase';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import { toast } from 'sonner';
import { X, FileSearch, MoreVertical, CheckCircle2, AlertTriangle, Eye, Printer, Ban, RefreshCw } from 'lucide-react';
import { Sheet, SheetContent } from '../components/ui/sheet';

const COLORS = ['#D4FF3F', '#111111', '#555555', '#919191'];

export function ReportsPage() {
  const { 
    reports, 
    anomalies, 
    stats, 
    flowData, 
    densityData, 
    isLoading, 
    resolveAnomaly 
  } = useReports();
  const [reportType, setReportType] = useState('debt_matrix');
  const [isGenerating, setIsGenerating] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isProcessOverlayOpen, setIsProcessOverlayOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState("");

  const liquidityVelocityData = flowData;
  const expenditureDensity = densityData;

  const reportStats = [
    { 
      title: 'Net Liquidity Node', 
      value: stats?.netLiquidity || '...', 
      subtext: 'Current physical vault volume', 
      icon: <Landmark className="h-6 w-6 text-[#111111]" />,
      cardColor: "bg-[#D4FF3F]",
      shadow: "shadow-2xl shadow-lime-500/10",
      iconBoxBg: "bg-black/10 backdrop-blur-md",
      textColor: "text-[#111111]",
      subtextColor: "text-[#111111] opacity-60",
      watermark: <Scale className="h-24 w-24 text-[#111111]" />
    },
    { 
      title: 'Institutional Burn', 
      value: stats?.institutionalBurn || '...', 
      subtext: 'Monthly staff fund velocity', 
      icon: <TrendingUp className="h-6 w-6 text-lime-400" />,
      cardColor: "bg-[#111111]",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-white/10 backdrop-blur-md",
      textColor: "text-white",
      subtextColor: "text-white/40",
      watermark: <Activity className="h-24 w-24 text-white" />
    },
    { 
      title: 'Fiscal Inflow Sync', 
      value: stats?.syncRatio || '...', 
      subtext: 'Verified manual receipts', 
      icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
      cardColor: "bg-white",
      shadow: "shadow-2xl shadow-black/5",
      iconBoxBg: "bg-blue-500/10",
      textColor: "text-[#111111]",
      subtextColor: "text-[#919191]",
      watermark: <Fingerprint className="h-24 w-24 text-blue-100" />
    },
  ];

  const reportsState = reports;
  const anomaliesState = anomalies;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'finalized': return 'bg-lime-500/20 text-lime-700 border-lime-500/30';
      case 'under_review': return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      case 'flagged': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerate = () => {
    if (!reportType || !date?.from || !date?.to) {
        toast.error("Incomplete Configuration", { description: "Please ensure spatial and temporal parameters are set." });
        return;
    }
    setProcessTitle("Artifact Generation");
    setIsProcessOverlayOpen(true);
    toast.info("Generation Initialized", { description: "Matrix sync in progress." });
  };

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[#111111] uppercase italic leading-none">
            Reports <span className="text-lime-500">Terminal</span>
          </h1>
          <p className="text-sm font-medium text-[#919191]">Master generation engine for compliance and forensic auditing.</p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl border-none shadow-sm font-black text-[10px] uppercase tracking-widest gap-2 h-12 px-6 bg-[#FAFBFC] hover:bg-white transition-all active:scale-95"
          onClick={() => handleGenerate()}
        >
          <DownloadCloud className="h-4 w-4" /> Export Master DB
        </Button>
      </div>

      {/* Strategic Audit KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportStats.map((stat, idx) => (
          <Card key={idx} className={cn("border-none overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all", stat.cardColor, stat.shadow)}>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              {stat.watermark}
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.iconBoxBg)}>
                  {stat.icon}
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[8px] font-black uppercase text-white tracking-widest">Active Matrix</span>
                   </div>
                </div>
              </div>
              <h3 className={cn("text-4xl font-black tracking-tighter italic mb-1", stat.textColor)}>{stat.value}</h3>
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1", stat.textColor)}>{stat.title}</p>
              <p className={cn("text-[10px] font-bold uppercase italic", stat.subtextColor)}>{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generation Engine & Forensic Visualization */}
      <div className="grid grid-cols-12 gap-8">
        {/* Artifact Configurator */}
        <Card className="col-span-12 lg:col-span-8 border-none shadow-2xl shadow-black/5 bg-white rounded-[3rem] overflow-hidden flex flex-col p-10">
           <div className="flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-xl bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/20">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Report <span className="text-lime-500">Configurator</span></h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div className="space-y-6">
                 <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em]">Surgical Blueprint Choice</p>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'debt_matrix', label: 'Debt Matrix', icon: <Target className="h-4 w-4" /> },
                      { id: 'req_forensic', label: 'REQ Forensic', icon: <History className="h-4 w-4" /> },
                      { id: 'ledger_audit', label: 'Ledger Audit', icon: <Clock className="h-4 w-4" /> },
                      { id: 'tax_sync', label: 'Tax Sync', icon: <ShieldCheck className="h-4 w-4" /> },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setReportType(type.id)}
                        className={cn(
                          "p-4 rounded-2xl flex items-center gap-3 transition-all border-2 text-[10px] font-black uppercase tracking-widest",
                          reportType === type.id 
                            ? "bg-[#111111] text-white border-[#111111] shadow-xl" 
                            : "bg-[#FAFBFC] text-[#919191] border-[#F0F0F0] hover:bg-white"
                        )}
                      >
                        <div className={cn("h-1.5 w-1.5 rounded-full", reportType === type.id ? "bg-lime-500" : "bg-[#919191]")} />
                        {type.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                 <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em]">Temporal Node Range</p>
                 <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full p-5 bg-[#FAFBFC] rounded-3xl border border-[#F0F0F0] flex items-center gap-4 text-[10px] font-black text-[#111111] uppercase tracking-widest hover:bg-white transition-all group">
                        <CalendarIcon className="h-5 w-5 text-[#919191] group-hover:text-black transition-colors" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Set Duration Node</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none rounded-3xl shadow-2xl z-[100]" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                 </Popover>
              </div>
           </div>

           <div className="mt-12 p-8 bg-[#111111] rounded-[2.5rem] flex items-center justify-between group">
              <div>
                 <h4 className="text-white text-lg font-black uppercase italic tracking-tighter leading-none mb-2">Ready for Forensic Generation</h4>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Configured Category: <span className="text-lime-500">{reportType.toUpperCase()}</span> | Range: <span className="text-white">{format(date?.from || new Date(), 'MMM dd')} - {format(date?.to || new Date(), 'MMM dd')}</span></p>
              </div>
              <Button 
                onClick={handleGenerate}
                className="bg-lime-500 text-black hover:bg-lime-600 h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-lime-500/20 active:scale-95 transition-all"
              >
                Generate Master Artifact
              </Button>
           </div>
        </Card>

        {/* Dynamic Velocity Visualization */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
           <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[3rem] overflow-hidden flex-1 group">
             <div className="p-8 pb-0">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight leading-none mb-2">Flow <span className="text-lime-500">Velocity</span></h3>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Inflow vs Outflow Trends</p>
             </div>
             <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liquidityVelocityData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4FF3F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4FF3F" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                       content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                             return (
                                <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl">
                                   <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                   <p className="text-[12px] font-black text-lime-400 tabular-nums">IN: CFA {payload[0].value.toLocaleString()}</p>
                                   <p className="text-[12px] font-black text-rose-400 tabular-nums">OUT: CFA {payload[1].value.toLocaleString()}</p>
                                </div>
                             );
                          }
                          return null;
                       }}
                    />
                    <Area type="monotone" dataKey="inflow" stroke="#D4FF3F" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                    <Area type="monotone" dataKey="outflow" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
             <div className="p-8 pt-0 flex justify-between items-end">
                <div className="space-y-4">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Avg Inflow</span>
                      <span className="text-lg font-black text-white tabular-nums tracking-tighter">CFA 58.2k</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Avg Outflow</span>
                      <span className="text-lg font-black text-rose-400 tabular-nums tracking-tighter">CFA 16.4k</span>
                   </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer">
                   <TrendingUp className="h-6 w-6 text-lime-500" />
                </div>
             </div>
           </Card>

           <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2.5rem] overflow-hidden flex-1">
             <div className="p-8 pb-0">
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Institutional <span className="text-lime-500">Density</span></h3>
                <p className="text-[9px] font-black text-[#919191] uppercase tracking-widest">Expenditure Allocation by Category</p>
             </div>
             <div className="h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenditureDensity}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {expenditureDensity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">Master</p>
                   <p className="text-xl font-black text-[#111111] uppercase tracking-tighter">BURN</p>
                </div>
             </div>
             <div className="px-8 pb-8 space-y-3">
                {expenditureDensity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[9px] font-black text-[#111111] uppercase tracking-widest">{item.name}</span>
                     </div>
                     <span className="text-[10px] font-black text-[#919191] tabular-nums">CFA {Number(item.value).toLocaleString()}</span>
                  </div>
                ))}
             </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 flex flex-col">
           <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden flex-1 p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                       <ShieldAlert className="h-5 w-5 text-lime-400" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight leading-none">Fiscal <span className="text-lime-500">Anomalies</span></h3>
                       <p className="text-[9px] font-black text-[#919191] uppercase tracking-widest mt-1">Transactions requiring manual forensic sync</p>
                    </div>
                 </div>
                 <Button 
                    onClick={() => { toast.success("Matrix Cleared", { description: "All anomaly flags removed." }) }}
                    variant="ghost" 
                    className="text-[9px] font-black uppercase tracking-widest text-[#111111] hover:bg-white rounded-xl"
                 >
                    Clear All Flags
                 </Button>
              </div>
              
              <div className="space-y-4">
                 {anomaliesState.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-[#F0F0F0]">
                       <CheckCircle2 className="h-8 w-8 text-lime-400 mb-2 opacity-50" />
                       <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic">All Nodes Harmonized</p>
                    </div>
                 ) : anomaliesState.map((flag, i) => (
                    <HoverCard key={i}>
                       <HoverCardTrigger asChild>
                          <div 
                             onClick={() => { setSelectedAnomaly(flag); setActiveModal('anomaly-resolution'); }}
                             className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#F0F0F0] hover:border-lime-500/50 hover:shadow-xl hover:shadow-lime-500/5 transition-all cursor-pointer group"
                          >
                             <div className="flex items-center gap-5">
                                <div className={cn(
                                  "h-2 w-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                                  flag.level === 'High' ? "bg-rose-500" : "bg-amber-500"
                                )} />
                                <div>
                                   <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest transition-colors group-hover:text-lime-600 underline decoration-dashed decoration-[#F0F0F0] group-hover:decoration-lime-500 underline-offset-4">{flag.id}</p>
                                   <p className="text-xs font-black text-[#111111] uppercase italic tracking-tight mt-1">{flag.desc}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-md font-black text-rose-600 tabular-nums leading-none">{flag.amount}</p>
                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-1">Investigate</p>
                             </div>
                          </div>
                       </HoverCardTrigger>
                       <HoverCardContent align="start" className="w-80 bg-[#111111] text-white rounded-[2rem] border-none shadow-2xl p-6 z-[60]">
                         <div className="flex items-start gap-4">
                            <div className={cn(
                               "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                               flag.level === 'High' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                            )}>
                               <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{flag.id}</p>
                               <h4 className="text-sm font-black italic tracking-tighter leading-tight mt-1">Impact Score: <span className={flag.level === 'High' ? 'text-rose-500' : 'text-amber-500'}>{flag.level}</span></h4>
                            </div>
                         </div>
                         <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-relaxed">
                               Detected via system heuristic node tracking anomalous velocity thresholds.
                            </p>
                         </div>
                       </HoverCardContent>
                    </HoverCard>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      {/* Historical Forensic Ledger */}
      <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-black/10">
                <Receipt className="h-5 w-5 text-lime-400" />
              </div>
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Financial <span className="text-lime-500">Artifact Registry</span></h3>
            </div>
            <Badge className="bg-[#111111] text-lime-400 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl">
              Artifact Registry
            </Badge>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50">
            <Table>
              <TableHeader className="bg-[#FAFBFC]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-black text-[#111111] h-14 pl-8 text-[10px] uppercase tracking-widest italic">Artifact ID</TableHead>
                  <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic">Fiscal Blueprint</TableHead>
                  <TableHead className="font-black text-[#919191] h-14 text-[10px] uppercase tracking-widest italic text-center">Audit Score</TableHead>
                  <TableHead className="font-black text-[#919191] h-14 text-[10px] uppercase tracking-widest italic text-right pr-8">Status Matrix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportsState.map((report) => (
                  <TableRow key={report.id} className="hover:bg-gray-50/50 transition-colors border-b border-[#F0F0F0]/50 group">
                    <TableCell className="py-4 pl-8">
                      <div>
                        <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest italic underline decoration-lime-500/20 underline-offset-4">{report.id}</p>
                        <p className="text-[8px] font-bold text-[#919191] uppercase tracking-widest mt-1">{report.date}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="text-xs font-black text-[#111111] uppercase tracking-tight italic">{report.name}</p>
                        <p className="text-[8px] font-bold text-lime-600 uppercase tracking-[0.2em] mt-1">{report.category}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                       <span className="text-[10px] font-black text-[#111111] uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
                         {report.score} SYNC
                       </span>
                    </TableCell>
                    <TableCell className="py-4 pr-8 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <Badge className={cn("border px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm", getStatusStyle(report.status))}>
                            {report.status.replace('_', ' ')}
                          </Badge>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-[#111111] hover:text-white transition-all scale-90">
                                    <MoreVertical className="h-4 w-4" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] bg-[#111111] rounded-2xl shadow-2xl border border-white/5 p-2 animate-in fade-in zoom-in-95 duration-200">
                                 <DropdownMenuLabel className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] px-2 py-1.5 italic">Tactical Actions</DropdownMenuLabel>
                                 <DropdownMenuSeparator className="bg-white/5 my-1" />
                                 <DropdownMenuItem 
                                    onClick={() => { setSelectedReport(report); setActiveModal('artifact-details'); }}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-white/70 hover:bg-white/5 hover:text-lime-400 cursor-pointer transition-colors group"
                                 >
                                    <Eye className="h-4 w-4 text-white/20 group-hover:text-lime-500" /> View Details
                                 </DropdownMenuItem>
                                 <DropdownMenuItem 
                                    onClick={() => toast.success("Print Dispatched", { description: "Artifact sent to physical queue." })}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-white/70 hover:bg-white/5 hover:text-lime-400 cursor-pointer transition-colors group"
                                 >
                                    <Printer className="h-4 w-4 text-white/20 group-hover:text-lime-500" /> Print Archive
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator className="bg-white/5 my-1" />
                                 <DropdownMenuItem 
                                    onClick={() => {
                                       toast.warning("Artifact Flagged", { description: `Audit flag assigned to ${report.id}.` });
                                    }}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-amber-400 hover:bg-amber-500/10 cursor-pointer transition-colors group"
                                 >
                                    <AlertTriangle className="h-4 w-4 opacity-70 group-hover:opacity-100" /> Flag Artifact
                                 </DropdownMenuItem>
                                 <DropdownMenuItem 
                                    onClick={() => {
                                       toast.error("Artifact Voided", { description: `Log ${report.id} removed from active matrix.` });
                                    }}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors group"
                                 >
                                    <Ban className="h-4 w-4 opacity-70 group-hover:opacity-100" /> Void Log
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
       <AnomalyResolutionModal 
          isOpen={activeModal === 'anomaly-resolution'} 
          onClose={() => { setActiveModal(null); setSelectedAnomaly(null); }} 
          anomaly={selectedAnomaly}
          onResolve={() => resolveAnomaly(selectedAnomaly?.id)}
       />
      <ArtifactDetailsSidePanel 
         isOpen={activeModal === 'artifact-details'} 
         onClose={() => { setActiveModal(null); setSelectedReport(null); }} 
         report={selectedReport} 
      />
      <ProcessOverlay 
        isOpen={isProcessOverlayOpen} 
        onClose={() => setIsProcessOverlayOpen(false)} 
        title={processTitle} 
      />
    </div>
  );
}

function AnomalyResolutionModal({ isOpen, onClose, anomaly, onResolve }: any) {
   if (!anomaly) return null;
   return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
         <SheetContent side="right" className="w-full sm:max-w-md bg-white border-none p-0 overflow-hidden shadow-2xl">
            <div className="h-full flex flex-col p-10">
               <div className="flex items-center gap-4 mb-10">
                  <div className="h-14 w-14 rounded-3xl bg-rose-500/10 flex items-center justify-center">
                     <AlertTriangle className="h-8 w-8 text-rose-500" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">
                        Anomaly <span className="text-rose-500">Resolution</span>
                     </h3>
                     <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em]">Forensic Correction Protocol</p>
                  </div>
               </div>

               <div className="space-y-8 flex-1">
                  <div className="p-8 bg-[#111111] rounded-[2.5rem] space-y-4">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Target Artifact</p>
                     <p className="text-xl font-black text-white uppercase italic tracking-tight underline decoration-rose-500/30 underline-offset-8 leading-none mb-2">{anomaly.id}</p>
                     <p className="text-xs font-medium text-white/50 italic leading-relaxed">{anomaly.desc}</p>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">Resolution Action</p>
                     <div className="p-6 bg-[#FAFBFC] rounded-3xl border border-[#F0F0F0] space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-black text-[#919191] uppercase tracking-widest italic">Impact Radius</span>
                           <span className="text-xs font-black text-[#111111] uppercase">Institutional Core</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-black text-[#919191] uppercase tracking-widest italic">Audit Status</span>
                           <span className="text-xs font-black text-rose-500 uppercase">Awaiting Manual Verification</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 mt-10">
                  <Button 
                     variant="outline" 
                     className="flex-1 h-16 rounded-2xl border-none shadow-sm font-black text-[10px] uppercase tracking-widest bg-[#FAFBFC]"
                     onClick={onClose}
                  >
                     Abort Trace
                  </Button>
                  <Button 
                     className="flex-1 h-16 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl transition-all"
                     onClick={() => {
                        onResolve();
                        onClose();
                     }}
                  >
                     Resolve Node
                  </Button>
               </div>
            </div>
         </SheetContent>
      </Sheet>
   );
}

function ArtifactDetailsSidePanel({ isOpen, onClose, report }: any) {
   if (!report) return null;
   return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
         <SheetContent side="right" className="w-full sm:max-w-md bg-white border-none p-0 overflow-hidden shadow-2xl">
            <div className="h-full flex flex-col p-10">
               <div className="flex items-center gap-4 mb-10">
                  <div className="h-14 w-14 rounded-3xl bg-[#111111] flex items-center justify-center shadow-lg shadow-black/10">
                     <FileSearch className="h-8 w-8 text-lime-400" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">
                        Artifact <span className="text-lime-500">Details</span>
                     </h3>
                     <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em]">Master Audit Log Inspection</p>
                  </div>
               </div>

               <div className="space-y-8 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-[#FAFBFC] rounded-3xl border border-[#F0F0F0]">
                        <p className="text-[9px] font-black text-[#919191] uppercase tracking-widest mb-2">Artifact ID</p>
                        <p className="text-sm font-black text-[#111111] uppercase italic tracking-tight">{report.id}</p>
                     </div>
                     <div className="p-5 bg-[#FAFBFC] rounded-3xl border border-[#F0F0F0]">
                        <p className="text-[9px] font-black text-[#919191] uppercase tracking-widest mb-2">Sync Date</p>
                        <p className="text-sm font-black text-[#111111] uppercase italic tracking-tight">{report.date}</p>
                     </div>
                  </div>

                  <div className="p-8 bg-[#111111] rounded-[2.5rem] space-y-6">
                     <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Fiscal Blueprint</span>
                        <span className="text-xs font-black text-lime-400 uppercase italic">{report.name}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Assigned Auditor</span>
                        <span className="text-xs font-black text-white uppercase italic">{report.auditor}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Audit Score</span>
                        <span className="text-xs font-black text-white uppercase italic">{report.score} VERIFIED</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 mt-10">
                  <Button 
                     variant="outline" 
                     className="flex-1 h-16 rounded-2xl border-none shadow-sm font-black text-[10px] uppercase tracking-widest bg-[#FAFBFC]"
                     onClick={() => toast.success("PDF Artifact Prepared", { description: "Download link pushed to terminal." })}
                  >
                     <Download className="h-4 w-4 mr-2" /> PDF Archive
                  </Button>
                  <Button 
                     onClick={onClose}
                     className="flex-1 h-16 bg-[#111111] text-white hover:bg-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                  >
                     Dismiss Artifact
                  </Button>
               </div>
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
              {isComplete ? <CheckCircle2 className="h-10 w-10 text-lime-500 animate-in zoom-in duration-300" /> : <RefreshCw className="h-10 w-10 text-white animate-spin" />}
           </div>
        </div>
        
        <div className="space-y-2">
           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{isComplete ? "Artifact Ready" : "Generating Artifact..."}</h3>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{title}</p>
        </div>

        {isComplete ? (
          <Button onClick={onClose} className="w-full h-14 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-lime-500/20 animate-in slide-in-from-bottom-4 duration-500">
             Clear Console
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
