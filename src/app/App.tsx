import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { RoomsPage } from './pages/RoomsPage';
import { AllocationsPage } from './pages/AllocationsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { VisitorsPage } from './pages/VisitorsPage';
import { AttendancePage } from './pages/AttendancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MessPage } from './pages/MessPage';
import { ReportsPage } from './pages/ReportsPage';


import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { Sheet, SheetContent } from './components/ui/sheet';
import { Network } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const { currentPage, navigate } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'students':
        return <StudentsPage />;
      case 'rooms':
        return <RoomsPage />;
      case 'allocations':
        return <AllocationsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'complaints':
        return <ComplaintsPage />;
      case 'visitors':
        return <VisitorsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'mess':
        return <MessPage />;
      case 'analytics':
        return <AnalyticsPage />;

      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;

      default:
        return <DashboardPage />;
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[280px] bg-[#111111] md:block overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Logo Area */}
          <div className="p-8 pb-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-[#D4FF3F] rounded-full" />
              <h1 className="text-xl font-bold text-white tracking-tighter">LANDMARK HMS</h1>
            </div>
            <button className="text-[#555555] hover:text-white transition-colors">
              <Network className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <Navigation currentPath={currentPage} userRole={user.role} onNavigate={handleNavigate} />
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-[#111111] border-none">
          <div className="flex h-full flex-col">
            <div className="p-8 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-[#D4FF3F] rounded-full" />
                <h1 className="text-xl font-bold text-white tracking-tighter">LANDMARK HMS</h1>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <Navigation
                currentPath={currentPage}
                userRole={user.role}
                onNavigate={handleNavigate}
                isMobile
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        <Layout onMenuClick={() => setMobileMenuOpen(true)}>{renderPage()}</Layout>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <NotificationProvider>
          <AppContent />
          <Toaster position="top-right" richColors />
        </NotificationProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}