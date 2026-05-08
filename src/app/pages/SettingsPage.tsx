import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Building2, 
  Camera, 
  Lock, 
  Activity,
  Zap,
  LayoutGrid,
  History,
  Globe,
  Save,
  Trash2,
  Clock,
  MapPin,
  ChevronRight,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Fingerprint,
  ShieldCheck,
  Wrench,
  Package,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { Loader2 } from 'lucide-react';
// import { mockStudents, mockAllocations, mockRooms, mockBuildings } from '../data/mockData';

// --- Identity Update Modal ---
function IdentityUpdateModal({ isOpen, onClose, onUpload }: { isOpen: boolean, onClose: () => void, onUpload: (file: File) => Promise<void> }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    await onUpload(selectedFile);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-sm border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#FAFBFC]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#111111] flex items-center justify-center">
              <Camera className="h-5 w-5 text-lime-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black text-[#111111] uppercase italic tracking-tight">Update <span className="text-lime-500">Avatar</span></h3>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-[#111111]" />
          </button>
        </div>
        <div className="p-8 flex flex-col items-center justify-center space-y-6">
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
           
           <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-32 w-32 rounded-full border-4 border-dashed border-[#F0F0F0] flex items-center justify-center bg-[#FAFBFC] text-[#919191] hover:border-lime-500 hover:text-lime-600 transition-colors cursor-pointer relative overflow-hidden group"
           >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <Camera className="h-8 w-8 z-10 relative group-hover:scale-110 transition-transform" />
              )}
              <div className="absolute inset-0 bg-lime-50 opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
           
           <div className="text-center">
              <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">{selectedFile ? selectedFile.name : 'No file selected'}</p>
              <p className="text-[9px] font-bold text-[#919191] uppercase tracking-[0.2em] mt-1">Institutional Biometric Artifact</p>
           </div>
           
           <Button 
            onClick={handleConfirm} 
            disabled={isUploading || !selectedFile} 
            className="w-full h-14 bg-[#111111] hover:bg-lime-500 hover:text-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
           >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Synchronize Identity'}
           </Button>
        </div>
      </Card>
    </div>
  );
}

