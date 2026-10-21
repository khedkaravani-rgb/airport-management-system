import React, { useState } from 'react';
import { dbService } from './services/db';
import { DatabaseState } from './types/schema';
import { ERDVisualizer } from './components/ERDVisualizer';
import { SQLStudio } from './components/SQLStudio';
import { FlightsManager } from './components/FlightsManager';
import { BookingsManager } from './components/BookingsManager';
import { StaffAssignmentManager } from './components/StaffAssignmentManager';
import { PassengerManager } from './components/PassengerManager';
import { AirlinesAirportsManager } from './components/AirlinesAirportsManager';
import { RotateCcw, Plus, Plane, Sparkles, Check, Database } from 'lucide-react';

export default function App() {
  const [dbState, setDbState] = useState<DatabaseState>(() => dbService.getState());
  const [activeTab, setActiveTab] = useState<'flights' | 'bookings' | 'staff' | 'passengers' | 'airports' | 'erd' | 'sql'>('flights');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [resetNotification, setResetNotification] = useState(false);

  const handleDatabaseMutated = () => {
    setDbState({ ...dbService.getState() });
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to clean initial state with demo airlines, flights, and bookings?')) {
      const fresh = dbService.resetToDefault();
      setDbState({ ...fresh });
      setResetNotification(true);
      setTimeout(() => setResetNotification(false), 2500);
    }
  };

  // Nav link helper
  const navItems = [
    { id: 'flights', label: 'Flights & FIDS' },
    { id: 'bookings', label: 'Bookings & Check-in' },
    { id: 'staff', label: 'Crew & Assignments' },
    { id: 'passengers', label: 'Passengers' },
    { id: 'airports', label: 'Fleet & Hubs' },
    { id: 'erd', label: 'ERD Schema' },
    { id: 'sql', label: 'SQL Studio' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract: 3 zones separated by gap-8 (Brand - Links - 1 Action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <Plane className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
            SkyPort AMS
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === item.id
                  ? 'text-sky-400 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('flights');
              setShowScheduleModal(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Flight
          </button>
        </div>
      </header>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              activeTab === item.id ? 'bg-sky-500/20 text-sky-300 font-medium' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Workspace Toolbar with Database Status & Schema Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              airport_management_system
            </span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Airlines.length} Airlines</span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Airport.length} Airports</span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Flight.length} Flights</span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Passenger.length} Passengers</span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Booking.length} Bookings</span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Staff.length} Staff</span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Assignment.length} Crew Assignments</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {resetNotification && (
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                <Check className="w-3 h-3" /> Database Restored
              </span>
            )}
            <button
              onClick={handleResetData}
              title="Reset all tables to initial demo data"
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'flights' && (
          <FlightsManager
            dbState={dbState}
            onDatabaseMutated={handleDatabaseMutated}
            openScheduleModalDefault={showScheduleModal}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsManager
            dbState={dbState}
            onDatabaseMutated={handleDatabaseMutated}
          />
        )}

        {activeTab === 'staff' && (
          <StaffAssignmentManager
            dbState={dbState}
            onDatabaseMutated={handleDatabaseMutated}
          />
        )}

        {activeTab === 'passengers' && (
          <PassengerManager
            dbState={dbState}
            onDatabaseMutated={handleDatabaseMutated}
            onNavigateToTab={(t) => setActiveTab(t as any)}
          />
        )}

        {activeTab === 'airports' && (
          <AirlinesAirportsManager
            dbState={dbState}
            onDatabaseMutated={handleDatabaseMutated}
            onNavigateToTab={(t) => setActiveTab(t as any)}
          />
        )}

        {activeTab === 'erd' && (
          <ERDVisualizer
            dbState={dbState}
            onNavigateToTab={(t) => setActiveTab(t as any)}
          />
        )}

        {activeTab === 'sql' && (
          <SQLStudio
            onDatabaseMutated={handleDatabaseMutated}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <div>SkyPort AMS · Relational Airport Management System & Interactive ERD</div>
        <div className="text-[11px] text-slate-600 mt-1">
          Compliant with MySQL 8.0 ANSI Relational Standards · 3NF Normalized Architecture
        </div>
      </footer>
    </div>
  );
}
