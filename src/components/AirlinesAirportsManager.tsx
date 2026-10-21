import React, { useState } from 'react';
import { DatabaseState, Airline, Airport } from '../types/schema';
import { dbService } from '../services/db';
import { Building2, Globe, Plus, Search, Plane, Users, DollarSign, MapPin } from 'lucide-react';

interface AirlinesAirportsManagerProps {
  dbState: DatabaseState;
  onDatabaseMutated: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const AirlinesAirportsManager: React.FC<AirlinesAirportsManagerProps> = ({
  dbState,
  onDatabaseMutated,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'airlines' | 'airports'>('airlines');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAirlineModal, setShowAddAirlineModal] = useState(false);
  const [showAddAirportModal, setShowAddAirportModal] = useState(false);

  // New Airline state
  const [newAirlineName, setNewAirlineName] = useState('');
  const [newAirlineCountry, setNewAirlineCountry] = useState('');
  const [newAirlineIata, setNewAirlineIata] = useState('');

  // New Airport state
  const [newAirportName, setNewAirportName] = useState('');
  const [newAirportCity, setNewAirportCity] = useState('');
  const [newAirportCountry, setNewAirportCountry] = useState('');
  const [newAirportIata, setNewAirportIata] = useState('');

  const handleCreateAirline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAirlineName.trim() || !newAirlineCountry.trim()) return;

    dbService.addAirline({
      airline_name: newAirlineName.trim(),
      country: newAirlineCountry.trim(),
      iata_code: newAirlineIata.trim().toUpperCase() || undefined
    });