// --- Security Action Modal ---
function SecurityActionModal({ isOpen, onClose, actionType }: { isOpen: boolean, onClose: () => void, actionType: 'rotate' | 'deactivate' }) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isOpen) return null;

  const handleAction = () => {
     setIsProcessing(true);
     setTimeout(() => {
        setIsProcessing(false);
        if (actionType === 'rotate') {
           toast.success('Security Protocol Initiated', { description: 'Access keys rotated successfully.' });
        } else {
           toast.error('Deactivation Request Submitted', { description: 'Requires administrator approval.' });
        }
        onClose();
     }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-sm border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center bg-[#111111] text-white">
          <div className="flex items-center gap-4">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", actionType === 'rotate' ? 'bg-lime-500 text-black' : 'bg-rose-500 text-white')}>
              {actionType === 'rotate' ? <Fingerprint className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black uppercase italic tracking-tight">{actionType === 'rotate' ? 'Rotate Key' : 'Deactivate'}</h3>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="p-8 space-y-6">
           <p className="text-xs font-bold text-[#555555] leading-relaxed text-left">
              {actionType === 'rotate' ? 'Are you sure you want to invalidate all active sessions and generate a new cryptographic key-pair?' : 'Initiating this protocol will restrict your access and ping administration for full account archival. Proceed?'}
           </p>
           
           <div className="space-y-3">
              <Button onClick={handleAction} disabled={isProcessing} className={cn("w-full h-14 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", actionType === 'rotate' ? "bg-[#111111] hover:bg-black" : "bg-rose-600 hover:bg-rose-700")}>
                 {isProcessing ? <Activity className="h-4 w-4 animate-spin" /> : 'Confirm Protocol'}
              </Button>
              <Button onClick={onClose} variant="ghost" className="w-full h-14 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F0F0F0]">
                 Abort
              </Button>
           </div>
        </div>
      </Card>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const { 
    isLoading: settingsLoading, 
    studentProfile, 
    domicile, 
    systemSettings, 
    updateProfile, 
    updateStudentProfile, 
    updateSystemSetting,
    uploadAvatar 
  } = useSettings();

  const [activeTab, setActiveTab] = useState('identity');
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [securityModalType, setSecurityModalType] = useState<'rotate' | 'deactivate' | null>(null);
  
  // Local state for profile form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isAuditor = user?.role === 'auditor';
  const isFinance = user?.role === 'finance_officer';
  const isMaintenance = user?.role === 'maintenance_staff';
  const isSecurity = user?.role === 'security';

  const handleSave = async () => {
    // 1. Update Core Identity
    await updateProfile({
      full_name: fullName,
      phone_number: phoneNumber
    });

    toast.success(isAdmin ? "Operational Protocols Synced" : isFinance ? "Fiscal Engineering Nodes Updated" : isAuditor ? "Forensic Protocols Synced" : "Settings Synchronized", {
      description: isAdmin 
        ? "Global system variables and threshold matrices updated." 
        : isFinance
        ? "Institutional revenue nodes and penalty matrices have been synchronized."
        : isAuditor 
        ? "Global ledger verification and identity buffers updated." 
        : "Localized telemetry and profile buffers updated successfully.",
    });
  };

  if (settingsLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-lime-500" />
          <p className="text-sm font-black uppercase tracking-widest text-[#919191]">Decrypting Config Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]/50 md:p-8 p-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tactical Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black italic tracking-tighter text-[#111111] uppercase text-left">
          {isStudent ? 'User' : isAuditor ? 'Forensic' : isMaintenance ? 'Crew' : isSecurity ? 'Guard' : 'System'} <span className="text-lime-500">Config</span>
        </h1>
        <p className="text-sm font-medium text-[#919191] text-left">
          {isStudent 
            ? 'Manage your personal identity, domicile nodes, and notification matrix.' 
            : isAuditor
            ? 'Orchestrate forensic protocols, jurisdictional scope, and compliance telemetry.'
            : isMaintenance
            ? 'Configure toolkit loadouts, shift availability, and operational boundaries.'
            : isSecurity
            ? 'Configure perimeter jurisdiction, security nodes, and shift rotations.'
            : 'Manage administrative protocols, security tiers, and notification dispatch.'}
        </p>
      </div>

      <Tabs defaultValue="identity" className="flex flex-col lg:flex-row gap-8 items-start" onValueChange={setActiveTab}>
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0">
          <TabsList className="flex flex-col h-auto w-full bg-white p-2 rounded-[2rem] shadow-2xl shadow-black/5 border border-[#F0F0F0] gap-1">
            <TabsTrigger 
              value="identity" 
              className="flex items-center justify-start gap-3 w-full px-6 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all data-[state=active]:bg-[#111111] data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
            >
              <User className="h-4 w-4" /> Identity
            </TabsTrigger>
            
            <TabsTrigger 
              value={isStudent ? "domicile" : isMaintenance ? "toolkit" : isSecurity ? "post" : "organization"} 
              className="flex items-center justify-start gap-3 w-full px-6 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all data-[state=active]:bg-[#111111] data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
            >
              {isStudent ? <Building2 className="h-4 w-4" /> : isMaintenance ? <Wrench className="h-4 w-4" /> : isSecurity ? <MapPin className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />} 
              {isStudent ? 'Domicile' : isAuditor ? 'Jurisdiction' : isFinance ? 'Fiscal Protocol' : isMaintenance ? 'Toolkit' : isSecurity ? 'Post Orders' : 'Organization'}
            </TabsTrigger>

            <TabsTrigger 
              value="telemetry" 
              className="flex items-center justify-start gap-3 w-full px-6 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all data-[state=active]:bg-[#111111] data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
            >
              <Bell className="h-4 w-4" /> Telemetry
            </TabsTrigger>
            
            <TabsTrigger 
              value="security" 
              className="flex items-center justify-start gap-3 w-full px-6 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all data-[state=active]:bg-[#111111] data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
            >
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          <div className="mt-8 p-6 rounded-[2rem] bg-[#111111] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500 text-left">
              <Shield className="h-32 w-32" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500 mb-2 text-left">Protocol Status</h4>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
              <p className="text-xs font-bold italic text-left">{isAdmin ? 'Master System Sync Active' : isAuditor ? 'Forensic Ledger Link Active' : 'Secure • Cloud Sync Active'}</p>
            </div>
            <Button className="w-full bg-lime-500 text-black hover:bg-lime-600 rounded-xl font-black text-[9px] uppercase tracking-widest h-12 shadow-lg shadow-lime-500/20 active:scale-95 transition-all outline-none border-none" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Sync Protocols
            </Button>
          </div>
        </div>

        {/* Content Matrix */}
        <div className="flex-1 w-full min-w-0">
          <TabsContent value="identity" className="m-0 focus-visible:outline-none">
            <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
              <CardHeader className="p-8 pb-0 text-left">
                <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">
                  {isFinance ? 'Fiscal' : isStudent ? 'Personal' : isAuditor ? 'Auditor' : isMaintenance ? 'Operative' : isSecurity ? 'Security' : 'Warden'} <span className="text-lime-500 italic">Identity</span>
                </h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">Digital core and credentialing parameters.</p>
              </CardHeader>
              <CardContent className="p-8 flex flex-col gap-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group text-left">
                    <Avatar className="h-32 w-32 rounded-[2rem] border-4 border-[#F9FAFB] shadow-xl group-hover:scale-95 transition-transform duration-500 ring-2 ring-lime-500/20">
                      <AvatarImage src={user?.profile_picture_url} />
                      <AvatarFallback className="bg-lime-500 text-black font-black text-2xl">{user?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#111111] text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-lime-500 hover:text-black transition-all active:scale-90 z-20" onClick={() => setIsIdentityModalOpen(true)}>
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-center md:text-left">
                    <h4 className="text-2xl font-black text-[#111111] uppercase tracking-tighter text-left">{user?.full_name}</h4>
                    <p className="text-[11px] font-bold text-[#919191] uppercase tracking-widest mb-4 italic text-left">
                      {isStudent 
                        ? `${studentProfile?.department || 'Sector Pending'} • Year ${studentProfile?.year_of_study || 'N/A'}` 
                        : isAuditor
                        ? 'Chief Compliance Auditor • Global Oversight Tier'
                        : isFinance
                        ? 'Chief Financial Officer • Fiscal Intelligence Lead'
                        : isMaintenance
                        ? 'Chief Tactical Operative • Elite Dispatch Node'
                        : isSecurity
                        ? 'Chief Security Officer • Perimeter Defense Grid'
                        : 'Chief Operations Warden • Block A Executive'}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                       <Badge className="bg-lime-500/10 text-lime-700 text-[8px] font-black uppercase tracking-widest border-none px-3 py-1">
                        {isStudent ? 'Verified Student' : isAuditor ? 'Verified Auditor' : isFinance ? 'Verified CFO' : isSecurity ? 'Verified Security' : 'Verified Admin'}
                      </Badge>
                      <Badge className="bg-[#111111]/5 text-[#555555] text-[8px] font-black uppercase tracking-widest border-none px-3 py-1">
                        {isStudent ? `ID: ${studentProfile?.student_id || 'PENDING'}` : isFinance ? 'Executive Tier' : isSecurity ? 'Tactical Tier' : 'Senior Tier'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#F0F0F0]" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#111111] text-left">Full Name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-14 rounded-2xl bg-[#F9FAFB] border-none font-bold text-sm focus:ring-lime-500/20 shadow-inner text-left px-5" />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#111111] text-left">Email Address</Label>
                    <Input value={user?.email} readOnly className="h-14 rounded-2xl bg-[#FAFBFC] border-none font-bold text-sm focus:ring-lime-500/20 shadow-inner text-left px-5 opacity-60 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2 flex flex-col text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#111111] mb-2 text-left">{isFinance ? 'Fiscal Key (CFO-ID)' : isSecurity ? 'Gate Key (SO-ID)' : 'System Key (UID)'}</Label>
                    <div className="relative group text-left">
                      <Input value={isFinance ? `CFO-${user?.id?.slice(0, 8)}` : isSecurity ? `SO-${user?.id?.slice(0,8)}` : isStudent ? studentProfile?.student_id : user?.id} readOnly className="h-14 rounded-2xl bg-[#FAFBFC] border-none font-mono text-xs cursor-not-allowed italic text-[#919191] shadow-inner w-full pr-12 text-left px-5" />
                      {!isStudent && (
                        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-10 w-10 text-lime-600 hover:bg-lime-50 rounded-xl" title="Regenerate Core Matrix">
                           <Zap className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#111111] text-left">Contact Ph.</Label>
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="h-14 rounded-2xl bg-[#F9FAFB] border-none font-bold text-sm shadow-inner text-left px-5" />
                  </div>
                </div>

                {isFinance && (
                  <div className="p-6 rounded-3xl bg-[#111111] text-white border border-white/5 text-left relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Fingerprint className="h-20 w-20" />
                     </div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-lime-500 mb-4 flex items-center gap-2 text-left">
                       <ShieldCheck className="h-3 w-3" /> Digital Fiscal Signature
                     </h5>
                     <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="h-16 w-48 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center bg-white/5">
                           <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">Signed: {user?.full_name}</p>
                        </div>
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all">
                           Update Signature Matrix
                        </Button>
                     </div>
                  </div>
                )}

                {isStudent && (
                  <div className="p-6 rounded-3xl bg-lime-500/5 border border-dashed border-lime-500/20 text-left">
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-lime-700 mb-4 flex items-center gap-2 text-left">
                       <Shield className="h-3 w-3" /> Emergency Contacts
                     </h5>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="space-y-1 text-left">
                          <p className="text-[10px] font-bold text-[#919191] uppercase text-left">Guardian Name</p>
                          <p className="text-sm font-black text-[#111111] text-left">{studentProfile?.emergency_contact_name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1 text-left">
                          <p className="text-[10px] font-bold text-[#919191] uppercase text-left">Relation / Phone</p>
                          <p className="text-sm font-black text-[#111111] italic text-left">{studentProfile?.emergency_contact_relation || 'N/A'} • {studentProfile?.emergency_contact_phone || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={isStudent ? "domicile" : isMaintenance ? "toolkit" : "organization"} className="m-0 focus-visible:outline-none">
            {isStudent ? (
              <StudentDomicileView domicileInfo={domicile} />
            ) : isFinance ? (
              <FinanceFiscalView />
            ) : isMaintenance ? (
              <MaintenanceToolkitView />
            ) : isAdmin ? (
              <AdminOrganizationView user={user} />
            ) : (
              <AuditorJurisdictionView />
            )}
          </TabsContent>

          <TabsContent value="telemetry" className="m-0 focus-visible:outline-none">
            <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
              <CardHeader className="p-8 text-left">
                <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">
                  {isAdmin ? 'System' : isAuditor ? 'Forensic' : 'Notification'} <span className="text-lime-500 italic">Telemetry</span>
                </h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">
                  {isAdmin ? 'Configure master dispatch and threshold vitalities.' : 'Fine-tune system-dispatch thresholds.'}
                </p>
              </CardHeader>
              <CardContent className="p-8 flex flex-col gap-10">
                {isFinance && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 text-left">
                     {[
                       { label: 'Liquidity Variance Limit', value: '15%', color: 'bg-lime-500' },
                       { label: 'Unverified Receipt Settle', value: '48h', color: 'bg-amber-500' },
                       { label: 'Requisition Burn Rate', value: '30%', color: 'bg-rose-500' },
                     ].map((t, idx) => (
                       <div key={idx} className="p-6 rounded-3xl bg-[#FAFBFC] border border-[#F0F0F0] space-y-3 text-left">
                          <p className="text-[9px] font-black uppercase text-[#919191] tracking-widest text-left">{t.label}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black italic">{t.value}</span>
                            <div className={cn("h-2 w-12 rounded-full", t.color)} />
                          </div>
                          <div className="h-1 w-full bg-[#F0F0F0] rounded-full overflow-hidden">
                            <div className={cn("h-full transition-all duration-1000", t.color)} style={{ width: t.value.includes('h') ? '60%' : t.value }} />
                          </div>
                       </div>
                     ))}
                  </div>
                )}

                {isAdmin && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 text-left">
                     {[
                       { label: 'Occupancy Alert Threshold', value: '85%', color: 'bg-lime-500' },
                       { label: 'Minimum Ration Stock', value: '25%', color: 'bg-amber-500' },
                       { label: 'Revenue Pulse Variance', value: '12%', color: 'bg-rose-500' },
                     ].map((t, idx) => (
                       <div key={idx} className="p-6 rounded-3xl bg-[#FAFBFC] border border-[#F0F0F0] space-y-3 text-left">
                          <p className="text-[9px] font-black uppercase text-[#919191] tracking-widest text-left">{t.label}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black italic">{t.value}</span>
                            <div className={cn("h-2 w-12 rounded-full", t.color)} />
                          </div>
                          <div className="h-1 w-full bg-[#F0F0F0] rounded-full overflow-hidden">
                            <div className={cn("h-full transition-all duration-1000", t.color)} style={{ width: t.value }} />
                          </div>
                       </div>
                     ))}
                  </div>
                )}

                <div className="space-y-8 text-left">
                  {[
                    { 
                      title: isStudent ? 'Meal Alerts' : isAuditor ? 'Discrepancy Sensitivity' : 'Operational Alerts', 
                      desc: isStudent ? 'Receive pings for breakfast, lunch, and mess menu updates.' : isAuditor ? 'Real-time pings for ledger mismatches and inventory anomalies.' : 'Real-time updates on visitor entries, student check-ins, and curfew logs.', 
                      icon: Globe 
                    },
                    { 
                      title: isStudent ? 'Invoice & Fees' : isAuditor ? 'Revenue Variance' : 'Financial Heartbeat', 
                      desc: isStudent ? 'Critical pings for payment deadlines and cleared transactions.' : isAuditor ? 'Threshold alerts for income variations exceeding 5% margins.' : 'Critical revenue updates, invoice generation, and delinquency pings.', 
                      icon: Activity 
                    },
                    { 
                      title: isStudent ? 'Maintenance Logs' : isAuditor ? 'Compliance Breaches' : 'Security Protocols', 
                      desc: isStudent ? 'Track the status of your reported complaints and cleaning schedules.' : isAuditor ? 'Immediate dispatch for protocol violations across active nodes.' : 'Emergency dispatch notifications and unauthorized access warnings.', 
                      icon: Shield 
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-8 group">
                      <div className="flex items-start gap-4 text-left">
                        <div className="h-12 w-12 rounded-2xl bg-[#F9FAFB] flex items-center justify-center group-hover:bg-lime-100 transition-colors">
                          <item.icon className="h-6 w-6 text-lime-600" />
                        </div>
                        <div className="space-y-1 text-left">
                          <h4 className="text-sm font-black text-[#111111] uppercase italic text-left">{item.title}</h4>
                          <p className="text-[10px] font-bold text-[#919191] leading-relaxed max-w-sm tracking-tight text-left">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#919191]">Sync Tier</span>
                          <span className="text-[10px] font-bold text-lime-600 italic uppercase">High</span>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-lime-500 scale-110" />
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="mt-6 flex flex-col gap-4 text-left">
                    <Separator className="bg-[#F0F0F0]" />
                    <div className="flex items-center justify-between text-left">
                       <h4 className="text-sm font-black text-[#111111] uppercase italic tracking-widest text-left">Live System <span className="text-lime-500">Log</span></h4>
                       <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-lime-500/5 text-lime-600 border-none">Live Telemetry</Badge>
                    </div>
                    <div className="bg-[#111111] rounded-[2rem] p-6 font-mono text-[9px] text-lime-500/80 h-[160px] overflow-y-auto space-y-2 border border-white/5 text-left">
                       <p><span className="text-white/30">[13:04:12]</span> PROTOCOL_SYNC: Global ledger indices updated.</p>
                       <p><span className="text-white/30">[13:03:55]</span> GATE_NODE_4: Student check-in verified (STD-8842).</p>
                       <p><span className="text-white/30">[13:02:10]</span> MESS_VITALITY: Revenue pulse detected (+5% growth).</p>
                       <p><span className="text-white/30">[13:01:45]</span> SECURITY_ALERT: IP rotation initialized for terminal B.</p>
                       <p><span className="text-white/30">[13:01:02]</span> SYSTEM: Backup protocols synchronized successfully.</p>
                       <div className="animate-pulse">_</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="m-0 focus-visible:outline-none text-left">
            <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
              <CardHeader className="p-8 text-left">
                <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">
                  {isAdmin ? 'Tactical' : isAuditor ? 'Forensic' : 'Access'} <span className="text-lime-500 italic">Security</span>
                </h3>
                <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">
                  {isAdmin ? 'Master override, privilege matrix, and credential protocols.' : 'Credential rotation and authentication protocols.'}
                </p>
              </CardHeader>
              <CardContent className="p-8 flex flex-col gap-8 text-left">
                {isAdmin && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4 text-left">
                    <div className="p-6 rounded-3xl bg-[#FAFBFC] border border-[#F0F0F0] space-y-4 text-left">
                       <div className="flex items-center justify-between text-left">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-[#111111] text-left">Privilege Matrix</h5>
                          <Settings2 className="h-4 w-4 text-lime-600" />
                       </div>
                       <div className="space-y-3 text-left">
                          {[
                            { role: 'Sub-Warden', access: 'Tier 2 Ops', active: 3 },
                            { role: 'Kitchen Staff', access: 'Mess Node', active: 8 },
                            { role: 'Security Node', access: 'Access Control', active: 5 },
                          ].map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-black/5 text-left">
                               <div className="flex flex-col text-left">
                                 <span className="text-[11px] font-black text-[#111111] text-left">{p.role}</span>
                                 <span className="text-[8px] font-bold text-[#919191] uppercase text-left">{p.access}</span>
                               </div>
                               <Badge className="bg-[#111111] text-white text-[8px] font-bold rounded-lg px-2 text-left">{p.active}</Badge>
                            </div>
                          ))}
                       </div>
                       <Button variant="ghost" className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest group">
                          Manage Roles <ChevronRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                       </Button>
                    </div>

                    <div className="p-6 rounded-3xl bg-[#111111] text-white border border-[#F0F0F0] space-y-4 flex flex-col justify-between text-left">
                       <div className="flex items-center justify-between text-left">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-lime-500 text-left">Auth Protocols</h5>
                          <Lock className="h-4 w-4 text-white" />
                       </div>
                       <div className="space-y-4 text-left">
                          <div className="flex justify-between items-center text-left">
                             <div className="flex flex-col text-left">
                               <span className="text-[11px] font-black uppercase tracking-widest text-left">Global 2FA Force</span>
                               <span className="text-[8px] font-bold text-white/40 italic text-left">Enforce MFA for all staff nodes</span>
                             </div>
                             <Switch defaultChecked className="data-[state=checked]:bg-lime-500 scale-110" />
                          </div>
                          <div className="flex justify-between items-center text-left">
                             <div className="flex flex-col text-left">
                               <span className="text-[11px] font-black uppercase tracking-widest text-left">IP Restriction</span>
                               <span className="text-[8px] font-bold text-white/40 italic text-left">Inhibit access from unknown IPs</span>
                             </div>
                             <Switch className="data-[state=checked]:bg-lime-500 scale-110" />
                          </div>
                          <div className="flex justify-between items-center text-left">
                             <div className="flex flex-col text-left">
                               <span className="text-[11px] font-black uppercase tracking-widest text-left">Audit Retention</span>
                               <span className="text-[8px] font-bold text-white/40 italic text-left">Store system logs for 90 days</span>
                             </div>
                             <Badge variant="outline" className="border-white/10 text-white text-[9px] font-black px-3 py-1 bg-white/5 uppercase text-left">90 Days</Badge>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#111111] text-left">Current Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-[#F9FAFB] border-none font-bold text-sm shadow-inner text-left px-5" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#111111] text-left">New Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-[#F9FAFB] border-none font-bold text-sm shadow-inner text-left px-5" />
                    </div>
                  </div>
                  {isFinance && (
                    <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 space-y-4">
                       <div className="flex items-center justify-between">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-900">Disbursement Threshold Matrix</h5>
                          <Lock className="h-4 w-4 text-amber-600" />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase text-amber-800">Max Auto-Approve (Warden)</Label>
                             <div className="relative">
                                <Input defaultValue="5000" className="h-12 rounded-xl bg-white border-none font-black text-xs text-amber-900 px-10 shadow-sm" />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-black text-[10px]">CFA</span>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase text-amber-800">Double-Sig Threshold</Label>
                             <div className="relative">
                                <Input defaultValue="25000" className="h-12 rounded-xl bg-white border-none font-black text-xs text-amber-900 px-10 shadow-sm" />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-black text-[10px]">CFA</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                  <Button variant="outline" className="h-12 px-8 rounded-2xl border-[#111111] border-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#111111] hover:text-white transition-all outline-none" onClick={() => setSecurityModalType('rotate')}>
                    {isFinance ? 'Update Fiscal Security Layers' : isAdmin ? 'Rotate System Key-Matrix' : isAuditor ? 'Rotate Forensic Key-Pair' : 'Rotate Access Key'}
                  </Button>
                </div>

                <Separator className="bg-[#F0F0F0] my-4" />

                <div className="space-y-6 p-6 rounded-[2rem] bg-rose-50 border-2 border-rose-100 flex items-center justify-between text-left">
                  <div className="flex items-start gap-4 text-left">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-rose-500" />
                    </div>
                    <div className="space-y-1 text-left">
                      <h4 className="text-sm font-black text-rose-900 uppercase italic text-left">Danger Zone</h4>
                      <p className="text-[10px] font-bold text-rose-600/80 leading-relaxed max-w-sm italic tracking-tight text-left">System reset deletes all localized telemetry. Irreversible protocol.</p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 px-6 shadow-lg shadow-rose-500/20 active:scale-95 transition-all outline-none border-none group" onClick={() => setSecurityModalType('deactivate')}>
                    <Trash2 className="h-4 w-4 mr-2" /> {isAdmin ? 'Deactivation Protocol' : 'Deactivate Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="post" className="m-0 focus-visible:outline-none">
            <SecurityPostView />
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="flex justify-end pt-4 italic text-left">
        <p className="text-[10px] font-black text-[#919191]/40 tracking-[0.2em] uppercase text-left">System Vers. 2.1 • Encryption Active • SHA-256</p>
      </div>
      <IdentityUpdateModal 
        isOpen={isIdentityModalOpen} 
        onClose={() => setIsIdentityModalOpen(false)} 
        onUpload={async (file) => {
          const url = await uploadAvatar(file);
          if (url) {
            toast.success('Identity Artifact Synchronized', { description: 'Profile picture reflected system-wide.' });
          }
        }}
      />
      <SecurityActionModal isOpen={securityModalType !== null} onClose={() => setSecurityModalType(null)} actionType={securityModalType || 'rotate'} />
    </div>
  );
}

function FinanceFiscalView() {
  return (
    <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
      <CardHeader className="p-8 text-left">
        <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">Fiscal <span className="text-lime-500 italic text-left">Protocol</span> Interface</h3>
        <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">Institutional revenue nodes and penalty matrices.</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col gap-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-6 text-left">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] mb-4 text-left">Revenue Stream Nodes</h4>
             {[
               { title: 'Premium Tier Subscription', val: 'CFA 12k / Mo', icon: Zap },
               { title: 'Institutional Mess Fund', val: 'CFA 5k / Mo', icon: Activity },
               { title: 'Security Security Vaulted', val: 'CFA 25k Ref.', icon: ShieldCheck },
             ].map((node, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-black/5">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border border-black/5">
                         <node.icon className="h-4 w-4 text-lime-600" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight text-[#111111]">{node.title}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-xs font-black italic">{node.val}</span>
                   </div>
                </div>
             ))}
             <Button variant="ghost" className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest group">
                Adjust Yield Structure <ChevronRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>

          <div className="space-y-6 text-left">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] mb-4 text-left">Penalty Variance Matrix</h4>
             <div className="grid grid-cols-2 gap-4 text-left">
                {[
                  { label: 'Grace Period', value: '5 Days' },
                  { label: 'Daily Penalty', value: 'CFA 50 / Day' },
                  { label: 'Max Accumulation', value: 'CFA 2,500' },
                  { label: 'Auto-Lock Inh.', value: '15 Days' },
                ].map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-dashed border-black/10 bg-white text-left">
                     <p className="text-[8px] font-black text-[#919191] uppercase tracking-[0.1em] text-left">{p.label}</p>
                     <p className="text-xs font-black text-[#111111] uppercase mt-1 italic tracking-tight text-left">{p.value}</p>
                  </div>
                ))}
             </div>
             <div className="p-6 rounded-3xl bg-[#111111] text-white space-y-4">
                <div className="flex items-center justify-between">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-lime-500">Institutional Constants</h5>
                   <Landmark className="h-4 w-4" />
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-bold text-white/40 italic">
                      <span>GSTIN Identifier</span>
                      <span className="text-white">22AAAAA0000A1Z5</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold text-white/40 italic">
                      <span>Financial Year</span>
                      <span className="text-white">FY 2026-27</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentDomicileView({ domicileInfo }: { domicileInfo: any }) {
  return (
    <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
      <CardHeader className="p-8 text-left">
        <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">Domicile <span className="text-lime-500 italic text-left">Matrix</span></h3>
        <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">Active room allocation and facility telemetry.</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col gap-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {[
            { label: 'Room No.', value: domicileInfo?.room_number, icon: Zap, sub: 'Assigned Node' },
            { label: 'Block Node', value: domicileInfo?.building_name, icon: Building2, sub: 'Sector Verified' },
            { label: 'Expected Exit', value: domicileInfo?.expected_checkout_date || 'N/A', icon: LayoutGrid, sub: 'Checkout Protocol' },
            { label: 'Allocation', value: domicileInfo?.allocation_date, icon: History, sub: 'Protocol Active' },
          ].map((field, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[#FAFBFC] border border-[#F0F0F0] group hover:border-[#111111] transition-all relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-125 transition-transform text-left">
                <field.icon className="h-20 w-20 text-black" />
              </div>
              <div className="flex items-center justify-between mb-4 text-left">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-all border border-black/5 text-left">
                  <field.icon className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="border-none text-[8px] font-black uppercase tracking-widest text-[#919191] text-left">Verified Node</Badge>
              </div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-[#919191] mb-1 text-left">{field.label}</h5>
              <p className="text-sm font-black text-[#111111] italic mb-1 uppercase tracking-tight text-left">{field.value || 'N/A'}</p>
              <p className="text-[9px] font-bold text-lime-600 uppercase tracking-widest text-left">{field.sub}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-[2rem] bg-lime-500 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-lime-400 transition-all duration-500 mt-2 text-left" onClick={() => toast.success('Facility Sync Active', { description: 'Your domicile records are synced with the global command terminal.' })}>
          <Globe className="h-12 w-12 text-black group-hover:rotate-12 transition-transform duration-500 text-left" />
          <div className="text-left">
            <h4 className="text-xl font-black text-black italic uppercase tracking-tighter text-left">Facility Sync Active</h4>
            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest text-left">Your domicile records are synced with the global command terminal.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminOrganizationView({ user }: { user: any }) {
  return (
    <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
      <CardHeader className="p-8 text-left">
        <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">Master <span className="text-lime-500 italic text-left">Protocol</span> Orchestration</h3>
        <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">Global operational variables and facility nodes.</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col gap-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-6 text-left">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] mb-4 text-left">Operational Protocols</h4>
             {[
               { title: 'Auto-Curfew Verification', desc: 'System-wide auto-check for student presence at 22:00.' },
               { title: 'Visitor Digital Pre-reg', desc: 'Mandatory QR generation for all external visitors.' },
               { title: 'Mess Credit Auto-Renewal', desc: 'Synchronize credits with quarterly invoicing pulses.' },
             ].map((p, idx) => (
               <div key={idx} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#F9FAFB] group text-left">
                 <div className="space-y-0.5 text-left">
                    <p className="text-[11px] font-black uppercase tracking-tight text-[#111111] text-left">{p.title}</p>
                    <p className="text-[9px] font-bold text-[#919191] leading-tight text-left">{p.desc}</p>
                 </div>
                 <Switch defaultChecked={idx !== 2} className="data-[state=checked]:bg-lime-500" />
               </div>
             ))}
          </div>

          <div className="space-y-6 text-left">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] mb-4 text-left">Master Zoning Static Nodes</h4>
             <div className="grid grid-cols-2 gap-4 text-left">
                {[
                  { label: 'Hostel Code', value: 'HMS-EXEC-01' },
                  { label: 'Total Capacity', value: '1,200 Nodes' },
                  { label: 'Active Blocks', value: 'Alpha, Beta, Gamma' },
                  { label: 'Primary Region', value: 'West Campus Zone' },
                ].map((n, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-dashed border-black/10 bg-white text-left">
                     <p className="text-[8px] font-black text-[#919191] uppercase tracking-[0.1em] text-left">{n.label}</p>
                     <p className="text-xs font-black text-[#111111] uppercase mt-1 italic tracking-tight text-left">{n.value}</p>
                  </div>
                ))}
             </div>
             <Button variant="outline" className="w-full h-12 rounded-xl border-[#111111] border-2 font-black text-[9px] uppercase tracking-widest hover:bg-[#111111] hover:text-white transition-all text-left">
                Edit Zoning Architecture
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditorJurisdictionView() {
  const auditNodes = [
    { label: 'Assigned Blocks', value: 'All Nodes (A, B, C)', icon: Building2 },
    { label: 'Audit Depth', value: 'Deep Forensic Level', icon: Shield },
    { label: 'Sync Frequency', value: 'Real-time Pulse', icon: Activity },
    { label: 'Compliance Tier', value: 'Global Administrator', icon: Zap },
  ];

  return (
    <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
      <CardHeader className="p-8 text-left">
        <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">Audit <span className="text-lime-500 italic text-left">Jurisdiction</span></h3>
        <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">Active nodes and financial sectors under oversight.</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col gap-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {auditNodes.map((field, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[#F9FAFB] border border-[#F0F0F0] group hover:border-[#111111] transition-all cursor-pointer text-left">
              <div className="flex items-center justify-between mb-4 text-left">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-all border border-black/5 text-left">
                  <field.icon className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="border-none text-[8px] font-black uppercase tracking-widest text-lime-600 text-left">Priority Sync</Badge>
              </div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-[#919191] mb-1 text-left">{field.label}</h5>
              <p className="text-sm font-black text-[#111111] italic text-left">{field.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MaintenanceToolkitView() {
  const tools = [
    { label: 'Primary Loadout', value: 'Alpha Plumbing Rig', icon: Wrench },
    { label: 'Secondary Toolset', value: 'Electrical Diagnostics', icon: Zap },
    { label: 'Security Clearance', value: 'Blocks A, B & Technical', icon: Shield },
    { label: 'Current Inventory', value: 'Verified (72/72 Items)', icon: Package },
  ];

  return (
    <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
      <CardHeader className="p-8 text-left">
        <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">Tactical <span className="text-lime-500 italic text-left">Toolkit</span></h3>
        <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">Current equipment mapping and operational availability.</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col gap-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {tools.map((field, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[#F9FAFB] border border-[#F0F0F0] group hover:border-[#111111] transition-all cursor-pointer text-left">
              <div className="flex items-center justify-between mb-4 text-left">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-all border border-black/5 text-left">
                  <field.icon className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="border-none text-[8px] font-black uppercase tracking-widest text-[#919191] text-left">Verified</Badge>
              </div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-[#919191] mb-1 text-left">{field.label}</h5>
              <p className="text-sm font-black text-[#111111] italic text-left">{field.value}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-[#F0F0F0] my-4" />

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] mb-4 text-left">Shift Availability & Routing</h4>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-left">
            <div className="space-y-0.5 text-left">
               <p className="text-[11px] font-black uppercase tracking-tight text-lime-800 text-left">Auto-Dispatch Readiness</p>
               <p className="text-[9px] font-bold text-lime-600/80 leading-tight text-left">Automatically accept emergency tasks when active.</p>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-lime-500" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9FAFB] group text-left">
            <div className="space-y-0.5 text-left">
               <p className="text-[11px] font-black uppercase tracking-tight text-[#111111] text-left">Override Notifications</p>
               <p className="text-[9px] font-bold text-[#919191] leading-tight text-left">Receive admin overrides instantly via SMS.</p>
            </div>
            <Switch className="data-[state=checked]:bg-lime-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityPostView() {
  const assignments = [
    { label: 'Active Post', value: 'Main Access Gate', icon: MapPin },
    { label: 'Shift Rotation', value: 'Night Block (18:00 - 06:00)', icon: Clock },
    { label: 'Clearance Level', value: 'Level 5 (All Tiers)', icon: Shield },
    { label: 'Operational Comms', value: 'Channel Alpha-9', icon: Bell },
  ];

  return (
    <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden text-left">
      <CardHeader className="p-8 text-left">
        <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter text-left">Post <span className="text-lime-500 italic text-left">Orders</span></h3>
        <p className="text-[10px] font-bold text-[#919191] uppercase tracking-widest text-left">Current perimeter assignments and shift configurations.</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col gap-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {assignments.map((field, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[#F9FAFB] border border-[#F0F0F0] group hover:border-[#111111] transition-all cursor-pointer text-left">
              <div className="flex items-center justify-between mb-4 text-left">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-all border border-black/5 text-left">
                  <field.icon className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="border-none text-[8px] font-black uppercase tracking-widest text-[#919191] text-left">Assigned</Badge>
              </div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-[#919191] mb-1 text-left">{field.label}</h5>
              <p className="text-sm font-black text-[#111111] italic text-left">{field.value}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-[#F0F0F0] my-4" />

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] mb-4 text-left">Escalation & Automation Protocols</h4>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left">
            <div className="space-y-0.5 text-left">
               <p className="text-[11px] font-black uppercase tracking-tight text-rose-800 text-left">Emergency Bypass Authority</p>
               <p className="text-[9px] font-bold text-rose-600/80 leading-tight text-left">Enable zero-auth gates during critical lockdown triggers.</p>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-rose-500" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-left group">
            <div className="space-y-0.5 text-left">
               <p className="text-[11px] font-black uppercase tracking-tight text-lime-800 text-left">Automated Shift Logs</p>
               <p className="text-[9px] font-bold text-lime-600/80 leading-tight text-left">System automatically clocks patrol shifts based on RFIDs.</p>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-lime-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
