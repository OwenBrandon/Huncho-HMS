import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  GraduationCap, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  RefreshCw,
  User,
  Bed,
  CreditCard,
  Activity,
  MessageSquare,
  History,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  ShieldAlert,
  Zap,
  Check,
  AlertTriangle,
  Lock,
  Loader2
} from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useStudents } from '../hooks/useStudents';
import { mockPayments, mockAttendance, mockComplaints, mockRooms } from '../data/mockData';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { useNavigation } from '../contexts/NavigationContext';

export function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDecommissionModalOpen, setIsDecommissionModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState<any>(null);
  const { navigate } = useNavigation();

  const { students: studentsWithUsers, pendingUsers, isLoading, enrollUser, updateStudent, deleteStudent, refresh } = useStudents();

  const filteredStudents = useMemo(() => {
    return studentsWithUsers.filter((student) => {
      const matchesSearch =
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [studentsWithUsers, searchTerm, selectedDepartment]);

  const departments = useMemo(() => {
    return Array.from(new Set(studentsWithUsers.map((s) => s.department).filter(Boolean)));
  }, [studentsWithUsers]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading && studentsWithUsers.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-lime-500" />
          <p className="text-sm font-black uppercase tracking-widest text-[#919191]">Synchronizing Resident Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111111] uppercase italic">Resident <span className="text-lime-500">Terminal</span></h1>
          <p className="text-sm font-medium text-[#919191]">Institutional directory and enrollment orchestration center.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="rounded-2xl border-none bg-white shadow-sm font-bold h-12 px-6 transition-all hover:bg-lime-50 active:scale-95"
            onClick={refresh}
          >
            <RefreshCw className="mr-2 h-4 w-4 text-lime-600" />
            Refresh
          </Button>
          <Button 
            className="rounded-2xl bg-black hover:bg-black/90 text-white font-bold h-12 px-6 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 border-none"
            onClick={() => {
              setSelectedPendingUser(null);
              setIsEnrollmentModalOpen(true);
            }}
          >
            <UserPlus className="mr-2 h-5 w-5 text-lime-400" />
            Manual Enrollment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-2xl shadow-lime-500/5 bg-gradient-to-br from-white to-[#F9FAFB] rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Users className="h-24 w-24 text-black" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/20">
                <Users className="h-6 w-6 text-lime-400" />
              </div>
              <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Total Residents</p>
            </div>
            <h3 className="text-5xl font-black text-[#111111] leading-none mb-1 tabular-nums">{studentsWithUsers.length}</h3>
            <p className="text-[10px] font-bold text-lime-600 uppercase tracking-tighter italic">Verified nodes in registry</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-rose-500/5 bg-gradient-to-br from-white to-[#FFF5F5] rounded-[2rem] overflow-hidden group border border-rose-100/50">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <AlertTriangle className="h-24 w-24 text-rose-500" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <p className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Pending Sync</p>
            </div>
            <h3 className="text-5xl font-black text-rose-600 leading-none mb-1 tabular-nums">{pendingUsers.length}</h3>
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter italic">Awaiting institutional enrollment</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-black/5 bg-gradient-to-br from-[#111111] to-[#222222] rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <GraduationCap className="h-24 w-24 text-white" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <GraduationCap className="h-6 w-6 text-lime-400" />
              </div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Departments</p>
            </div>
            <h3 className="text-5xl font-black text-white leading-none mb-1 tabular-nums">{departments.length}</h3>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter italic">Active academic sectors</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-lime-500/5 bg-white rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle2 className="h-24 w-24 text-lime-500" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-lime-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-lime-600" />
              </div>
              <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Compliance Rate</p>
            </div>
            <h3 className="text-5xl font-black text-[#111111] leading-none mb-1 tabular-nums">98%</h3>
            <p className="text-[10px] font-bold text-[#919191] uppercase tracking-tighter italic">Verified student profiles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-[#111111] p-1 rounded-2xl h-14 w-full md:w-auto md:min-w-[400px] mb-8">
          <TabsTrigger value="active" className="rounded-xl flex-1 h-full data-[state=active]:bg-[#D4FF3F] data-[state=active]:text-black font-black text-[10px] uppercase tracking-[0.2em] text-white/50">Active Residents</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl flex-1 h-full data-[state=active]:bg-[#D4FF3F] data-[state=active]:text-black font-black text-[10px] uppercase tracking-[0.2em] text-white/50 relative">
            Pending Enrollments
            {pendingUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-pulse ring-2 ring-[#111111]">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="m-0 space-y-6">
          <Card className="border-none shadow-2xl shadow-black/5 bg-[#FAFBFC] rounded-[2.5rem] overflow-hidden">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919191] group-focus-within:text-lime-600 transition-colors" />
                    <input 
                      placeholder="Search residents by name, ID or email..." 
                      className="w-full pl-12 h-14 rounded-2xl border-none bg-white shadow-sm font-medium text-[#111111] placeholder:text-[#919191]/60 focus-visible:ring-2 focus-visible:ring-lime-500/20 active:scale-[0.99] transition-all outline-none"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-14 rounded-2xl border-none bg-white shadow-sm font-bold gap-2 px-6 group hover:bg-white active:scale-95 transition-all">
                        <Filter className="h-4 w-4 text-[#919191] group-hover:text-lime-600" />
                        <span className="uppercase text-[10px] tracking-widest text-[#555555]">
                          {selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-2xl border-none shadow-2xl p-2 w-56 bg-white">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-[#919191] mb-2 px-3">Filter by Department</DropdownMenuLabel>
                      <DropdownMenuItem 
                        className="rounded-xl font-bold cursor-pointer focus:bg-lime-50 focus:text-lime-700"
                        onClick={() => { setSelectedDepartment('all'); setCurrentPage(1); }}
                      >
                        All Records
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {departments.map(dept => (
                        <DropdownMenuItem 
                          key={dept}
                          className="rounded-xl font-bold cursor-pointer focus:bg-lime-50 focus:text-lime-700"
                          onClick={() => { setSelectedDepartment(dept || 'all'); setCurrentPage(1); }}
                        >
                          {dept}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-[10px] font-black text-[#555555] uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-[#F0F0F0]">
                  Registry Load: <span className="text-lime-600 tabular-nums">{paginatedStudents.length}</span> / {filteredStudents.length} nodes
                </p>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F0F0F0]/50">
                <Table>
                  <TableHeader className="bg-[#FAFBFC]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-black text-[#111111] h-14 px-6 text-[10px] uppercase tracking-widest italic">Identity Matrix</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Institutional ID</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic">Dept & Academic Year</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-[10px] uppercase tracking-widest italic text-center">Status</TableHead>
                      <TableHead className="font-black text-[#111111] h-14 text-right px-6 text-[10px] uppercase tracking-widest italic opacity-50">Operational Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow 
                        key={student.id} 
                        className="hover:bg-[#F9FAFB] transition-colors group border-b border-[#F0F0F0]/50 last:border-0 px-6 cursor-pointer"
                        onClick={() => {
                            setSelectedStudent(student);
                            setIsDetailModalOpen(true);
                        }}
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#EEF2F3] to-[#8E9EAB]/20 flex items-center justify-center font-bold text-[#555555] shadow-inner uppercase overflow-hidden border-2 border-white ring-1 ring-black/5">
                              {student.user?.profile_picture_url ? (
                                <img src={student.user.profile_picture_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                student.user?.full_name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-black text-[#111111] leading-none uppercase tracking-tight">{student.user?.full_name}</p>
                              <p className="text-[10px] font-bold text-[#919191] mt-1 italic tracking-tight">{student.user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-black text-xs text-[#111111] bg-[#F0F0F0] px-3 py-1 rounded-lg tabular-nums shadow-sm border border-white">
                            {student.student_id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-[10px] text-[#111111] uppercase tracking-tighter">{student.department || 'N/A'}</span>
                            <span className="text-[10px] font-bold text-lime-600 italic">Academic Year {student.year_of_study || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em] border-none shadow-sm bg-lime-500/15 text-lime-700">
                            Active Node
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-[#F0F0F0] hover:scale-105 active:scale-95 transition-all outline-none">
                                <MoreVertical className="h-4 w-4 text-[#919191]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-48 bg-white/95 backdrop-blur-md">
                              <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-[#919191] mb-2 px-3">Manage Resident</DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setIsDetailModalOpen(true); }}>
                                <Eye className="h-4 w-4 text-[#919191]" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-lime-50 focus:text-lime-700 cursor-pointer py-2.5" onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setIsEditModalOpen(true); }}>
                                <Edit className="h-4 w-4 text-[#919191]" /> Edit Records
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#F0F0F0]" />
                              <DropdownMenuItem className="rounded-xl font-bold gap-3 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer py-2.5" onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setIsDecommissionModalOpen(true); }}>
                                <Trash2 className="h-4 w-4 opacity-50" /> Delete Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredStudents.length === 0 && (
                  <div className="py-24 text-center flex flex-col items-center gap-4 bg-white">
                    <div className="h-20 w-20 rounded-3xl bg-[#F9FAFB] flex items-center justify-center">
                      <Search className="h-10 w-10 text-[#919191] opacity-20" />
                    </div>
                    <div>
                      <p className="font-black text-[#111111] uppercase tracking-widest text-sm italic">No matching nodes in registry</p>
                      <p className="text-[10px] font-bold text-[#919191] mt-1 uppercase tracking-widest">Adjust protocol search or sector filters</p>
                    </div>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 px-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#919191]">
                    Sector Page <span className="text-[#111111] tabular-nums">{currentPage}</span> / {totalPages}
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

        <TabsContent value="pending" className="m-0 space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.length > 0 ? pendingUsers.map(user => (
              <Card key={user.id} className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all border border-transparent hover:border-lime-500/30">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-[#FAFBFC] to-[#F0F0F0] flex items-center justify-center font-black text-2xl text-[#111111] shadow-inner relative">
                      {user.full_name?.charAt(0) || 'U'}
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-rose-500 rounded-full border-4 border-white shadow-lg" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-[#111111] uppercase italic tracking-tighter">{user.full_name}</h4>
                      <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1 italic">{user.email}</p>
                    </div>
                    <div className="w-full h-px bg-[#F5F5F5] my-2" />
                    <div className="flex items-center gap-2 text-[#919191]">
                      <Calendar className="h-3 w-3" />
                      <p className="text-[10px] font-bold uppercase tracking-widest italic">Signed up {new Date(user.created_at || '').toLocaleDateString()}</p>
                    </div>
                    <Button 
                      className="w-full h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest mt-2 transition-all active:scale-95 shadow-lg shadow-black/10"
                      onClick={() => {
                        setSelectedPendingUser(user);
                        setIsEnrollmentModalOpen(true);
                      }}
                    >
                      Execute Enrollment Protocol
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full py-32 text-center flex flex-col items-center gap-6 bg-white rounded-[3rem] border-2 border-dashed border-[#F0F0F0]">
                <div className="h-24 w-24 rounded-full bg-lime-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-lime-600 opacity-20" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-[#111111] uppercase italic tracking-widest">Protocol Synchronized</h4>
                  <p className="text-[11px] font-bold text-[#919191] uppercase tracking-widest mt-2 italic">All applicants have been formally enrolled into the registry.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <StudentEnrollmentModal 
        isOpen={isEnrollmentModalOpen || isEditModalOpen}
        onClose={() => {
            setIsEnrollmentModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedPendingUser(null);
            setSelectedStudent(null);
        }}
        initialData={isEditModalOpen ? selectedStudent : null}
        pendingUser={selectedPendingUser}
        enrollAction={enrollUser}
        updateAction={updateStudent}
      />

      <StudentDecommissionModal
        isOpen={isDecommissionModalOpen}
        onClose={() => setIsDecommissionModalOpen(false)}
        student={selectedStudent}
        onDelete={deleteStudent}
      />

      <StudentDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={selectedStudent}
        onNavigate={navigate}
        onEdit={() => {
            setIsDetailModalOpen(false);
            setIsEditModalOpen(true);
        }}
        onDelete={() => {
            setIsDetailModalOpen(false);
            setIsDecommissionModalOpen(true);
        }}
      />
    </div>
  );
}

function StudentEnrollmentModal({ isOpen, onClose, initialData, pendingUser, enrollAction, updateAction }: any) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!initialData;
  const isEnrollFromPending = !!pendingUser;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    student_id: '',
    department: '',
    year_of_study: 1,
    date_of_birth: '2004-01-01',
    gender: 'male' as any,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.user?.full_name || '',
        email: initialData.user?.email || '',
        phone_number: initialData.user?.phone_number || '',
        student_id: initialData.student_id || '',
        department: initialData.department || '',
        year_of_study: initialData.year_of_study || 1,
        date_of_birth: initialData.date_of_birth || '2004-01-01',
        gender: initialData.gender || 'male',
        emergency_contact_name: initialData.emergency_contact_name || '',
        emergency_contact_phone: initialData.emergency_contact_phone || '',
        emergency_contact_relation: initialData.emergency_contact_relation || '',
      });
    } else if (pendingUser) {
      setFormData(prev => ({
        ...prev,
        full_name: pendingUser.full_name || '',
        email: pendingUser.email || '',
        phone_number: pendingUser.phone_number || '',
      }));
    }
  }, [initialData, pendingUser, isOpen]);

  if (!isOpen) return null;

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEnrollFromPending) {
        await enrollAction(pendingUser.id, {
          student_id: formData.student_id,
          department: formData.department,
          year_of_study: formData.year_of_study,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          emergency_contact_relation: formData.emergency_contact_relation,
          onboarding_status: 'applied',
          is_active: true
        });
        toast.success("Institutional Enrollment Sealed", {
          description: `Resident node ${formData.full_name} has been formally synchronized with the registry.`
        });
      } else if (isEdit) {
        await updateAction(initialData.id, {
          student_id: formData.student_id,
          department: formData.department,
          year_of_study: formData.year_of_study,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          emergency_contact_relation: formData.emergency_contact_relation,
        });
        toast.success("Resident Data Refined", {
          description: `Node ${formData.full_name} has been successfully updated in the matrix.`
        });
      } else {
        toast.error("Direct Manual Creation restricted", {
            description: "Institutional protocol requires User Identity first. Use Pending Enrollment tab."
        });
      }
      onClose();
      setStep(1);
    } catch (err: any) {
      toast.error("Enrollment Protocol Failure", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                {isEdit ? <Edit className="h-5 w-5 text-lime-400" /> : <UserPlus className="h-5 w-5 text-lime-400" />}
              </div>
              <div>
                <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">{isEdit ? 'Update' : 'Institutional'} <span className="text-lime-500">{isEdit ? 'Node' : 'Enrollment'}</span></h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-0.5">Step {step} of 3 • {isEdit ? 'Refinement' : 'Process'} Wizard</p>
              </div>
            </div>
            <button onClick={onClose} type="button" className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
              <X className="h-5 w-5 text-[#111111]" />
            </button>
          </div>

          <div className="p-10 space-y-8">
            <div className="flex gap-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= i ? "bg-lime-500 shadow-[0_0_15px_rgba(212,255,63,0.5)]" : "bg-[#F0F0F0]")} />
               ))}
            </div>

            <div className="min-h-[350px]">
               {step === 1 && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h4 className="text-[10px] font-black uppercase text-[#111111] tracking-[0.2em] mb-6 flex items-center gap-3">
                       <User className="h-4 w-4 text-lime-500" /> Identity Intelligence
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Legal Identity</label>
                          <input readOnly={isEnrollFromPending} value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-bold text-xs outline-none opacity-80" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Primary Email</label>
                          <input readOnly={isEnrollFromPending} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-bold text-xs outline-none opacity-80" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Birth Date</label>
                        <input type="date" required value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-bold text-xs focus:ring-2 focus:ring-lime-500/20 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Gender Node</label>
                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-black text-[10px] uppercase outline-none focus:ring-2 focus:ring-lime-500/20">
                          <option value="male">Male Identity</option>
                          <option value="female">Female Identity</option>
                          <option value="other">Other / Neutral</option>
                        </select>
                      </div>
                    </div>
                 </div>
               )}

               {step === 2 && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h4 className="text-[10px] font-black uppercase text-[#111111] tracking-[0.2em] mb-6 flex items-center gap-3">
                       <GraduationCap className="h-4 w-4 text-lime-500" /> Academic Strategy
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Institutional ID</label>
                          <input required value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} placeholder="HMS-2026-XXXX" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-bold text-xs focus:ring-2 focus:ring-lime-500/20 outline-none uppercase" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Academic Year</label>
                          <select value={formData.year_of_study} onChange={e => setFormData({...formData, year_of_study: parseInt(e.target.value)})} className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-black text-[10px] uppercase outline-none focus:ring-2 focus:ring-lime-500/20">
                             <option value={1}>Freshman (Year 1)</option>
                             <option value={2}>Sophomore (Year 2)</option>
                             <option value={3}>Junior (Year 3)</option>
                             <option value={4}>Senior (Year 4)</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Departmental Sector</label>
                       <input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. FACULTY OF COMPUTER ENGINEERING" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-bold text-xs focus:ring-2 focus:ring-lime-500/20 outline-none uppercase" />
                    </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h4 className="text-[10px] font-black uppercase text-[#111111] tracking-[0.2em] mb-6 flex items-center gap-3">
                       <ShieldAlert className="h-4 w-4 text-lime-500" /> Forensic Contact Matrix
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Guardian Identity</label>
                          <input required value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} placeholder="SURNAME FIRSTNAME" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-bold text-xs focus:ring-2 focus:ring-lime-500/20 outline-none uppercase" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Contact Mobile</label>
                          <input required value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} placeholder="+XXXX XXXXXXXX" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-bold text-xs focus:ring-2 focus:ring-lime-500/20 outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#919191] pl-1 italic">Relational Logic</label>
                        <input value={formData.emergency_contact_relation} onChange={e => setFormData({...formData, emergency_contact_relation: e.target.value})} placeholder="e.g. BIOLOGICAL PARENT" className="w-full h-14 bg-[#FAFBFC] border border-[#F0F0F0] rounded-2xl px-5 font-bold text-xs focus:ring-2 focus:ring-lime-500/20 outline-none uppercase" />
                      </div>
                    </div>
                    <div className="p-5 bg-lime-500/5 border border-lime-500/10 rounded-2xl flex items-center gap-4">
                      <Zap className="h-5 w-5 text-lime-600 animate-pulse" />
                      <p className="text-[10px] font-bold text-lime-700 italic uppercase">Seal will finalize institutional protocol and provision ledger access.</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="flex gap-4 pt-6 border-t border-[#F5F5F5]">
               {step > 1 && (
                 <Button type="button" variant="ghost" className="flex-1 h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F0F0F0]" onClick={prevStep}>
                    Return Node
                 </Button>
               )}
               {step < 3 ? (
                 <Button type="button" className="flex-1 h-16 bg-black text-white hover:bg-[#222222] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-black/10 active:scale-[0.98]" onClick={nextStep}>
                    Advance Protocol <ChevronRight className="h-4 w-4 ml-2 text-lime-400" />
                 </Button>
               ) : (
                 <Button type="submit" disabled={isSubmitting} className="flex-1 h-16 bg-lime-500 text-black hover:bg-lime-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-lime-500/20 active:scale-[0.98]">
                    {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : (isEdit ? "Publish Synchronization" : "Finalize Institutional Seal")}
                 </Button>
               )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

function StudentDetailModal({ isOpen, onClose, student, onNavigate, onEdit, onDelete }: any) {
  if (!isOpen || !student) return null;

  const payments = mockPayments.filter(p => p.student_id === student.id).slice(0, 3);
  const attendanceRaw = mockAttendance.filter(a => a.student_id === student.id).slice(0, 3);
  const complaints = mockComplaints.filter(c => c.student_id === student.id).slice(0, 2);
  const room = mockRooms.find(r => r.id === student.room_id);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-4xl border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row h-[700px]">
        <div className="w-[320px] bg-[#111111] p-10 flex flex-col text-white relative shrink-0">
          <div className="absolute top-0 left-0 p-12 opacity-5 pointer-events-none">
             <GraduationCap className="h-60 w-60 text-white" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
             <div className="relative group">
                <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                   <AvatarImage src={student.user?.profile_picture_url} className="object-cover" />
                   <AvatarFallback className="text-4xl font-black bg-[#222222] text-white">{student.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-lime-500 rounded-2xl flex items-center justify-center border-4 border-[#111111] shadow-lg shadow-lime-500/20">
                   <Check className="h-4 w-4 text-black" />
                </div>
             </div>
             <h3 className="text-2xl font-black uppercase italic tracking-tighter mt-6 leading-none">{student.user?.full_name}</h3>
             <Badge className="mt-3 bg-white/5 border border-white/10 text-lime-400 font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest leading-none">
                Verified Resident
             </Badge>
             <div className="mt-10 w-full space-y-4">
                <div className="flex items-center gap-4 text-left p-4 bg-white/5 rounded-2xl border border-white/5">
                   <Phone className="h-4 w-4 text-lime-500" />
                   <div>
                      <p className="text-[8px] font-black uppercase text-white/40 tracking-widest">Mobile Node</p>
                      <p className="text-xs font-bold text-white/80">{student.user?.phone_number || 'Not Set'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 text-left p-4 bg-white/5 rounded-2xl border border-white/5">
                   <Mail className="h-4 w-4 text-lime-500" />
                   <div>
                      <p className="text-[8px] font-black uppercase text-white/40 tracking-widest">Communication Email</p>
                      <p className="text-[10px] font-bold text-white/80 lowercase truncate max-w-[150px]">{student.user?.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 text-left p-4 bg-white/5 rounded-2xl border border-white/5">
                   <MapPin className="h-4 w-4 text-lime-500" />
                   <div>
                      <p className="text-[8px] font-black uppercase text-white/40 tracking-widest">Residential Zoning</p>
                      <p className="text-xs font-bold text-white/80">{room ? `${room.room_number} • ${room.building_id}` : 'Allocation Pending'}</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="mt-auto z-10">
             <Button variant="ghost" className="w-full h-14 text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest border border-white/10 rounded-2xl" onClick={onClose}>
                Exit Terminal
             </Button>
          </div>
        </div>

        <div className="flex-1 bg-white p-10 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h4 className="text-xl font-black text-[#111111] uppercase italic tracking-tighter">Student <span className="text-lime-500">Intelligence Matrix</span></h4>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest mt-1">Institutional ID: {student.student_id}</p>
             </div>
             <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-[#F0F0F0] hover:bg-lime-50 hover:text-lime-600 transition-all" onClick={onEdit}>
                   <Edit className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-[#F0F0F0] hover:bg-rose-50 hover:text-rose-600 transition-all" onClick={onDelete}>
                   <Trash2 className="h-5 w-5" />
                </Button>
             </div>
          </div>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
             <TabsList className="bg-[#111111] p-1 rounded-2xl h-12 w-full mb-8">
                <TabsTrigger value="overview" className="rounded-xl flex-1 h-full data-[state=active]:bg-[#D4FF3F] data-[state=active]:text-black font-black text-[9px] uppercase tracking-widest text-white/50">Overview</TabsTrigger>
                <TabsTrigger value="ledger" className="rounded-xl flex-1 h-full data-[state=active]:bg-[#D4FF3F] data-[state=active]:text-black font-black text-[9px] uppercase tracking-widest text-white/50">Fiscal Ledger</TabsTrigger>
                <TabsTrigger value="presence" className="rounded-xl flex-1 h-full data-[state=active]:bg-[#D4FF3F] data-[state=active]:text-black font-black text-[9px] uppercase tracking-widest text-white/50">Presence Info</TabsTrigger>
             </TabsList>

             <div className="flex-1 overflow-y-auto pr-2 no-scrollbar min-h-0">
                <TabsContent value="overview" className="m-0 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5">
                         <h5 className="text-[9px] font-black text-[#919191] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <GraduationCap className="h-3 w-3 text-lime-500" /> Academic Node
                         </h5>
                         <p className="font-black text-xs text-[#111111] uppercase italic">{student.department}</p>
                         <p className="text-[10px] font-bold text-[#919191] mt-1 italic uppercase">Batch Year {student.year_of_study}</p>
                      </div>
                      <div className="p-6 bg-[#111111] rounded-[2rem] border border-white/5 text-white">
                         <h5 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Bed className="h-3 w-3 text-lime-500" /> Facility Hub
                         </h5>
                         <p className="font-black text-xs uppercase italic">{room?.room_number || 'PENDING'}</p>
                         <p className="text-[10px] font-bold text-white/30 mt-1 italic uppercase">{room?.building_id || 'AWAITING SECTOR'}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] italic">Active Operational Events</h5>
                      <div className="space-y-3">
                         {complaints.length > 0 ? complaints.map((c, i) => (
                           <div key={i} className="p-5 bg-white border border-[#F0F0F0] rounded-2xl flex items-center justify-between group cursor-pointer hover:border-lime-500 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center">
                                    <ShieldAlert className="h-5 w-5 text-rose-500" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase italic text-[#111111]">{c.title}</p>
                                    <p className="text-[8px] font-bold text-[#919191] uppercase tracking-widest">{c.status.replace('_', ' ')} • Issue Logged</p>
                                 </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-[#919191] group-hover:translate-x-1 transition-transform" />
                           </div>
                         )) : (
                           <div className="p-8 border-2 border-dashed border-[#F0F0F0] rounded-[2rem] text-center">
                              <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic">No protocol violations detected.</p>
                           </div>
                         )}
                      </div>
                   </div>
                   
                   <Button 
                    className="w-full h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    onClick={() => {
                        onClose();
                        onNavigate('allocations');
                    }}
                >
                    View Room Allocation Logic
                   </Button>
                </TabsContent>

                <TabsContent value="ledger" className="m-0 space-y-4">
                   <div className="p-8 bg-[#FAFBFC] rounded-[2rem] border border-black/5 text-center">
                      <p className="text-[10px] font-black text-[#919191] uppercase tracking-widest italic mb-2">Institutional Fiscal Status</p>
                      <h5 className="text-4xl font-black text-[#111111] italic tracking-tighter uppercase">CFA 0.00 <span className="text-[10px] text-lime-500 non-italic font-bold">DEBT FREE</span></h5>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] italic pl-2">Sync History</p>
                      {payments.map((p, i) => (
                        <div key={i} className="p-5 bg-white border border-[#F0F0F0] rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-lime-50 rounded-xl flex items-center justify-center">
                                 <CreditCard className="h-5 w-5 text-lime-600" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase italic text-[#111111]">{p.payment_type}</p>
                                 <p className="text-[8px] font-bold text-[#919191] uppercase tracking-widest">CFA {p.amount} • {p.payment_date || p.due_date}</p>
                              </div>
                           </div>
                           <Badge className="bg-lime-500/10 text-lime-700 border-none text-[8px] font-bold uppercase rounded-lg">Verified</Badge>
                        </div>
                      ))}
                   </div>
                   <Button 
                    className="w-full h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    onClick={() => {
                        onClose();
                        onNavigate('payments');
                    }}
                   >
                      Access Global Ledger
                   </Button>
                </TabsContent>

                <TabsContent value="presence" className="m-0 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5">
                         <p className="text-[9px] font-black uppercase text-[#919191] mb-2 tracking-widest">Global Attendance</p>
                         <h5 className="text-2xl font-black text-[#111111] italic uppercase">94.2%</h5>
                      </div>
                      <div className="p-6 bg-[#FAFBFC] rounded-[2rem] border border-black/5">
                         <p className="text-[9px] font-black uppercase text-[#919191] mb-2 tracking-widest">Last Ingress Node</p>
                         <h5 className="text-2xl font-black text-lime-600 italic uppercase">10:42 PM</h5>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] italic pl-2">Verification Registry</p>
                      {attendanceRaw.map((a, i) => (
                        <div key={i} className="p-5 bg-white border border-[#F0F0F0] rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", a.is_present ? "bg-lime-50" : "bg-rose-50")}>
                                 <Activity className={cn("h-5 w-5", a.is_present ? "text-lime-600" : "text-rose-500")} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase italic text-[#111111]">{a.date}</p>
                                 <p className="text-[8px] font-bold text-[#919191] uppercase tracking-widest">{a.is_present ? 'Ingress Verified' : 'Baseline Absence Logged'}</p>
                              </div>
                           </div>
                           <span className="font-mono text-[10px] font-black opacity-30">{a.check_in_time || '00:00'}</span>
                        </div>
                      ))}
                   </div>
                   <Button 
                    className="w-full h-14 bg-[#111111] text-white hover:bg-lime-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    onClick={() => {
                        onClose();
                        onNavigate('attendance');
                    }}
                >
                    View Full Presence Map
                   </Button>
                </TabsContent>
             </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}

function StudentDecommissionModal({ isOpen, onClose, student, onDelete }: { isOpen: boolean, onClose: () => void, student: any, onDelete: (id: string) => Promise<void> }) {
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !student) return null;

  const isConfirmed = confirmText === 'CONFIRM';

  const handleDecommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      await onDelete(student.id);
      toast.error("Student Node Decommissioned", {
        description: `Resident ${student.user?.full_name} has been purged from active registries.`,
      });
      onClose();
      setConfirmText('');
    } catch (err: any) {
      toast.error("Purge Failure", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <form onSubmit={handleDecommission}>
          <div className="p-8 border-b border-rose-50 flex justify-between items-center bg-rose-50/30">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-rose-600 uppercase italic tracking-tight">Security <span className="text-black">Override</span></h3>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">Decommissioning Protocol</p>
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
                  <span className="text-[10px] font-black uppercase tracking-widest">Permanent Destruction Warning</span>
               </div>
               <p className="text-xs font-bold text-[#555555] leading-relaxed">
                  You are about to purge <span className="text-black font-black uppercase italic">"{student.user?.full_name}"</span> from the institutional matrix. This will permanently sever all academic, fiscal, and residential ties.
               </p>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#919191] flex items-center justify-between">
                  Type <span className="text-rose-600 text-xs italic">"CONFIRM"</span> to execute
                  <Lock className="h-3 w-3 opacity-30" />
               </label>
               <input 
                  autoFocus
                  required
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="AUTHORIZATION CODE REQUIRED" 
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
              {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Execute Decommission"}
            </Button>
            
            <p className="text-[8px] font-black text-center text-[#919191] uppercase tracking-[0.3em] opacity-40">Administrative clearance level 4 required</p>
          </div>
        </form>
      </Card>
    </div>
  );
}
