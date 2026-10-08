import React, { useState, useEffect } from 'react';
import { useRideStore } from './store/useRideStore';
import { Navbar } from './components/Navbar';
import { CustomerView } from './views/CustomerView';
import { DriverView } from './views/DriverView';
import { AdminView } from './views/AdminView';
import { SosModal } from './components/SosModal';

export const App: React.FC = () => {
  const { currentRole, brandSettings } = useRideStore();
  const [isSosOpen, setIsSosOpen] = useState(false);

  // Dynamically update CSS root variables when Admin changes branding colors
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', brandSettings.primaryColorHex);
    document.documentElement.style.setProperty('--secondary-color', brandSettings.secondaryColorHex);
    document.title = `${brandSettings.appName} | ${brandSettings.tagline}`;
  }, [brandSettings]);

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col selection:bg-emerald-400 selection:text-black">
      {/* Top Navigation & Persona Switcher */}
      <Navbar onOpenSos={() => setIsSosOpen(true)} />

      {/* Main Role Container */}
      <main className="flex-1 flex flex-col">
        {currentRole === 'CUSTOMER' && <CustomerView onOpenSos={() => setIsSosOpen(true)} />}
        {currentRole === 'DRIVER' && <DriverView onOpenSos={() => setIsSosOpen(true)} />}
        {currentRole === 'ADMIN' && <AdminView />}
      </main>

      {/* Global Emergency SOS Modal */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
};

export default App;
