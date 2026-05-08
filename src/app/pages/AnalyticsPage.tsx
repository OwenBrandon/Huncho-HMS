import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  FileText, 
  Calendar,
  Filter,
  Zap,
  ShieldCheck,
  Users,
  AlertTriangle,
  ChevronRight,
  MousePointer2,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Wallet,
  Landmark,
  Fingerprint,
  Scale,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  History
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  Line,
  Scatter
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { supabase } from '../../lib/supabase';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "../components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const COLORS = ['#D4FF3F', '#111111', '#555555', '#919191'];

export function AnalyticsPage() {
  const { 
    stats, 
    velocityData, 
    sectorData, 
    departmentalBurn: deptBurn, 
    recentTransactions: txns,
    isLoading: isSyncing 
  } = useAnalytics();
  const [timeRange, setTimeRange] = useState('6M');
  const [activeHorizon, setActiveHorizon] = useState<'months' | 'years'>('months');
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessOverlayOpen, setIsProcessOverlayOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState("");

  const handleHorizonChange = (h: 'months' | 'years') => {
    setActiveHorizon(h);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const fiscalVelocityData = velocityData;

  const departmentalBurnData = deptBurn.length > 0 ? deptBurn : [
    { dept: 'Mess', budget: 250000, actual: 230000, var: '+8%' },
    { dept: 'Maint', budget: 150000, actual: 165000, var: '-10%' },
    { dept: 'Security', budget: 80000, actual: 75000, var: '+6%' },
    { dept: 'Admin', budget: 50000, actual: 55000, var: '-10%' },
  ];

  const handleExport = (type: string) => {
    setProcessTitle(type);
    setIsProcessOverlayOpen(true);
  };

  const CATEGORY_COLORS = ['#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'];

  const FiscalHUDTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111] border border-white/10 p-5 rounded-[2rem] shadow-2xl backdrop-blur-xl min-w-[220px]">
           <div className="mb-4">
              <h4 className="text-sm font-black text-white uppercase italic tracking-widest">{label} Forecast</h4>
              <div className="h-1 w-8 bg-lime-500 mt-1 rounded-full" />
           </div>
           
           <div className="space-y-4">
              {[
                { label: 'Booked Revenue', val: payload.find((p: any) => p.dataKey === 'revenue')?.value, color: 'text-white' },
                { label: 'Verified Collection', val: payload.find((p: any) => p.dataKey === 'collection')?.value, color: 'text-lime-400' },
                { label: 'Operational Burn', val: payload.find((p: any) => p.dataKey === 'burn')?.value, color: 'text-slate-400' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col">
                   <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{item.label}</span>
                   <span className={cn("text-lg font-black italic tracking-tighter tabular-nums", item.color)}>
                     CFA {item.val?.toLocaleString()}
                   </span>
                </div>
              ))}
           </div>
           <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Master HUD Interface v2.4</p>
           </div>
        </div>
      );
    }
    return null;
  };

  const BudgetTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const variance = ((data.actual - data.budget) / data.budget) * 100;
      const isOver = variance > 0;

      return (
        <div className="bg-[#111111] border border-white/10 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-xl min-w-[260px]">
           <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-black text-white uppercase italic tracking-widest leading-none mb-1">{data.dept} Division</h4>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Budget Forensics</p>
              </div>
              <Badge className={cn(
                "font-black text-[9px] uppercase px-3 py-1.5 rounded-xl border-none shadow-lg",
                isOver ? "bg-rose-500/20 text-rose-500" : "bg-lime-500/20 text-lime-500"
              )}>
                {Math.abs(variance).toFixed(1)}% {isOver ? 'OVER' : 'UNDER'}
              </Badge>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Allocated Budget</span>
                 <span className="text-xl font-black text-white italic tracking-tighter tabular-nums">CFA {data.budget.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Actual Expenditure</span>
                 <span className="text-xl font-black text-lime-400 italic tracking-tighter tabular-nums">CFA {data.actual.toLocaleString()}</span>
              </div>
           </div>

           <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                 <span>Utilization Index</span>
                 <span className="text-white">{((data.actual / data.budget) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className={cn("h-full rounded-full transition-all duration-1000", isOver ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "bg-lime-500 shadow-[0_0_10px_rgba(212,255,63,0.4)]")}
                   style={{ width: `${Math.min((data.actual / data.budget) * 100, 100)}%` }}
                 />
              </div>
           </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Master Export Terminal */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[#111111] uppercase italic leading-none">
            Fiscal Strategic <span className="text-lime-500">Intelligence</span>
          </h1>
          <p className="text-sm font-medium text-[#919191]">Master analytical suite for institutional liquidity and collection forensics.</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-2xl border border-[#F0F0F0]">
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => handleHorizonChange('months')}
               className={cn("h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeHorizon === 'months' ? "bg-white shadow-sm text-black" : "text-[#919191] hover:text-black")}
            >
               Months
            </Button>
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => handleHorizonChange('years')}
               className={cn("h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeHorizon === 'years' ? "bg-white shadow-sm text-black" : "text-[#919191] hover:text-black")}
            >
               Years
            </Button>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-[#F0F0F0]">
            {activeHorizon === 'months' ? (
               ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTimeRange(m)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      timeRange === m ? "bg-[#111111] text-white shadow-lg" : "text-[#919191] hover:text-[#111111]"
                    )}
                  >
                    {m}
                  </button>
               ))
            ) : (
               ['2024', '2025', '2026'].map((y) => (
                  <button
                    key={y}
                    onClick={() => setTimeRange(y)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      timeRange === y ? "bg-[#111111] text-white shadow-lg" : "text-[#919191] hover:text-[#111111]"
                    )}
                  >
                    {y}
                  </button>
               ))
            )}
            <div className="w-[1px] h-6 bg-[#F0F0F0] mx-2" />
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-none shadow-sm font-black text-[9px] uppercase tracking-widest gap-2 h-10 px-4 bg-lime-500 text-black hover:bg-lime-600 transition-all active:scale-95"
              onClick={() => handleExport('Master Audit Artifact')}
            >
              <Download className="h-4 w-4" /> Export Terminal
            </Button>
          </div>
        </div>
      </div>

      {/* Strategic KPI Cluster */}
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", isRefreshing && "animate-pulse opacity-50")}>
        {[
          { id: 'yield', label: 'Yield Velocity', value: stats?.yieldVelocity || '...', sub: 'Revenue collection growth', icon: TrendingUp, color: 'text-lime-600', bg: 'bg-lime-500/10' },
          { id: 'collection', label: 'Collection Index', value: stats?.collectionIndex || '...', sub: 'Verified vs Expected Inflow', icon: Fingerprint, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { id: 'burn', label: 'Operations Burn', value: stats?.burnRate || '...', sub: 'Revenue vs authorized burn', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-500/10' },
          { id: 'vault', label: 'Vault Liquidity', value: stats?.liquidity || '...', sub: 'Current physical vault volume', icon: Landmark, color: 'text-black', bg: 'bg-black/5' },
        ].map((kpi, idx) => (
          <Card 
            key={idx} 
            className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2.5rem] overflow-hidden group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
            onClick={() => { setSelectedKpi(kpi); setActiveSheet(`kpi-${kpi.id}`); }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", kpi.bg)}>
                   <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </div>
                <Badge className="bg-[#111111] text-lime-400 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none shadow-lg shadow-black/20 flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-lime-500 mr-1.5 animate-pulse" />
                  Live Sync
                </Badge>
              </div>
              <h3 className="text-4xl font-black text-[#111111] leading-none mb-1 tabular-nums tracking-tighter italic">{kpi.value}</h3>
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#111111] leading-none mb-1">{kpi.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#919191] italic">{kpi.sub}</span>
                  <div className="h-6 w-6 rounded-full bg-[#FAFBFC] flex items-center justify-center group-hover:bg-lime-500 transition-colors">
                    <ChevronRight className="h-3 w-3 text-[#111111] group-hover:text-black" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* High-Fidelity Fiscal Visuals */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8", isRefreshing && "animate-pulse")}>
        <Card 
          className="border-none shadow-2xl shadow-black/20 bg-[#0B1120] rounded-[3rem] overflow-hidden cursor-zoom-in hover:scale-[1.01] transition-all group"
          onClick={() => setActiveSheet('velocity-terminal')}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight underline decoration-lime-500/20 underline-offset-8">Fiscal <span className="text-lime-500 italic">Velocity</span></h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Master Revenue vs Verified Collection • last 6 months</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-lime-500 shadow-[0_0_10px_rgba(212,255,63,0.4)]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Verified Collection</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-4 bg-white" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Booked Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={fiscalVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4FF3F" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#D4FF3F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }} 
                    dy={10}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }} 
                  />
                  <Tooltip 
                    content={<FiscalHUDTooltip />}
                    cursor={{ stroke: '#D4FF3F', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="collection" stroke="#D4FF3F" strokeWidth={0} fillOpacity={1} fill="url(#colorColl)" />
                  <Line type="monotone" dataKey="revenue" stroke="#FFFFFF" strokeWidth={5} dot={{ r: 5, fill: '#FFFFFF', stroke: '#D4FF3F', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  <Bar dataKey="burn" radius={[4, 4, 0, 0]} barSize={20}>
                    {fiscalVelocityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#3B82F6', '#60A5FA'][index]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[3rem] overflow-hidden cursor-zoom-in hover:scale-[1.01] transition-all group"
          onClick={() => setActiveSheet('budget-alignment')}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8 text-white">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight underline decoration-lime-500/20 underline-offset-8">Budgetary <span className="text-lime-500 italic">Alignment</span></h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Departmental Variance • Approved vs Actual Burn</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <Scale className="h-5 w-5 text-lime-400" />
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentalBurnData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="dept" 
                    type="category"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }} 
                  />
                  <Tooltip 
                    content={<BudgetTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="budget" fill="rgba(255,255,255,0.05)" radius={[0, 8, 8, 0]} barSize={24} />
                  <Bar dataKey="actual" radius={[0, 8, 8, 0]} barSize={24}>
                    {departmentalBurnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[3rem] overflow-hidden lg:col-span-1 flex flex-col">
          <CardContent className="p-8 flex-1 flex flex-col">
            <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight mb-1">Sector <span className="text-lime-500 italic">Concentration</span></h3>
            <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mb-8">Yield contribution by student tier</p>
            <div className="flex-1 min-h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData.length > 0 ? sectorData : [
                      { name: 'No Data', value: 1, color: '#EDEDED' }
                    ]}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {sectorData.length > 0 ? sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    )) : (
                      <Cell fill="#EDEDED" stroke="none" />
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">Master</p>
                 <p className="text-2xl font-black text-[#111111] uppercase tracking-tighter">YIELD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[3rem] overflow-hidden flex-1 relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldAlert className="h-40 w-40 text-lime-500" />
            </div>
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Predictive <span className="text-lime-500 italic">Forensics</span></h3>
                <Badge className="bg-lime-500/20 text-lime-500 text-[8px] uppercase tracking-widest border-none px-3 py-1">Fiscal AI Engine Active</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'leakage', title: 'Revenue Leakage', desc: 'Overdue hostel fees reaching CFA 85k in Block A nodes.', action: 'Trigger Collection Protocol', icon: TrendingDown, color: 'text-rose-500' },
                  { id: 'liquidity', title: 'Liquidity Optimization', desc: 'Predicted 15% shortfall in mess funds by week 3.', action: 'Adjust Disbursement', icon: Zap, color: 'text-amber-500' },
                  { id: 'deficit', title: 'Deficit Forecast', desc: 'Maintenance burn exceeding baseline by 12.4%.', action: 'Review Requisitions', icon: History, color: 'text-white' },
                  { id: 'yield', title: 'Yield Prediction', desc: 'Institutional yield expected to hit 98% via physical sync.', action: 'Audit Preparation', icon: TrendingUp, color: 'text-lime-500' },
                ].map((insight, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/5 p-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => setActiveModal(`insight-${insight.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center")}>
                         <insight.icon className={cn("h-4 w-4", insight.color)} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-lime-500 transition-colors" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{insight.title}</h4>
                    <p className="text-[10px] text-white/40 font-medium mb-4 leading-relaxed italic">{insight.desc}</p>
                    <button className="text-[9px] font-black text-lime-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                      {insight.action}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={!!activeSheet} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-white border-none p-0 overflow-hidden shadow-2xl z-[200]">
           <div className="h-full flex flex-col">
              <div className="p-10 bg-[#111111] text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Activity className="h-40 w-40 text-lime-500" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="h-12 w-12 rounded-2xl bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/20">
                          <Fingerprint className="h-6 w-6 text-black" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">
                             Node <span className="text-lime-500">Forensics</span>
                          </h3>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Institutional Deep Vector Analysis</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-8">
                       <div className="p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Subject Context</p>
                          <p className="text-sm font-black text-white uppercase italic tracking-tight">{selectedKpi?.label || activeSheet?.replace('-', ' ').toUpperCase()}</p>
                       </div>
                       <div className="p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Current Delta</p>
                          <p className="text-sm font-black text-lime-400 italic tracking-tight">{selectedKpi?.value || 'VERIFIED'}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] italic">Transaction Distribution Matrix</h4>
                       <Badge className="bg-[#FAFBFC] text-[#919191] border-none font-black text-[8px] uppercase tracking-widest">Active Horizon: {timeRange}</Badge>
                    </div>
                    
                    <div className="space-y-4">
                        {txns && txns.length > 0 ? txns.map((txn: any, i: number) => (
                           <div key={i} className="group p-5 bg-white rounded-3xl border border-[#F0F0F0] hover:border-lime-500/30 transition-all flex items-center justify-between cursor-pointer">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 rounded-2xl bg-[#FAFBFC] flex items-center justify-center group-hover:bg-lime-50 transition-colors">
                                    <ArrowUpRight className="h-5 w-5 text-lime-600" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">{txn.id}</p>
                                    <p className="text-xs font-black text-[#111111] uppercase italic tracking-tight">{txn.label}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-sm font-black text-[#111111] tabular-nums tracking-tighter">CFA {txn.amount.toLocaleString()}</p>
                                 <p className="text-[8px] font-black text-lime-500 uppercase tracking-widest mt-1">{txn.type === 'sync' ? 'Surgical Sync' : 'Manual Entry'}</p>
                              </div>
                           </div>
                        )) : (
                          <div className="h-32 flex flex-col items-center justify-center bg-[#FAFBFC] rounded-3xl border border-dashed border-[#F0F0F0]">
                             <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic">No Recent Artifacts</p>
                          </div>
                        )}
                    </div>
                 </div>

                 <div className="p-8 bg-[#111111] rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                       <Zap className="h-20 w-20 text-lime-500" />
                    </div>
                    <div className="relative z-10">
                       <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">Automated Audit Protocol</h4>
                       <p className="text-[10px] text-white/40 font-medium italic mb-6 leading-relaxed">
                          Initialize a forensic scan across all distributed ledger nodes to verify current liquidity velocity and yield concentration variables.
                       </p>
                       <Button 
                          className="h-12 w-full bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-lime-500/20"
                          onClick={() => toast.success("Audit Protocol Injected", { description: "Forensic scanning initialized for active duration nodes." })}
                       >
                          Initialize Audit Trace
                       </Button>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-[#FAFBFC] border-t border-[#F0F0F0] flex gap-4">
                 <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-2xl border-none shadow-sm font-black text-[10px] uppercase tracking-widest bg-white"
                    onClick={() => handleExport('Forensic Subset')}
                 >
                    <Download className="h-4 w-4 mr-2" /> PDF Artifact
                 </Button>
                 <Button 
                    onClick={() => setActiveSheet(null)}
                    className="flex-1 h-14 bg-[#111111] text-white hover:bg-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                 >
                    Dismiss Console
                 </Button>
              </div>
           </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md bg-white border-none rounded-[3.5rem] p-0 overflow-hidden shadow-2xl z-[300]">
           <div className="p-10 border-b border-[#F5F5F5] bg-[#FAFBFC]">
              <div className="flex items-center gap-4">
                 <div className="h-14 w-14 rounded-3xl bg-lime-500/10 flex items-center justify-center shadow-inner">
                    <ShieldAlert className="h-8 w-8 text-lime-600" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">
                       Strategic <span className="text-lime-500 italic">Action</span>
                    </h3>
                    <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Decision Matrix Protocol v4.1</p>
                 </div>
              </div>
           </div>

           <div className="p-10 space-y-8">
              <div className="p-8 bg-[#111111] rounded-[2.5rem] text-center space-y-4">
                 <div className="mx-auto h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                    <Zap className="h-10 w-10 text-lime-400" />
                 </div>
                 <h4 className="text-xl font-black text-white uppercase italic tracking-tighter underline decoration-lime-500/30 underline-offset-8">
                    {activeModal?.split('-')[1].toUpperCase()} PROTOCOL
                 </h4>
                 <p className="text-[11px] font-medium text-white/40 italic leading-relaxed px-4">
                    Authorizing this procedure will initiate a system-wide adjustment to institutional liquidity nodes and authorized burn vectors.
                 </p>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-[#919191] uppercase tracking-widest">Risk Assessment Node</span>
                    <Badge className="bg-lime-500/10 text-lime-600 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1">OPTIMAL</Badge>
                 </div>
                 <div className="p-6 bg-[#FAFBFC] rounded-3xl border border-[#F0F0F0] space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-[#919191] uppercase tracking-widest italic">Impact Radius</span>
                       <span className="text-xs font-black text-[#111111] uppercase">Institutional Core</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-[#919191] uppercase tracking-widest italic">Temporal Window</span>
                       <span className="text-xs font-black text-[#111111] uppercase">Immediate Execute</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 bg-[#FAFBFC] border-t border-[#F5F5F5] flex gap-4">
              <Button 
                 variant="ghost" 
                 className="flex-1 h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#919191]"
                 onClick={() => setActiveModal(null)}
              >
                 Abort Matrix
              </Button>
              <Button 
                 className="flex-1 h-16 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl transition-all"
                 onClick={() => {
                    toast.success("Strategic Protocol Executed", { description: "The authorized liquidity adjustment is now propagating through the system." });
                    setActiveModal(null);
                 }}
              >
                 Authorize Protocol
              </Button>
           </div>
        </DialogContent>
      </Dialog>
      <ProcessOverlay 
        isOpen={isProcessOverlayOpen} 
        onClose={() => setIsProcessOverlayOpen(false)} 
        title={processTitle} 
      />
    </div>
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
              {isComplete ? <ShieldCheck className="h-10 w-10 text-lime-500 animate-in zoom-in duration-300" /> : <TrendingUp className="h-10 w-10 text-white animate-pulse" />}
           </div>
        </div>
        
        <div className="space-y-2">
           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{isComplete ? "Data Synchronized" : "Analyzing Metrics..."}</h3>
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