    onDatabaseMutated();
    setShowAddAirlineModal(false);
    setNewAirlineName('');
    setNewAirlineCountry('');
    setNewAirlineIata('');
  };

  const handleCreateAirport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAirportName.trim() || !newAirportCity.trim() || !newAirportCountry.trim()) return;

    dbService.addAirport({
      name: newAirportName.trim(),
      city: newAirportCity.trim(),
      country: newAirportCountry.trim(),
      iata_code: newAirportIata.trim().toUpperCase() || 'HUB'
    });

    onDatabaseMutated();
    setShowAddAirportModal(false);
    setNewAirportName('');
    setNewAirportCity('');
    setNewAirportCountry('');
    setNewAirportIata('');
  };

  const filteredAirlines = dbState.Airlines.filter(a => {
    const q = searchQuery.toLowerCase();
    return a.airline_name.toLowerCase().includes(q) || a.country.toLowerCase().includes(q) || a.iata_code?.toLowerCase().includes(q);
  });

  const filteredAirports = dbState.Airport.filter(ap => {
    const q = searchQuery.toLowerCase();
    return ap.name.toLowerCase().includes(q) || ap.city.toLowerCase().includes(q) || ap.country.toLowerCase().includes(q) || ap.iata_code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            Airlines Fleet & Global Airport Hubs
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{dbState.Airlines.length} Commercial Airlines</span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Airport.length} Global Hub Terminals</span>
            <span aria-hidden="true">·</span>
            <span>Relational Entities: Airlines & Airport</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'airlines' ? (
            <button
              onClick={() => setShowAddAirlineModal(true)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Airline
            </button>
          ) : (
            <button
              onClick={() => setShowAddAirportModal(true)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Airport
            </button>
          )}
        </div>
      </div>

      {/* Segmented controls & search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSubTab('airlines')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'airlines' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Airlines Fleet ({dbState.Airlines.length})
          </button>
          <button
            onClick={() => setActiveSubTab('airports')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'airports' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Global Airport Hubs ({dbState.Airport.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'airlines' ? 'Search airlines or countries...' : 'Search airports, IATA or cities...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {activeSubTab === 'airlines' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAirlines.map(airline => {
            const flights = dbState.Flight.filter(f => f.airline_id === airline.airline_id);
            const staff = dbState.Staff.filter(s => s.airline_id === airline.airline_id);
            const airlineFlightIds = flights.map(f => f.flight_id);
            const bookings = dbState.Booking.filter(b => airlineFlightIds.includes(b.flight_id));
            const revenue = bookings.reduce((sum, b) => sum + (b.ticket_price || 0), 0);

            return (
              <div
                key={airline.airline_id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-sky-500/50 transition-all group"
              >
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-100 group-hover:text-sky-300 transition-colors">
                        {airline.airline_name}
                      </span>
                      {airline.iata_code && (
                        <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                          {airline.iata_code}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      Origin: {airline.country}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">ID: #{airline.airline_id}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-2 bg-slate-950/60 rounded-lg border border-slate-800/80 mb-3">
                  <div>
                    <div className="text-slate-500 text-[10px]">FLIGHTS</div>
                    <div className="text-sm font-bold text-slate-200">{flights.length}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">STAFF</div>
                    <div className="text-sm font-bold text-slate-200">{staff.length}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">REVENUE</div>
                    <div className="text-sm font-bold text-emerald-400">${revenue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 text-[11px]">
                    {bookings.length} confirmed bookings
                  </span>
                  <button
                    onClick={() => onNavigateToTab('flights')}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                  >
                    View Flights →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAirports.map(airport => {
            const outbound = dbState.Flight.filter(f => f.source_airport === airport.airport_id);
            const inbound = dbState.Flight.filter(f => f.destination_airport === airport.airport_id);

            return (
              <div
                key={airport.airport_id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-sky-500/50 transition-all group"
              >
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-amber-300 font-mono">
                        {airport.iata_code}
                      </span>
                      <span className="font-semibold text-sm text-slate-100 group-hover:text-sky-300 transition-colors">
                        {airport.city}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">
                      {airport.name}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">#{airport.airport_id}</span>
                </div>

                <div className="text-xs text-slate-400 mb-3 font-mono flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Country: {airport.country}</span>
                  {airport.timezone && <span className="text-slate-600">· {airport.timezone}</span>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono py-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <div>
                    <div className="text-slate-500 text-[10px]">DEPARTING (SOURCE)</div>
                    <div className="text-sm font-bold text-amber-400">{outbound.length} Flights</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">ARRIVING (DEST)</div>
                    <div className="text-sm font-bold text-emerald-400">{inbound.length} Flights</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Airline Modal */}
      {showAddAirlineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  Add New Commercial Airline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inserts a tuple into the <code className="text-sky-300 font-mono">Airlines</code> table.
                </p>
              </div>
              <button
                onClick={() => setShowAddAirlineModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAirline} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Airline Name (airline_name)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cathay Pacific"
                  value={newAirlineName}
                  onChange={(e) => setNewAirlineName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Country of Registry (country)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hong Kong"
                  value={newAirlineCountry}
                  onChange={(e) => setNewAirlineCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">IATA Code (Optional)</label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="e.g. CX"
                  value={newAirlineIata}
                  onChange={(e) => setNewAirlineIata(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono uppercase focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAirlineModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg"
                >
                  Save Airline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Airport Modal */}
      {showAddAirportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Add New Airport Terminal
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inserts a tuple into the <code className="text-sky-300 font-mono">Airport</code> table.
                </p>
              </div>
              <button
                onClick={() => setShowAddAirportModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAirport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Airport Name (name)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amsterdam Airport Schiphol"
                  value={newAirportName}
                  onChange={(e) => setNewAirportName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">City (city)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amsterdam"
                    value={newAirportCity}
                    onChange={(e) => setNewAirportCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Country (country)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netherlands"
                    value={newAirportCountry}
                    onChange={(e) => setNewAirportCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">IATA Code (3 letters)</label>
                <input
                  type="text"
                  maxLength={3}
                  required
                  placeholder="e.g. AMS"
                  value={newAirportIata}
                  onChange={(e) => setNewAirportIata(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono uppercase focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAirportModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg"
                >
                  Save Airport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
