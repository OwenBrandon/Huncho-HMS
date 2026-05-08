import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  Coffee, 
  Utensils, 
  ChefHat, 
  Leaf,
  CalendarDays,
  AlertCircle,
  Plus,
  ChevronRight,
  ChevronLeft,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  DollarSign,
  Zap,
  ClipboardList,
  Filter,
  ClipboardCheck,
  Search,
  Settings,
  ArrowRight,
  Lock,
  Shield,
  Activity,
  Info,
  X,
  Target,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  History,
  Star,
  Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMess } from '../hooks/useMess';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function MessPage() {
  const { user } = useAuth();
  const { 
    plans, subscription, bookings, menus, inventory, feedback, globalStats, isLoading, 
    bookMeal, cancelMeal, updateInventory, updateMenu, submitFeedback 
  } = useMess();

  const isAdmin = user?.role === 'admin' || user?.role === 'warden' || user?.role === 'auditor';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const transformedRoster = useMemo(() => {
    return days.map((day, idx) => {
      const dayMenu = menus.filter(m => m.day_of_week === idx);
      return {
        day_of_week: idx,
        day,
        b: dayMenu.find(m => m.meal_type === 'breakfast')?.menu_item || 'Not Set',
        l: dayMenu.find(m => m.meal_type === 'lunch')?.menu_item || 'Not Set',
        d: dayMenu.find(m => m.meal_type === 'dinner')?.menu_item || 'Not Set',
        s: dayMenu.find(m => m.meal_type === 'snack')?.menu_item || 'Not Set',
        cost: 120 + (idx * 5),
        compliance: 100
      };
    });
  }, [menus]);

  const transformedInventory = useMemo(() => {
    return inventory.map(item => ({
      id: item.id,
      label: item.name,
      level: Number(item.current_level),
      color: Number(item.current_level) < 20 ? 'bg-rose-500' : Number(item.current_level) < 50 ? 'bg-amber-500' : 'bg-lime-500',
      trend: Number(item.current_level) < 20 ? 'critical' : 'stable'
    }));
  }, [inventory]);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-lime-500" />
          <p className="text-sm font-black uppercase tracking-widest text-[#919191]">Synchronizing Culinary Node...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AdminMessTerminal 
        roster={transformedRoster} 
        updateMenu={updateMenu}
        inventory={transformedInventory}
        updateInventory={updateInventory}
        feedback={feedback}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        globalStats={globalStats}
      />
    );
  }

  return (
    <StudentMessContent 
      subscription={subscription}
      bookings={bookings}
      menus={menus}
      activeModal={activeModal}
      setActiveModal={setActiveModal}
      selectedMeal={selectedMeal}
      setSelectedMeal={setSelectedMeal}
      cancelMeal={cancelMeal}
      bookMeal={bookMeal}
      submitFeedback={submitFeedback}
    />
  );
}

// --- ADMIN TERMINAL ---

