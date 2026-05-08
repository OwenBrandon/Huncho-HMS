import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Plus, 
  Building as BuildingIcon, 
  Bed, 
  Users, 
  ShieldCheck, 
  Zap, 
  Wind, 
  Bath, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  Wrench,
  History,
  Smartphone,
  Check,
  ExternalLink,
  ClipboardCheck,
  Lightbulb,
  Droplets,
  Wifi,
  Waves,
  Sparkles,
  Coffee,
  Loader2
} from 'lucide-react';
import { useInfrastructure } from '../hooks/useInfrastructure';
import { useAllocations } from '../hooks/useAllocations';
import { mockRooms, mockBuildings, mockStudents, mockUsers, mockAllocations } from '../data/mockData';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { buildings, rooms: liveRooms, isLoading: infraLoading, error, addBuilding, addRoom, refresh } = useInfrastructure();
  const { allocations, isLoading: allocLoading } = useAllocations();
  const isLoading = infraLoading || allocLoading;
  const [localRooms, setLocalRooms] = useState<any[]>([]);

  // Sync live rooms to local state for UI interactions like inspection
  React.useEffect(() => {
    if (liveRooms.length > 0) {
      setLocalRooms(liveRooms.map(r => ({ ...r, isInspecting: false })));
    }
  }, [liveRooms]);
  
  const rooms = localRooms;
  
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // Aggregate Data for KPIs
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const currentOccupancy = rooms.reduce((sum, r) => sum + r.current_occupancy, 0);
    const availableBeds = totalCapacity - currentOccupancy;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    const inspectingRooms = rooms.filter(r => r.isInspecting).length;
    const occupancyRate = totalCapacity > 0 ? ((currentOccupancy / totalCapacity) * 100).toFixed(1) : '0';

    return { totalRooms, totalCapacity, currentOccupancy, availableBeds, maintenanceRooms, inspectingRooms, occupancyRate };
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBuilding = selectedBuilding === 'all' || room.building_id === selectedBuilding;
      const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
      return matchesSearch && matchesBuilding && matchesStatus;
    });
  }, [rooms, searchTerm, selectedBuilding, selectedStatus]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'available': return "bg-lime-500/15 text-lime-700 shadow-lime-500/10";
      case 'occupied': return "bg-black/5 text-[#111111] shadow-black/5";
      case 'maintenance': return "bg-amber-500/15 text-amber-700 shadow-amber-500/10";
      case 'reserved': return "bg-blue-500/15 text-blue-700 shadow-blue-500/10";
      default: return "bg-gray-500/15 text-gray-700";
    }
  };

  const handleInitiateInspection = (room: any) => {
    setLocalRooms(prev => prev.map(r => r.id === room.id ? { ...r, isInspecting: true } : r));
    toast.info(`Occupant Notification Sent`, {
      description: `Security protocol alert transmitted to all occupants of Room ${room.room_number}.`,
      icon: <Smartphone className="h-4 w-4 text-blue-500" />
    });
    setSelectedRoom(room);
    setIsInspectionModalOpen(true);
  };

  const handleFinalizeInspection = (roomId: string) => {
    setLocalRooms(prev => prev.map(r => r.id === roomId ? { ...r, isInspecting: false } : r));
    toast.success("Inspection Protocol Finalized", {
      description: "Room health state has been synchronized with the grid.",
    });
  };

  if (isLoading && rooms.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-lime-500" />
          <p className="text-sm font-black uppercase tracking-widest text-[#919191]">Syncing Infrastructure Grid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">
            Infrastructure <span className="text-lime-500">Inventory</span>
          </h1>
          <p className="text-sm font-medium text-[#919191]">Real-time building mapping and room capacity telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl border-2 border-black/5 hover:bg-black hover:text-white font-bold h-12 px-6 transition-all active:scale-95" onClick={() => setIsAddBuildingModalOpen(true)}>
            <BuildingIcon className="mr-2 h-5 w-5 text-lime-500" />
            Add Building
          </Button>
          <Button className="rounded-2xl bg-black hover:bg-black/90 text-white font-bold h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none" onClick={() => setIsAddRoomModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5 text-lime-400" />
            Add New Room
          </Button>
        </div>
      </div>

      <RoomInspectionModal 
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        room={selectedRoom}
        onFinalize={handleFinalizeInspection}
      />

      <RoomTerminalOverlay 
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        room={selectedRoom}
        allocations={allocations}
      />

      <MaintenanceProtocolModal 
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        room={selectedRoom}
      />

      <AddBuildingModal 
        isOpen={isAddBuildingModalOpen}
        onClose={() => setIsAddBuildingModalOpen(false)}
        onAdd={addBuilding}
        onSuccess={() => {
          toast.success('Building Node Synchronized');
          refresh();
        }}
      />

      <AddRoomModal 
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        buildings={buildings}
        onAdd={addRoom}
        onSuccess={() => {
          toast.success('Unit Deployment Authorized');
          refresh();
        }}
      />

      {/* KPI Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-2xl shadow-lime-500/5 bg-gradient-to-br from-white to-[#F9FAFB] rounded-[2rem] overflow-hidden group border border-white">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Zap className="h-20 w-20 text-black" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-black/20">
                <Zap className="h-5 w-5 text-lime-400" />
              </div>
              <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Live Efficiency</p>
            </div>
            <h3 className="text-4xl font-black text-[#111111] leading-none mb-1 tabular-nums">{stats.occupancyRate}%</h3>
            <p className="text-[9px] font-bold text-lime-600 uppercase italic tracking-tighter">System-wide occupancy</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-black/5 bg-gradient-to-br from-[#111111] to-[#222222] rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Users className="h-20 w-20 text-white" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Bed className="h-5 w-5 text-lime-400" />
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Available Beds</p>
            </div>
            <h3 className="text-4xl font-black text-white leading-none mb-1 tabular-nums">{stats.availableBeds}</h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Immediate Vacancy slots</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-lime-500/5 bg-white rounded-[2rem] overflow-hidden group border border-[#F0F0F0]/50">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <BuildingIcon className="h-20 w-20 text-lime-500" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center">
                <BuildingIcon className="h-5 w-5 text-lime-600" />
              </div>
              <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Total Inventory</p>
            </div>
            <h3 className="text-4xl font-black text-[#111111] leading-none mb-1 tabular-nums">{stats.totalRooms}</h3>
            <p className="text-[9px] font-bold text-[#919191] uppercase tracking-tighter">Units across components</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-black/5 bg-gradient-to-br from-[#111111] to-[#222222] rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ShieldAlert className="h-20 w-20 text-amber-500" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <ScanLine className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Inspections</p>
            </div>
            <h3 className="text-4xl font-black text-amber-500 leading-none mb-1 tabular-nums">{stats.inspectingRooms}</h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Active security audits</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Control Center */}
      <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden">
        <div className="p-6 flex flex-col gap-8">
          {/* Navigation & Filters */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => { setSelectedBuilding('all'); setCurrentPage(1); }}
                className={cn(
                  "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedBuilding === 'all' ? "bg-black text-lime-400 shadow-xl shadow-black/20" : "bg-white text-[#555555] hover:bg-[#F0F0F0]"
                )}
              >
                All Components
              </button>
              {buildings.map((b) => (
                <button 
                  key={b.id}
                  onClick={() => { setSelectedBuilding(b.id); setCurrentPage(1); }}
                  className={cn(
                    "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    selectedBuilding === b.id ? "bg-black text-lime-400 shadow-xl shadow-black/20" : "bg-white text-[#555555] hover:bg-[#F0F0F0]"
                  )}
                >
                  {b.name}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919191] group-focus-within:text-lime-600 transition-colors" />
                <Input 
                  placeholder="Query room telemetry..." 
                  className="pl-12 h-14 rounded-2xl border-none bg-white shadow-sm font-medium text-[#111111] placeholder:text-[#919191]/60 focus-visible:ring-2 focus-visible:ring-lime-500/20 transition-all italic"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-[#919191]" />
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-[#F0F0F0]">
                  {['all', 'available', 'occupied', 'maintenance'].map((status) => (
                    <button
                      key={status}
                      onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        selectedStatus === status ? "bg-[#111111] text-white" : "text-[#919191] hover:text-[#111111]"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedRooms.map((room) => {
              const fillRate = (room.current_occupancy / room.capacity) * 100;
              return (
                <Card 
                  key={room.id} 
                  className="group border-none shadow-lg shadow-black/5 bg-white rounded-3xl overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 ring-1 ring-[#F0F0F0]"
                >
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="h-2 w-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_8px_rgba(190,242,100,0.8)]" />
                            <h3 className="text-xl font-black text-[#111111] leading-none tabular-nums tracking-tighter italic">{room.room_number}</h3>
                          </div>
                          <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest">{room.building?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           {room.isInspecting && <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest animate-pulse border border-amber-500/30 px-2 py-0.5 rounded-md bg-amber-500/5">Surveillance Active</span>}
                           <Badge className={cn("rounded-lg px-2.5 py-1 font-black text-[8px] uppercase tracking-widest border-none shadow-sm", room.isInspecting ? "bg-amber-500 text-white shadow-amber-500/20" : getStatusStyle(room.status))}>
                              {room.isInspecting ? "Inspecting" : room.status}
                           </Badge>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled={room.isInspecting}>
                                 <button className="h-8 w-8 rounded-lg hover:bg-[#F0F0F0] flex items-center justify-center transition-all disabled:opacity-20">
                                    <MoreVertical className="h-4 w-4 text-[#919191]" />
                                 </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-48 bg-white/95 backdrop-blur-md">
                                 <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={() => { setSelectedRoom(room); setIsTerminalOpen(true); }}>
                                    <Zap className="h-4 w-4 text-[#919191]" /> Unit Deep-Dive
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={() => { setSelectedRoom(room); setIsMaintenanceModalOpen(true); }}>
                                    <Wrench className="h-4 w-4 text-[#919191]" /> Log Maintenance
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5">
                                    <Users className="h-4 w-4 text-[#919191]" /> Sync Inhabitants
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                      </div>

                      {/* Bed Grid Visualizer */}
                      <div className="flex items-center gap-2 py-1">
                        {Array.from({ length: room.capacity }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "h-5 w-7 rounded-md transition-all duration-300 flex items-center justify-center relative overflow-hidden",
                              idx < room.current_occupancy 
                                ? "bg-gradient-to-br from-lime-400 to-lime-600 shadow-[0_3px_8px_rgba(163,230,53,0.3)] border-none" 
                                : "bg-[#F9FAFB]/50 border-2 border-dashed border-[#E5E7EB]"
                            )}
                          >
                            {idx < room.current_occupancy && (
                              <Users className="h-2.5 w-2.5 text-black/30 animate-in fade-in zoom-in duration-700" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between group/row">
                          <span className="text-[9px] font-black text-[#919191] uppercase tracking-widest">Type / Floor</span>
                          <span className="text-[10px] font-bold text-[#111111] capitalize italic">{room.room_type} / FLR {room.floor}</span>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-[#919191] uppercase tracking-widest">Occupancy</span>
                            <span className="text-[10px] font-black text-[#111111] tabular-nums">{room.current_occupancy} / {room.capacity}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all duration-1000",
                                fillRate === 100 ? "bg-[#111111]" : "bg-lime-500 shadow-[0_0_8px_rgba(190,242,100,0.4)]"
                              )}
                              style={{ width: `${fillRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]/50">
                          <div className="flex items-center gap-2">
                            {room.has_ac && <div className="h-7 w-7 rounded-lg bg-lime-500/10 flex items-center justify-center"><Wind className="h-3.5 w-3.5 text-lime-600" /></div>}
                            {room.has_attached_bathroom && <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center"><Bath className="h-3.5 w-3.5 text-blue-600" /></div>}
                          </div>
                          <span className="text-sm font-black text-[#111111] tabular-nums tracking-tighter">CFA {room.monthly_rent}</span>
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={room.isInspecting}
                        className={cn(
                           "w-full mt-2 rounded-xl h-9 text-[9px] font-black uppercase tracking-widest transition-all",
                           room.isInspecting 
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                              : "text-[#919191] hover:text-[#111111] hover:bg-[#F9FAFB]"
                        )}
                        onClick={() => handleInitiateInspection(room)}
                      >
                        {room.isInspecting ? <><RefreshCw className="h-3 w-3 animate-spin mr-2" /> Protocol in Progress</> : "Initiate Inspection"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Terminal */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#919191]">
                Inventory Page <span className="text-[#111111] tabular-nums">{currentPage}</span> of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-none shadow-sm bg-white hover:bg-lime-50 hover:text-lime-700 font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-4 disabled:opacity-30 transition-all active:scale-95"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
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

      {/* Infrastructure Note */}
      <Card className="border-none shadow-2xl shadow-black/5 bg-[#111111] rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-[1.5rem] bg-lime-500/10 flex items-center justify-center shrink-0">
              <Zap className="h-8 w-8 text-lime-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">System <span className="text-lime-500 italic">Integrity</span></h3>
                <Badge className="bg-lime-500/20 text-lime-500 text-[8px] uppercase tracking-widest border-none">Active Monitoring</Badge>
              </div>
              <p className="text-sm text-white/50 font-medium mb-6 max-w-2xl leading-relaxed italic">
                Our infrastructure mapping provides real-time telemetry on room health, bed availability, and floor-level occupancy metrics. Maintenance statuses are synced with the global ticketing system.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Real-time Mapping', icon: Zap },
                  { label: 'Occupancy Sync', icon: Users },
                  { label: 'Maintenance Hub', icon: AlertCircle },
                  { label: 'Grid Monitoring', icon: ShieldCheck }
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
    </div>
  );
}

// --- Room Inspection Modal (Security Protocol Terminal) ---
function RoomInspectionModal({ isOpen, onClose, room, onFinalize }: { isOpen: boolean, onClose: () => void, room: any, onFinalize: (id: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklist, setChecklist] = useState({
     electricity: false,
     plumbing: false,
     cleanliness: false,
     assets: false
  });

  if (!isOpen || !room) return null;

  const allClear = Object.values(checklist).every(v => v);

  const handleFinalize = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onFinalize(room.id);
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-amber-50/20">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                 <ShieldAlert className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight leading-none mb-1">Room <span className="text-amber-500 italic font-black">Audit</span></h3>
                 <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Protocols for Unit {room.room_number}</p>
              </div>
           </div>
           <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white/50 border border-black/5">
              <X className="h-5 w-5 text-black" />
           </button>
        </div>

        <div className="p-8 space-y-6">
           <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'electricity', label: 'Electrical Nodes Verification', icon: Zap },
                { id: 'plumbing', label: 'Plumbing & Drainage Check', icon: Droplets },
                { id: 'cleanliness', label: 'Institutional Hygiene Audit', icon: CheckCircle2 },
                { id: 'assets', label: 'Inventory Artifact Search', icon: ClipboardCheck }
              ].map(item => (
                 <div key={item.id} className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group",
                    checklist[item.id as keyof typeof checklist] ? "bg-amber-50 border-amber-200" : "bg-[#FAFBFC] border-[#F0F0F0] hover:border-amber-300"
                 )} onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof checklist] }))}>
                    <div className="flex items-center gap-4">
                       <item.icon className={cn("h-5 w-5 transition-colors", checklist[item.id as keyof typeof checklist] ? "text-amber-600" : "text-[#919191]")} />
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", checklist[item.id as keyof typeof checklist] ? "text-amber-700" : "text-[#555555]")}>{item.label}</span>
                    </div>
                    <div className={cn("h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all", checklist[item.id as keyof typeof checklist] ? "bg-amber-500 border-amber-500 text-white" : "border-[#E0E0E0]")}>
                       {checklist[item.id as keyof typeof checklist] && <Check className="h-4 w-4" />}
                    </div>
                 </div>
              ))}
           </div>

           <Button disabled={!allClear || isSubmitting} onClick={handleFinalize} className={cn(
              "w-full h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl",
              allClear ? "bg-black text-white hover:bg-[#222222] shadow-black/20" : "bg-[#F0F0F0] text-[#DEDEDE]"
           )}>
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Unit Health"}
           </Button>
        </div>
      </Card>
    </div>
  );
}

// --- Room Terminal Overlay (Deep-Dive Panel) ---
function RoomTerminalOverlay({ isOpen, onClose, room, allocations }: { isOpen: boolean, onClose: () => void, room: any, allocations: any[] }) {
  if (!isOpen || !room) return null;

  const occupants = allocations
    .filter(a => a.room_id === room.id && a.status === 'active')
    .map(a => {
      return {
        ...a.student,
        user: a.studentUser
      };
    });

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="h-full w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
         <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC] sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-[1.2rem] bg-black flex items-center justify-center shadow-xl">
                  <Zap className="h-6 w-6 text-lime-400" />
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">Unit <span className="text-lime-500 italic">{room.room_number}</span></h3>
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest">{room.building?.name} Terminal</p>
               </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-10 space-y-12">
            <div className="grid grid-cols-2 gap-6">
               <div className="p-8 bg-gradient-to-br from-[#FAFBFC] to-white rounded-[2.5rem] border border-black/5 shadow-sm">
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.2em] mb-4">Occupancy Signal</p>
                  <div className="flex items-center gap-4">
                     <span className="text-5xl font-black text-[#111111] tabular-nums italic tracking-tighter">{room.current_occupancy} / {room.capacity}</span>
                     <Badge className="bg-lime-500/10 text-lime-600 border-none font-black text-[9px] px-3 py-1 rounded-lg uppercase">Live</Badge>
                  </div>
               </div>
               <div className="p-8 bg-gradient-to-br from-[#FAFBFC] to-white rounded-[2.5rem] border border-black/5 shadow-sm">
                  <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.2em] mb-4">Fiscal Node</p>
                  <div className="flex items-center gap-2">
                     <span className="text-4xl font-black text-[#111111] tabular-nums italic tracking-tighter">CFA {room.monthly_rent}</span>
                     <span className="text-[9px] font-bold text-[#919191] uppercase tracking-widest">/ Mo</span>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#111111] flex items-center gap-4">
                  <Users className="h-5 w-5 text-lime-500" /> Inhabitant Registry
               </h5>
               <div className="space-y-4">
                  {occupants.length > 0 ? occupants.map((oc, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white rounded-[2.5rem] border border-[#F0F0F0] hover:border-lime-500/30 transition-all group hover:shadow-2xl hover:shadow-black/5">
                       <div className="flex items-center gap-5">
                          <Avatar className="h-14 w-14 rounded-2xl shadow-lg ring-4 ring-white">
                             <AvatarImage src={oc.user?.profile_picture_url} />
                             <AvatarFallback className="bg-black text-white font-black text-xl italic">{oc.user?.full_name?.charAt(0) || 'R'}</AvatarFallback>
                          </Avatar>
                          <div>
                             <p className="text-[14px] font-black text-[#111111] uppercase italic tracking-tight leading-none mb-2">{oc.user?.full_name}</p>
                             <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3 text-lime-500" /> {oc.student_id}
                             </p>
                          </div>
                       </div>
                       <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-lime-50 hover:text-lime-600 transition-all active:scale-90">
                          <ExternalLink className="h-5 w-5" />
                       </Button>
                    </div>
                  )) : (
                    <div className="py-16 text-center border-[3px] border-dashed border-[#F0F0F0] rounded-[3rem] bg-[#FAFBFC]/50">
                       <Users className="h-12 w-12 text-[#DEDEDE] mx-auto mb-4 opacity-20" />
                       <p className="text-[11px] font-black text-[#DEDEDE] uppercase tracking-[0.4em]">No active inhabitants</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="space-y-8">
               <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#111111] flex items-center gap-4">
                  <History className="h-5 w-5 text-lime-500" /> Infrastructure History
               </h5>
               <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-[#F0F0F0]">
                  {[
                    { label: 'Deep Cleaning Protocol', date: '14 days ago', icon: Droplets, type: 'Maintenance' },
                    { label: 'Electrical Node Sync', date: '1 month ago', icon: Lightbulb, type: 'Technical' },
                    { label: 'Inhabitant Migration', date: '3 months ago', icon: Users, type: 'Registry' }
                  ].map((log, i) => (
                     <div key={i} className="relative pl-12 group">
                        <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#F0F0F0] group-hover:bg-lime-500 transition-colors" />
                        <div className="flex items-center gap-6 p-6 bg-[#FAFBFC] rounded-[2.5rem] border border-black/5 group-hover:bg-white group-hover:shadow-xl transition-all cursor-default relative overflow-hidden">
                           <div className="h-12 w-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm">
                              <log.icon className="h-5 w-5 text-[#919191] group-hover:text-lime-500 transition-colors" />
                           </div>
                           <div className="flex-1">
                              <p className="text-[11px] font-black text-[#111111] uppercase italic tracking-tight mb-1">{log.label}</p>
                              <div className="flex items-center gap-3">
                                 <span className="text-[9px] font-bold text-[#919191] uppercase tracking-widest">{log.date}</span>
                                 <span className="h-1 w-1 rounded-full bg-[#DEDEDE]" />
                                 <span className="text-[9px] font-black text-lime-600 uppercase tracking-widest italic">{log.type}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="p-8 border-t border-[#F5F5F5] bg-[#FAFBFC] sticky bottom-0">
            <Button className="w-full h-18 bg-black text-white hover:bg-[#111111] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 transition-all active:scale-95 group" onClick={() => toast.success("Artifact Generated", { description: "Infrastructure report compiled and saved." })}>
               <ClipboardCheck className="mr-3 h-5 w-5 text-lime-400 group-hover:animate-pulse" /> Generate Infrastructure Artifact
            </Button>
         </div>
      </div>
    </div>
  );
}

// --- Maintenance Protocol Modal ---
function MaintenanceProtocolModal({ isOpen, onClose, room }: { isOpen: boolean, onClose: () => void, room: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Maintenance Protocol Triggered", {
        description: `Ticket for Unit ${room.room_number} has been logged in the Engineering Node.`,
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-sm border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400">
        <form onSubmit={handleSubmit}>
           <div className="p-10 border-b border-[#F5F5F5] flex justify-between items-center bg-blue-50/20">
              <div className="flex items-center gap-5">
                 <div className="h-12 w-12 rounded-2xl bg-[#111111] flex items-center justify-center shadow-xl">
                    <Wrench className="h-6 w-6 text-lime-400" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Engineering <span className="text-blue-500 italic font-black">Node</span></h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Maintenance Logging</p>
                 </div>
              </div>
              <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white/50 border border-black/5">
                 <X className="h-5 w-5 text-black" />
              </button>
           </div>
           <div className="p-10 space-y-8">
              <div className="space-y-5">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Diagnostic Category</label>
                    <div className="grid grid-cols-1 gap-2">
                       {['Electrical Fault', 'Plumbing Leakage', 'HVAC / AC Protocol', 'Furniture Repair'].map(cat => (
                         <button key={cat} type="button" className="w-full h-12 bg-[#FAFBFC] hover:bg-white hover:border-blue-500/30 border-2 border-transparent rounded-2xl px-5 font-bold text-[11px] uppercase tracking-tighter text-left flex items-center justify-between transition-all group">
                            {cat}
                            <div className="h-4 w-4 rounded-full border-2 border-[#E0E0E0] group-hover:border-blue-500 transition-colors" />
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Priority Level</label>
                    <div className="flex gap-3">
                       {['Urgent', 'Routine'].map(p => (
                         <button key={p} type="button" className={cn(
                            "flex-1 h-12 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                            p === 'Urgent' ? "border-rose-100 bg-rose-50/30 text-rose-600 hover:bg-rose-50" : "border-black/5 bg-[#FAFBFC] text-[#555555] hover:border-black"
                         )}>
                            {p}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-18 bg-black text-white hover:bg-[#111111] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 group">
                 {isSubmitting ? <RefreshCw className="h-6 w-6 animate-spin mx-auto" /> : <><ShieldAlert className="mr-3 h-5 w-5 text-blue-400 group-hover:animate-pulse" /> Initiate Protocol</>}
              </Button>
           </div>
        </form>
      </Card>
    </div>
  );
}

// --- Add Building Modal (Technical Wizard) ---
function AddBuildingModal({ isOpen, onClose, onSuccess, onAdd }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, onAdd: (b: any) => Promise<any> }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    floors: 4,
    total_rooms: 24,
    infrastructure_type: 'Standard'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd({
        name: formData.name,
        code: formData.code,
        total_floors: Number(formData.floors),
        is_active: true
      });
      onSuccess();
      setFormData({ name: '', code: '', floors: 4, total_rooms: 24, infrastructure_type: 'Standard' });
      onClose();
    } catch (err: any) {
      toast.error('Building Synchronization Failure', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-lg border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <form onSubmit={handleSubmit}>
           <div className="p-10 border-b border-[#F5F5F5] bg-[#FAFBFC] flex justify-between items-center">
              <div className="flex items-center gap-5">
                 <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                    <BuildingIcon className="h-7 w-7 text-lime-400" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Building <span className="text-lime-500 italic">Sync</span></h3>
                    <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Structural Integration</p>
                 </div>
              </div>
              <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5">
                 <X className="h-5 w-5 text-black" />
              </button>
           </div>

           <div className="p-12 space-y-8">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Component Name</label>
                    <Input 
                      required
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="h-16 rounded-2xl border-none bg-[#FAFBFC] font-bold text-sm px-6 focus:ring-2 focus:ring-lime-500/20 transition-all" 
                      placeholder="e.g. Block Alpha" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Reference Code</label>
                       <Input 
                         required
                         value={formData.code}
                         onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                         className="h-16 rounded-2xl border-none bg-[#FAFBFC] font-black text-sm px-6 uppercase italic tracking-tighter" 
                         placeholder="BA-01" 
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Total Levels</label>
                       <Input 
                         type="number"
                         value={formData.floors}
                         onChange={e => setFormData(p => ({ ...p, floors: parseInt(e.target.value) || 0 }))}
                         className="h-16 rounded-2xl border-none bg-[#FAFBFC] font-black text-sm px-6 tabular-nums" 
                       />
                    </div>
                 </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-20 bg-black text-white hover:bg-[#111111] rounded-[2.5rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 group">
                 {isSubmitting ? <RefreshCw className="h-6 w-6 animate-spin mx-auto text-lime-400" /> : <><ShieldCheck className="mr-3 h-6 w-6 text-lime-400 group-hover:animate-pulse" /> Finalize Integration</>}
              </Button>
           </div>
        </form>
      </Card>
    </div>
  );
}

// --- Add Room Modal (Tactical Multi-Step Wizard) ---
function AddRoomModal({ isOpen, onClose, onSuccess, buildings, onAdd }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, buildings: any[], onAdd: (r: any) => Promise<any> }) {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({ 
    number: '', 
    type: 'double', 
    floor: '1',
    building_id: buildings[0]?.id || '',
    capacity: 2,
    monthly_rent: 3500,
    amenities: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default building_id when buildings load
  React.useEffect(() => {
    if (buildings.length > 0 && !formData.building_id) {
      setFormData(prev => ({ ...prev, building_id: buildings[0].id }));
    }
  }, [buildings]);

  if (!isOpen) return null;

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handlePrev = () => setActiveStep(prev => prev - 1);

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id) 
        ? prev.amenities.filter(a => a !== id) 
        : [...prev.amenities, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd({
        room_number: formData.number,
        room_type: formData.type as any,
        floor: Number(formData.floor),
        building_id: formData.building_id,
        capacity: Number(formData.capacity),
        current_occupancy: 0,
        monthly_rent: Number(formData.monthly_rent),
        status: 'available',
        has_ac: formData.amenities.includes('ac'),
        has_attached_bathroom: formData.amenities.includes('bathroom')
      });
      
      onSuccess();
      setIsSubmitting(false);
      setActiveStep(1);
      onClose();
      setFormData({ 
        number: '', 
        type: 'double', 
        floor: '1',
        building_id: buildings[0]?.id || '',
        capacity: 2,
        monthly_rent: 3500,
        amenities: []
      });
    } catch (err: any) {
      toast.error('Unit Deployment Failure', { description: err.message });
      setIsSubmitting(false);
    }
  };

  const amenityRegistry = [
    { id: 'ac', label: 'Air Conditioning', icon: Wind, color: 'text-blue-500' },
    { id: 'bathroom', label: 'Attached Bathroom', icon: Bath, color: 'text-[#111111]' },
    { id: 'wifi', label: 'High-Speed Wifi', icon: Wifi, color: 'text-lime-500' },
    { id: 'laundry', label: 'Laundry Service', icon: Waves, color: 'text-blue-400' },
    { id: 'housekeeping', label: 'Housekeeping', icon: Sparkles, color: 'text-amber-500' },
    { id: 'pantry', label: 'In-Unit Pantry', icon: Coffee, color: 'text-orange-500' }
  ];

  const steps = [
    { title: 'Registry', icon: Bed },
    { title: 'Typology', icon: Users },
    { title: 'Amenities', icon: Sparkles },
    { title: 'Deploy', icon: Zap }
  ];

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-lg border-none bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <form onSubmit={handleSubmit}>
           <div className="p-10 border-b border-[#F5F5F5] bg-[#FAFBFC] relative">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                       <Bed className="h-7 w-7 text-lime-400" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none mb-1">Unit <span className="text-lime-500 italic">Deployment</span></h3>
                       <p className="text-[10px] font-black text-[#919191] uppercase tracking-[0.3em] leading-none">Inventory Expansion Protocol</p>
                    </div>
                 </div>
                 <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all bg-white shadow-sm border border-black/5">
                    <X className="h-5 w-5 text-black" />
                 </button>
              </div>

              {/* Progress Line */}
              <div className="flex items-center justify-between px-4 relative">
                 {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3 relative z-10">
                       <div className={cn(
                          "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                          activeStep > idx + 1 ? "bg-lime-500 text-black scale-90" : 
                          activeStep === idx + 1 ? "bg-black text-white shadow-2xl shadow-black/30 scale-110" : 
                          "bg-white border border-black/5 text-[#DEDEDE]"
                       )}>
                          {activeStep > idx + 1 ? <Check className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                       </div>
                       <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", activeStep === idx + 1 ? "text-black" : "text-[#DEDEDE]")}>{step.title}</span>
                    </div>
                 ))}
                 <div className="absolute top-5 left-0 right-0 h-[2px] bg-[#F0F0F0] -z-10 mx-12">
                    <div 
                      className="h-full bg-lime-500 transition-all duration-1000 ease-in-out" 
                      style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }} 
                    />
                 </div>
              </div>
           </div>

           <div className="p-12">
              <div className="min-h-[320px]">
                 {/* Step 1: Technical Registry */}
                 {activeStep === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Room Index</label>
                             <Input 
                               required
                               value={formData.number}
                               onChange={e => setFormData(p => ({ ...p, number: e.target.value }))}
                               className="h-18 rounded-[1.5rem] border-none bg-[#FAFBFC] font-black text-lg uppercase italic tracking-tight placeholder:text-[#DEDEDE] text-center" 
                               placeholder="e.g. 101" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Level (Floor)</label>
                             <Input 
                               type="number"
                               required
                               value={formData.floor}
                               onChange={e => setFormData(p => ({ ...p, floor: e.target.value }))}
                               className="h-18 rounded-[1.5rem] border-none bg-[#FAFBFC] font-black text-lg tabular-nums text-center" 
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Structural Node (Building)</label>
                          <div className="grid grid-cols-1 gap-2">
                             {buildings.length > 0 ? buildings.map(b => (
                                <button key={b.id} type="button" onClick={() => setFormData(p => ({ ...p, building_id: b.id }))} className={cn(
                                   "w-full h-14 rounded-2xl border-2 px-6 flex items-center justify-between transition-all group",
                                   formData.building_id === b.id ? "bg-black border-black text-white" : "bg-[#FAFBFC] border-transparent hover:border-black/10"
                                )}>
                                   <div className="flex items-center gap-4">
                                      <BuildingIcon className={cn("h-5 w-5", formData.building_id === b.id ? "text-lime-400" : "text-[#919191]")} />
                                      <span className="text-[11px] font-black uppercase tracking-widest">{b.name}</span>
                                   </div>
                                   {formData.building_id === b.id && <div className="h-5 w-5 rounded-full bg-lime-500 flex items-center justify-center"><Check className="h-3 w-3 text-black" /></div>}
                                </button>
                             )) : (
                               <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic">No buildings detected in registry.</p>
                             )}
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Step 2: Unit Typology */}
                 {activeStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Typology Spectrum</label>
                          <div className="grid grid-cols-2 gap-4">
                             {['single', 'double', 'triple', 'quad'].map(t => (
                                <button key={t} type="button" onClick={() => setFormData(p => ({ ...p, type: t as any, capacity: t === 'single' ? 1 : t === 'double' ? 2 : t === 'triple' ? 3 : 4 }))} className={cn(
                                   "h-20 rounded-[1.8rem] border-2 flex flex-col items-center justify-center transition-all px-4",
                                   formData.type === t ? "bg-black border-black text-lime-400 shadow-2xl" : "bg-[#FAFBFC] border-transparent hover:border-black/10 text-[#555555]"
                                )}>
                                   <span className="text-[12px] font-black uppercase tracking-widest italic">{t}</span>
                                   <span className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">{t === 'single' ? '1 Bed' : `${t === 'double' ? '2' : t === 'triple' ? '3' : '4'} Beds`}</span>
                                </button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#919191] pl-1">Fiscal Registry (Monthly Rent)</label>
                          <div className="relative">
                             <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-[#111111]">CFA</span>
                             <Input 
                               type="number"
                               value={formData.monthly_rent}
                               onChange={e => setFormData(p => ({ ...p, monthly_rent: parseInt(e.target.value) }))}
                               className="h-20 rounded-[1.8rem] border-none bg-[#FAFBFC] font-black text-3xl tabular-nums pl-14 pr-8 text-right italic tracking-tighter" 
                             />
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Step 3: Amenity Artifacts */}
                 {activeStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                       <div className="grid grid-cols-2 gap-4">
                          {amenityRegistry.map(item => (
                             <button key={item.id} type="button" onClick={() => toggleAmenity(item.id)} className={cn(
                                "flex items-center gap-5 p-5 rounded-[1.8rem] border-2 transition-all text-left group relative overflow-hidden",
                                formData.amenities.includes(item.id) ? "bg-black border-black text-white shadow-xl" : "bg-[#FAFBFC] border-transparent hover:border-black/5"
                             )}>
                                <div className={cn(
                                   "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                                   formData.amenities.includes(item.id) ? "bg-white/10" : "bg-white shadow-sm"
                                )}>
                                   <item.icon className={cn("h-6 w-6 transition-all", formData.amenities.includes(item.id) ? "text-lime-400" : "text-[#919191] group-hover:text-black")} />
                                </div>
                                <div>
                                   <p className={cn("text-[11px] font-black uppercase tracking-widest leading-none mb-1", formData.amenities.includes(item.id) ? "text-white" : "text-[#111111]")}>{item.label}</p>
                                   <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Available Trace</p>
                                </div>
                                {formData.amenities.includes(item.id) && (
                                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-lime-500 flex items-center justify-center animate-in zoom-in-50 duration-300">
                                     <Check className="h-3 w-3 text-black" />
                                  </div>
                                )}
                             </button>
                          ))}
                       </div>
                    </div>
                 )}

                 {/* Step 4: Review & Deploy */}
                 {activeStep === 4 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                       <div className="bg-[#111111] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                          <div className="absolute -right-10 -bottom-10 opacity-10">
                             <Bed className="h-64 w-64" />
                          </div>
                          <div className="relative z-10 space-y-8">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-lime-400 mb-2">Unit Identity</p>
                                   <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Unit <span className="text-lime-500">{formData.number}</span></h4>
                                   <p className="text-[11px] font-medium text-white/50 uppercase tracking-widest mt-2">Level {formData.floor} • {buildings.find(b => b.id === formData.building_id)?.name || 'Unknown'}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-lime-400 mb-1">Fiscal Node</p>
                                   <p className="text-3xl font-black italic tracking-tighter text-white">CFA {formData.monthly_rent}<span className="text-[10px] opacity-40 uppercase tracking-widest not-italic ml-1">/Mo</span></p>
                                </div>
                             </div>

                             <div className="border-t border-white/10 pt-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-lime-400 mb-4">Benefit Artifacts</p>
                                <div className="flex flex-wrap gap-2">
                                   {formData.amenities.map(a => (
                                      <Badge key={a} className="bg-white/10 text-white border-none py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                         {amenityRegistry.find(item => item.id === a)?.label}
                                      </Badge>
                                   ))}
                                   {formData.amenities.length === 0 && <span className="text-[10px] italic text-white/30">Standard Amenities Only</span>}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {/* Tactical Buttons */}
              <div className="flex gap-4 mt-12">
                 {activeStep > 1 && (
                    <Button onClick={handlePrev} type="button" variant="outline" className="h-18 w-18 rounded-[1.8rem] border-2 border-black/5 hover:border-black transition-all flex items-center justify-center">
                       <ChevronLeft className="h-7 w-7" />
                    </Button>
                 )}
                 {activeStep < 4 ? (
                    <Button 
                      onClick={handleNext} 
                      type="button" 
                      disabled={activeStep === 1 && (!formData.number || !formData.floor)} 
                      className="flex-1 h-18 bg-black text-white hover:bg-[#111111] rounded-[2rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 group"
                    >
                       Continue Protocol <ChevronRight className="ml-2 h-6 w-6 text-lime-400 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 ) : (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="flex-1 h-20 bg-lime-500 text-black hover:bg-lime-600 rounded-[2.5rem] font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-lime-500/20 transition-all active:scale-95 group"
                    >
                       {isSubmitting ? <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" /> : <><Zap className="mr-3 h-7 w-7 group-hover:scale-125 transition-transform" /> Deploy Unit Artifact</>}
                    </Button>
                 )}
              </div>
           </div>
        </form>
      </Card>
    </div>
  );
}