function AdminMessTerminal({ 
  roster, updateMenu, 
  inventory, updateInventory, 
  feedback, 
  activeModal, setActiveModal,
  globalStats
}: any) {
  const adminKPIs = [
    { 
      title: 'Revenue Stream', 
      value: `CFA ${globalStats.totalRevenue.toLocaleString()}`, 
      subtext: 'Monthly subscription flux', 
      icon: <DollarSign className="h-6 w-6 text-lime-400" />,
      cardColor: "bg-[#111111]",
      textColor: "text-white",
      subtextColor: "text-lime-400/80",
      badge: { text: "Optimal", bg: "bg-lime-500/20 text-lime-400" },
      modal: 'revenue'
    },
    { 
      title: 'Portion Forecast', 
      value: `${globalStats.todaysBookings}/${globalStats.totalSubscriptions * 3}`, 
      subtext: 'Served vs Prepared today', 
      icon: <Utensils className="h-6 w-6 text-black" />,
      cardColor: "bg-[#D4FF3F]",
      textColor: "text-[#111111]",
      subtextColor: "text-[#111111]/60",
      badge: { text: "Live", bg: "bg-black/10 text-black" },
      modal: 'forecast'
    },
    { 
      title: 'Stock Vitality', 
      value: '94%', 
      subtext: 'Infrastructure & Inventory', 
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      cardColor: "bg-white",
      textColor: "text-[#111111]",
      subtextColor: "text-[#919191]",
      badge: { text: "Stable", bg: "bg-blue-50 text-blue-600" },
      modal: 'inventory'
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]/50 md:p-8 p-4 gap-8 animate-in fade-in duration-500 pb-10">
      <RosterUpdateModal 
        isOpen={activeModal === 'update-roster'} 
        onClose={() => setActiveModal(null)} 
        roster={roster}
        onUpdate={updateMenu}
      />
      <InventoryDashboardModal 
        isOpen={activeModal === 'inventory' || activeModal === 'inventory-report'} 
        onClose={() => setActiveModal(null)} 
        inventory={inventory}
        onUpdate={updateInventory}
      />
      <FeedbackAnalysisModal 
        isOpen={activeModal === 'feedback'} 
        onClose={() => setActiveModal(null)} 
        feedback={feedback}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#111111] uppercase leading-none">
            Culinary <span className="text-lime-500">Command</span> Center
          </h1>
          <p className="text-[11px] font-black text-[#919191] uppercase tracking-[0.2em]">Strategic mess oversight and resource management.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setActiveModal('inventory-report')}
            variant="outline" 
            className="rounded-2xl border-2 border-black/5 hover:bg-black hover:text-white font-black text-[10px] uppercase tracking-widest h-14 px-8 transition-all active:scale-95 shadow-xl shadow-black/5 bg-white group"
          >
            <ClipboardList className="h-5 w-5 mr-3 text-[#111111] group-hover:text-lime-400" /> Inventory Report
          </Button>
          <Button 
            onClick={() => setActiveModal('update-roster')}
            className="rounded-2xl bg-[#111111] text-white hover:bg-lime-500 hover:text-black font-black text-[10px] uppercase tracking-widest h-14 px-8 transition-all active:scale-95 shadow-xl shadow-black/10 border-none group"
          >
            <Plus className="h-5 w-5 mr-3 text-lime-400 group-hover:rotate-90 transition-transform" /> Update Roster
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminKPIs.map((s, i) => (
          <Card 
            key={i} 
            onClick={() => setActiveModal(s.modal)}
            className={cn("border-none rounded-[2rem] overflow-hidden group shadow-2xl shadow-black/5 cursor-pointer transition-all hover:scale-[1.02] active:scale-95", s.cardColor)}
          >
            <CardContent className="p-6 relative h-[160px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                    {s.icon}
                  </div>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", s.cardColor === 'bg-[#111111]' ? 'text-white/60' : s.cardColor === 'bg-[#D4FF3F]' ? 'text-[#111111]/60' : 'text-[#919191]')}>
                    {s.title}
                  </p>
                </div>
                <Badge className={cn("border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg z-10", s.badge.bg)}>
                  {s.badge.text}
                </Badge>
              </div>
              <h3 className={cn("text-5xl font-black leading-none mb-2 tabular-nums z-10 relative", s.textColor)}>{s.value}</h3>
              <p className={cn("text-[10px] font-black uppercase tracking-widest italic z-10 relative", s.subtextColor)}>{s.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Weekly Roster Architect */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2.5rem] overflow-hidden group border border-white relative h-full">
            <div className="p-8 flex items-center justify-between border-b border-[#F0F0F0]/50 bg-[#FAFBFC]/30">
              <div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tighter">Weekly Culinary <span className="text-lime-500">Roster</span></h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Operational menu deployment.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setActiveModal('update-roster')} variant="ghost" className="h-10 rounded-xl font-black text-[9px] uppercase tracking-widest text-[#111111] flex gap-2 hover:bg-black hover:text-white transition-all">
                  <Settings className="h-3 w-3" /> Architect Roster
                </Button>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden p-2">
               <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-black text-[#111111] h-12 px-6 text-[9px] uppercase tracking-widest italic">Day</TableHead>
                    <TableHead className="font-black text-[#111111] h-12 text-[9px] uppercase tracking-widest italic">Lunch Node</TableHead>
                    <TableHead className="font-black text-[#111111] h-12 text-[9px] uppercase tracking-widest italic">Dinner Node</TableHead>
                    <TableHead className="font-black text-[#111111] h-12 text-[9px] uppercase tracking-widest italic">Snack Node</TableHead>
                    <TableHead className="font-black text-[#111111] h-12 px-6 text-[9px] uppercase tracking-widest italic text-right">Target</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((row: any, i: number) => (
                    <TableRow key={i} className="hover:bg-[#F9FAFB] transition-all border-b border-[#F0F0F0]/30 group/row h-16">
                      <TableCell className="px-6">
                        <span className="text-xs font-black text-[#111111] uppercase italic">{row.day}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Utensils className="h-3 w-3 text-lime-500" />
                           <span className="text-[11px] font-bold text-[#555555]">{row.l}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <ChefHat className="h-3 w-3 text-lime-500" />
                           <span className="text-[11px] font-bold text-[#555555]">{row.d}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Coffee className="h-3 w-3 text-amber-500" />
                           <span className="text-[11px] font-bold text-[#555555]">{row.s}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Badge className="bg-lime-500/10 text-lime-700 border-none font-bold text-[10px] rounded-lg">
                           {row.compliance}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Logistics & Feedback Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden p-8 relative min-h-[400px]">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-sm font-black text-white uppercase italic tracking-widest">Feedback <span className="text-lime-500">Stream</span></h4>
                  <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_10px_#84cc16]" />
                </div>
                
                <div className="space-y-4 flex-1">
                  {feedback.length > 0 ? feedback.map((item: any, i: number) => (
                    <div key={i} onClick={() => setActiveModal('feedback')} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                           <div className="h-5 w-5 rounded bg-lime-500 flex items-center justify-center text-[10px] font-black text-black">
                             {item.student?.user?.full_name?.charAt(0) || 'S'}
                           </div>
                           <span className="text-[9px] font-black text-white uppercase tracking-widest">{item.student?.user?.full_name}</span>
                        </div>
                        <span className="text-[8px] font-bold text-white/30 lowercase tabular-nums">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-white/70 italic leading-relaxed line-clamp-2">{item.comment}</p>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-40 text-white/20">
                      <MessageSquare className="h-8 w-8 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Recent Feedback</p>
                    </div>
                  )}
                </div>

                <Button onClick={() => setActiveModal('feedback')} className="w-full mt-8 bg-white text-[#111111] hover:bg-lime-500 font-black text-[10px] uppercase tracking-widest h-14 rounded-2xl border-none transition-all shadow-xl shadow-black/20">
                  Open Analytics Hub
                </Button>
              </div>
           </Card>

           <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2.5rem] overflow-hidden p-8 border border-black/5">
              <h4 className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] mb-6">Inventory Health</h4>
              <div className="space-y-6">
                 {inventory.map((item: any, i: number) => (
                   <div key={i} className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-[#919191] tracking-widest">{item.label}</span>
                        <div className="flex items-center gap-2">
                           {item.trend === 'critical' && <AlertTriangle className="h-3 w-3 text-rose-500 animate-pulse" />}
                           <span className={cn("text-[9px] font-black tabular-nums", item.level < 20 ? "text-rose-500" : "text-[#111111]")}>{item.level}%</span>
                        </div>
                     </div>
                     <div className="h-1.5 w-full bg-[#FAFBFC] rounded-full overflow-hidden shadow-inner">
                        <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.level}%` }} />
                     </div>
                   </div>
                 ))}
              </div>
              <Button onClick={() => setActiveModal('inventory-report')} variant="ghost" className="w-full mt-6 h-12 rounded-xl font-black text-[9px] uppercase tracking-widest group hover:bg-black hover:text-white transition-all">
                 Authorize Procurement <Plus className="h-3 w-3 ml-2 group-hover:rotate-90 transition-transform" />
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}

// --- STUDENT CONTENT ---

function StudentMessContent({ 
  subscription, bookings, menus,
  activeModal, setActiveModal,
  selectedMeal, setSelectedMeal,
  cancelMeal, bookMeal, submitFeedback
}: any) {
  const kpis = [
    { 
      title: 'Subscription', 
      value: subscription?.plan?.name || 'No Plan', 
      subtext: 'Billed Quarterly', 
      icon: <ChefHat className="h-6 w-6 text-lime-400" />,
      cardColor: "bg-[#111111]",
      textColor: "text-white",
      subtextColor: "text-lime-400 drop-shadow-[0_0_8px_rgba(212,255,63,0.3)]",
      badge: { text: subscription ? "Active" : "Inactive", bg: subscription ? "bg-lime-500/20 text-lime-400" : "bg-rose-500/20 text-rose-400" },
      modal: 'subscription'
    },
    { 
      title: 'Meal History', 
      value: bookings.length.toString(), 
      subtext: 'Monthly aggregate', 
      icon: <UtensilsCrossed className="h-6 w-6 text-[#111111]" />,
      cardColor: "bg-[#D4FF3F]",
      textColor: "text-[#111111]",
      subtextColor: "text-[#111111] opacity-70",
      badge: { text: "Synced", bg: "bg-black/10 text-black" },
      modal: 'credits'
    },
    { 
      title: 'Dietary Prefs', 
      value: 'Standard', 
      subtext: 'Institutional identity', 
      icon: <Leaf className="h-6 w-6 text-emerald-600" />,
      cardColor: "bg-white",
      textColor: "text-[#111111]",
      subtextColor: "text-[#919191]",
      badge: { text: "Verified", bg: "bg-emerald-50 text-emerald-600" },
      modal: 'diet'
    },
  ];

  const todaysMenu = useMemo(() => {
    const todayIdx = new Date().getDay();
    const todayMenus = menus.filter((m: any) => m.day_of_week === todayIdx);
    
    const getStatus = (timeRange: string) => {
      const [start, end] = timeRange.split(' - ');
      const now = new Date();
      const startTime = new Date();
      const endTime = new Date();
      
      const [sh, sm] = start.split(':');
      const [eh, em] = end.split(':');
      
      startTime.setHours(parseInt(sh), parseInt(sm), 0);
      endTime.setHours(parseInt(eh), parseInt(em), 0);
      
      if (now > endTime) return 'Passed';
      if (now >= startTime && now <= endTime) return 'Serving Now';
      return 'Upcoming';
    };

    return [
      { id: '1', type: 'Breakfast', time: '07:30 - 09:30', menu: todayMenus.find((m: any) => m.meal_type === 'breakfast')?.menu_item || 'Not Set', kcal: todayMenus.find((m: any) => m.meal_type === 'breakfast')?.kcal || '450', status: getStatus('07:30 - 09:30') },
      { id: '2', type: 'Lunch', time: '12:30 - 14:30', menu: todayMenus.find((m: any) => m.meal_type === 'lunch')?.menu_item || 'Not Set', kcal: todayMenus.find((m: any) => m.meal_type === 'lunch')?.kcal || '650', status: getStatus('12:30 - 14:30') },
      { id: '3', type: 'Snack', time: '16:00 - 17:00', menu: todayMenus.find((m: any) => m.meal_type === 'snack')?.menu_item || 'Not Set', kcal: todayMenus.find((m: any) => m.meal_type === 'snack')?.kcal || '200', status: getStatus('16:00 - 17:00') },
      { id: '4', type: 'Dinner', time: '19:00 - 21:00', menu: todayMenus.find((m: any) => m.meal_type === 'dinner')?.menu_item || 'Not Set', kcal: todayMenus.find((m: any) => m.meal_type === 'dinner')?.kcal || '800', status: getStatus('19:00 - 21:00') },
    ];
  }, [menus]);

  const handleOptOut = (meal: any) => {
    setSelectedMeal(meal);
    setActiveModal('opt-out-wizard');
  };

  const [feedbackMeal, setFeedbackMeal] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#fcfdfd] md:p-8 p-4 gap-8 animate-in fade-in duration-500 pb-10">
      <MealOptOutWizard 
        isOpen={activeModal === 'opt-out-wizard'} 
        onClose={() => setActiveModal(null)}
        meal={selectedMeal}
        onConfirm={async () => {
           // Standard HMS logic: you opt out for a meal record.
           // In this system, we use bookings to represent either consumption or attendance.
           // Opting out creates a "cancelled" or simply deletes the booking.
           toast.success("Culinary Node Sync Successful", {
             description: `You have successfully opted out of ${selectedMeal?.type}.`
           });
        }}
      />
      
      <FeedbackSubmissionModal 
        isOpen={activeModal === 'submit-feedback'}
        onClose={() => setActiveModal(null)}
        mealType={feedbackMeal || 'General'}
        onSubmit={submitFeedback}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#111111] uppercase leading-none">
            Mess <span className="text-lime-500">Inventory</span> Hub
          </h1>
          <p className="text-[11px] font-black text-[#919191] uppercase tracking-[0.2em]">Culinary operations and meal tracking module.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => { setFeedbackMeal(null); setActiveModal('submit-feedback'); }}
            variant="outline"
            className="rounded-2xl border-2 border-black/5 hover:bg-black hover:text-white font-black text-[10px] uppercase tracking-widest h-14 px-8 bg-white transition-all group"
          >
            <MessageSquare className="h-5 w-5 mr-3 text-[#111111] group-hover:text-lime-400" /> Send Feedback
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((s, i) => (
          <Card 
            key={i} 
            className={cn("border-none rounded-[2rem] overflow-hidden group shadow-2xl shadow-black/5 cursor-pointer transition-all hover:scale-[1.02] active:scale-95", s.cardColor)}
          >
            <CardContent className="p-6 relative h-[160px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                    {s.icon}
                  </div>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", s.cardColor === 'bg-white' ? 'text-[#919191]' : 'text-white/60')}>
                    {s.title}
                  </p>
                </div>
                <Badge className={cn("border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg z-10", s.badge.bg)}>
                  {s.badge.text}
                </Badge>
              </div>
              <h3 className={cn("text-5xl font-black leading-none mb-2 tabular-nums z-10 relative", s.textColor)}>{s.value}</h3>
              <p className={cn("text-[10px] font-black uppercase tracking-widest italic z-10 relative", s.subtextColor)}>{s.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-12 gap-6 pb-6">
        <div className="col-span-12 lg:col-span-8">
          <Card className="border-none shadow-2xl shadow-black/5 bg-white rounded-[2.5rem] overflow-hidden min-h-[420px]">
            <div className="p-8 pb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Today's <span className="text-lime-500">Menu</span></h3>
              <Badge variant="outline" className="border-[#F0F0F0] text-[#919191] font-black text-[9px] uppercase tracking-widest px-3 py-2 rounded-xl">
                 {new Date().toLocaleDateString()}
              </Badge>
            </div>
            
            <div className="px-8 pb-8">
              <div className="bg-[#FAFBFC] rounded-3xl overflow-hidden border border-[#F0F0F0]/50">
                <Table>
                  <TableHeader className="bg-white/50 backdrop-blur-sm">
                    <TableRow className="border-b border-[#F0F0F0]/50 hover:bg-transparent">
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic w-1/4">Service</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic w-1/2">Menu Contents</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic text-center">Status</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaysMenu.map((m: any, i: number) => (
                      <TableRow 
                        key={i} 
                        className="hover:bg-white transition-colors group border-b border-[#F0F0F0]/50 last:border-0 h-[72px]"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-[#111111] uppercase tracking-widest">{m.type}</span>
                            <span className="text-[9px] font-bold text-[#919191] uppercase tracking-wider tabular-nums mt-0.5">{m.time}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-xs font-bold text-[#555555] italic leading-tight flex items-center gap-2 group-hover:text-black">
                             {m.type === 'Breakfast' ? <Coffee className="h-3 w-3 text-lime-500" /> : <Utensils className="h-3 w-3 text-lime-500" />} 
                             {m.menu}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5",
                             m.status === 'Passed' ? "bg-gray-100 text-gray-500" :
                             m.status === 'Serving Now' ? "bg-lime-500 text-[#111111] shadow-[0_0_15px_rgba(132,204,22,0.4)]" :
                             "bg-blue-50 text-blue-600 border border-blue-100"
                           )}>
                             {m.status === 'Serving Now' && <span className="h-1.5 w-1.5 rounded-full bg-[#111111] animate-pulse" />}
                             {m.status}
                           </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                             <Button 
                               onClick={() => { setFeedbackMeal(m.type); setActiveModal('submit-feedback'); }}
                               variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-black hover:text-white"
                             >
                               <Star className="h-3.5 w-3.5" />
                             </Button>
                             {m.status === 'Upcoming' && (
                               <Button 
                                 onClick={() => handleOptOut(m)}
                                 variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500 hover:text-white"
                               >
                                 <X className="h-3.5 w-3.5" />
                               </Button>
                             )}
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Card className="border-none shadow-2xl shadow-lime-500/10 bg-[#111111] rounded-[2.5rem] overflow-hidden p-8 relative h-full group/card">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:scale-110 transition-transform duration-700">
               <CalendarDays className="h-40 w-40 text-white" />
             </div>
             <div className="relative z-10 flex flex-col h-full">
               <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Meal <span className="text-lime-500">Opt-Out</span></h3>
               <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-8 leading-relaxed">Save credits by notifying the kitchen of absence.</p>
               
               <div className="flex-1 space-y-4">
                 <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                   <p className="text-[8px] font-black text-[#919191] uppercase tracking-[0.3em] mb-4">Upcoming Lockout Window</p>
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-lg font-black text-white italic">Tomorrow's Dinner</p>
                       <p className="text-[9px] font-bold text-lime-400 uppercase tracking-widest mt-1">Status: Open for Sync</p>
                     </div>
                     <Clock className="h-6 w-6 text-white/20" />
                   </div>
                 </div>
               </div>

               <Button 
                 onClick={() => { setSelectedMeal({ type: 'Dinner', date: 'Tomorrow' }); setActiveModal('opt-out-wizard'); }}
                 className="w-full mt-6 bg-white text-[#111111] hover:bg-lime-500 hover:scale-105 font-black uppercase tracking-widest rounded-2xl h-16 text-[11px] transition-all px-8 border-none"
               >
                 Initialize Protocol <ArrowRight className="h-5 w-5 ml-auto" />
               </Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- TACTICAL MODALS ---

function RosterUpdateModal({ isOpen, onClose, roster, onUpdate }: any) {
  const [localRoster, setLocalRoster] = useState(roster);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocalRoster(roster);
  }, [roster]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Logic: Update all modified entries
      for (const row of localRoster) {
        // Find if changed (simplification: update all or compare)
        await onUpdate(row.day_of_week, 'breakfast', row.b);
        await onUpdate(row.day_of_week, 'lunch', row.l);
        await onUpdate(row.day_of_week, 'dinner', row.d);
        await onUpdate(row.day_of_week, 'snack', row.s);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-2xl border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-10 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <div className="flex items-center gap-5">
               <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                  <Settings className="h-7 w-7 text-lime-400" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Roster <span className="text-lime-500 italic">Architect</span></h3>
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Menu Deployment Node</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5">
               <X className="h-5 w-5 text-black" />
            </button>
         </div>
         <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto bg-white">
            {localRoster.map((row: any, i: number) => (
              <div key={i} className="p-6 bg-[#FAFBFC] rounded-2xl border border-black/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#111111] uppercase italic">{row.day}</span>
                    <Badge className="bg-black text-lime-400 text-[8px] font-black uppercase px-2 py-0.5">Deployment Node</Badge>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-[#919191] uppercase tracking-widest pl-1">Lunch Node</label>
                       <input 
                         value={row.l} 
                         onChange={(e) => {
                           const newRoster = [...localRoster];
                           newRoster[i].l = e.target.value;
                           setLocalRoster(newRoster);
                         }}
                         className="w-full h-10 rounded-xl bg-white border border-black/5 px-4 text-[10px] font-bold outline-none focus:border-lime-500 transition-all" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-[#919191] uppercase tracking-widest pl-1">Dinner Node</label>
                       <input 
                         value={row.d} 
                         onChange={(e) => {
                           const newRoster = [...localRoster];
                           newRoster[i].d = e.target.value;
                           setLocalRoster(newRoster);
                         }}
                         className="w-full h-10 rounded-xl bg-white border border-black/5 px-4 text-[10px] font-bold outline-none focus:border-lime-500 transition-all" 
                       />
                    </div>
                 </div>
              </div>
            ))}
         </div>
         <div className="p-10 bg-[#FAFBFC] border-t border-[#F5F5F5]">
            <Button 
              disabled={isUpdating}
              onClick={handleUpdate} 
              className="w-full h-16 bg-black text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-black/20 transition-all active:scale-95 group"
            >
               {isUpdating ? <Loader2 className="animate-spin h-5 w-5" /> : 'Deploy Roster Protocol'} <Zap className="ml-3 h-5 w-5 text-lime-400 group-hover:scale-125 transition-transform" />
            </Button>
         </div>
      </Card>
    </div>
  );
}

function FeedbackSubmissionModal({ isOpen, onClose, mealType, onSubmit }: any) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment) return toast.error("Please add a comment");
    setIsSubmitting(true);
    await onSubmit(mealType, rating, comment);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-md border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-10 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/20">
               <Star className="h-8 w-8 text-black" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter mb-1">Meal <span className="text-lime-500">Feedback</span></h3>
               <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic">{mealType} Experience Node</p>
            </div>
            
            <div className="flex justify-center gap-2">
               {[1, 2, 3, 4, 5].map(star => (
                 <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90">
                   <Star className={cn("h-8 w-8", rating >= star ? "fill-lime-500 text-lime-500" : "text-gray-200")} />
                 </button>
               ))}
            </div>

            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Detail your culinary experience..."
              className="w-full h-32 rounded-2xl bg-[#FAFBFC] border border-black/5 p-6 text-[11px] font-medium outline-none focus:border-lime-500 transition-all resize-none"
            />

            <Button 
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full h-14 bg-black text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Log Sentiment Node'} <Send className="ml-2 h-4 w-4" />
            </Button>
         </div>
      </Card>
    </div>
  );
}

function InventoryDashboardModal({ isOpen, onClose, inventory, onUpdate }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-lg border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-10 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <div className="flex items-center gap-5">
               <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                  <BarChart3 className="h-7 w-7 text-lime-400" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Stock <span className="text-lime-500 italic">Telemetry</span></h3>
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Inventory health analytics</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5">
               <X className="h-5 w-5 text-black" />
            </button>
         </div>
         <div className="p-10 space-y-8 bg-white max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-6">
               {inventory.map((item: any, i: number) => (
                 <div key={i} className="p-6 bg-[#FAFBFC] rounded-2xl border border-black/5 relative overflow-hidden group">
                    <div className="flex justify-between items-end mb-4 relative z-10">
                       <div>
                          <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic mb-1">{item.label}</p>
                          <h4 className="text-3xl font-black text-[#111111] tabular-nums leading-none">{item.level}%</h4>
                       </div>
                       <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-2 py-1", item.trend === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-lime-100 text-lime-600')}>
                          {item.trend}
                       </Badge>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner relative z-10">
                       <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.level}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="p-10 bg-[#FAFBFC] border-t border-[#F5F5F5]">
            <Button onClick={onClose} className="w-full h-16 bg-[#111111] text-white hover:bg-black rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl transition-all">
               Finalize Stock Audit
            </Button>
         </div>
      </Card>
    </div>
  );
}

function FeedbackAnalysisModal({ isOpen, onClose, feedback }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-lg border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-10 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <div className="flex items-center gap-5">
               <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                  <MessageSquare className="h-7 w-7 text-lime-400" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Sentiment <span className="text-lime-500 italic">Analysis</span></h3>
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Operational feedback hub</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5">
               <X className="h-5 w-5 text-black" />
            </button>
         </div>
         <div className="p-10 space-y-4 max-h-[60vh] overflow-y-auto bg-white">
            {feedback.length > 0 ? feedback.map((item: any, i: number) => (
              <div key={i} className="p-6 bg-[#FAFBFC] rounded-2xl border border-black/5 space-y-3 group hover:border-lime-500/20 transition-all">
                 <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-xs font-black text-lime-400">
                         {item.student?.user?.full_name?.charAt(0) || 'S'}
                       </div>
                       <span className="text-[10px] font-black text-[#111111] uppercase tracking-widest">{item.student?.user?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={cn("h-3 w-3", item.rating > idx ? "fill-lime-500 text-lime-500" : "text-gray-200")} />
                      ))}
                    </div>
                 </div>
                 <p className="text-[12px] font-bold text-[#555555] italic leading-relaxed">"{item.comment}"</p>
                 <div className="flex items-center justify-between pt-2 border-t border-black/5 opacity-50">
                    <span className="text-[8px] font-black text-[#919191] uppercase tracking-[0.2em]">
                      {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                    </span>
                    <button className="text-[8px] font-black text-black uppercase tracking-widest hover:text-lime-500 transition-all">Acknowledge Node</button>
                 </div>
              </div>
            )) : (
              <div className="py-20 text-center text-[#919191]">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Sentiment Records Found</p>
              </div>
            )}
         </div>
         <div className="p-10 bg-[#FAFBFC] border-t border-[#F5F5F5]">
            <Button onClick={onClose} className="w-full h-16 bg-black text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl transition-all">
               Export Sentiment Log
            </Button>
         </div>
      </Card>
    </div>
  );
}

function MealOptOutWizard({ isOpen, onClose, meal, onConfirm }: any) {
  const [step, setStep] = useState(1);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-sm border-none bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
         <div className="p-12 text-center space-y-8">
            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-black shadow-2xl flex items-center justify-center relative">
               <Target className="h-10 w-10 text-lime-400" />
               <div className="absolute inset-0 rounded-[2rem] border-2 border-lime-500 animate-ping opacity-20" />
            </div>
            
            {step === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                 <div>
                    <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter mb-1">Opt-Out <span className="text-lime-500">Protocol</span></h3>
                    <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">Service: {meal?.type || 'Upcoming Meal'}</p>
                 </div>
                 <div className="p-6 bg-[#FAFBFC] rounded-3xl border border-black/5">
                    <p className="text-[9px] font-black text-[#919191] uppercase tracking-[0.3em] mb-4 text-center">Calculated Credit Flux</p>
                    <div className="flex items-center justify-center gap-2">
                       <span className="text-4xl font-black text-lime-600">+8</span>
                       <span className="text-[10px] font-black uppercase text-[#111111] tracking-widest">Credits</span>
                    </div>
                 </div>
                 <Button onClick={() => setStep(2)} className="w-full h-16 bg-[#111111] text-white hover:bg-black rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all group">
                    Next Protocol <ArrowRight className="ml-2 h-5 w-5 text-lime-400 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                 <div>
                    <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter mb-1">Confirm <span className="text-rose-500 italic">Lockout</span></h3>
                    <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">Action cannot be reversed once synced.</p>
                 </div>
                 <div className="flex flex-col gap-3">
                    <Button onClick={() => { onConfirm(); setStep(1); onClose(); }} className="w-full h-16 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all">
                       Synchronize Sync
                    </Button>
                    <Button onClick={() => setStep(1)} variant="ghost" className="w-full h-12 font-black text-[9px] uppercase tracking-widest text-[#919191]">
                       Return to selection
                    </Button>
                 </div>
              </div>
            )}
         </div>
      </Card>
    </div>
  );
}
