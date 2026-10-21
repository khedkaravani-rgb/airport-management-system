import React, { useState } from 'react';
import { DatabaseState, Flight, FlightStatus } from '../types/schema';
import { dbService } from '../services/db';
import { Plane, Plus, Search, Filter, Clock, MapPin, Users, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface FlightsManagerProps {
  dbState: DatabaseState;
  onDatabaseMutated: () => void;
  openScheduleModalDefault?: boolean;
}

export const FlightsManager: React.FC<FlightsManagerProps> = ({
  dbState,
  onDatabaseMutated,
  openScheduleModalDefault = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [directionFilter, setDirectionFilter] = useState<'All' | 'Departures' | 'Arrivals'>('All');
  const [showScheduleModal, setShowScheduleModal] = useState(openScheduleModalDefault);
  const [selectedFlightForDetails, setSelectedFlightForDetails] = useState<Flight | null>(null);

  // New flight form state
  const [newFlightNo, setNewFlightNo] = useState('');
  const [newAirlineId, setNewAirlineId] = useState<number>(dbState.Airlines[0]?.airline_id || 1);
  const [newSourceId, setNewSourceId] = useState<number>(dbState.Airport[0]?.airport_id || 1);
  const [newDestId, setNewDestId] = useState<number>(dbState.Airport[1]?.airport_id || 2);
  const [newDepTime, setNewDepTime] = useState('2026-10-18T14:00');
  const [newArrTime, setNewArrTime] = useState('2026-10-18T19:30');
  const [newGate, setNewGate] = useState('A05');
  const [newTerminal, setNewTerminal] = useState('T1');
  const [newAircraft, setNewAircraft] = useState('Airbus A350-900');
  const [newStatus, setNewStatus] = useState<FlightStatus>('Scheduled');

  const getAirline = (airlineId: number) => dbState.Airlines.find(a => a.airline_id === airlineId);
  const getAirport = (airportId: number) => dbState.Airport.find(a => a.airport_id === airportId);

  const filteredFlights = dbState.Flight.filter(flight => {
    const airline = getAirline(flight.airline_id);
    const source = getAirport(flight.source_airport);
    const dest = getAirport(flight.destination_airport);

    const matchesSearch =
      flight.flight_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airline?.airline_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest?.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || flight.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (flightId: number, newStatus: FlightStatus) => {
    dbService.updateFlightStatus(flightId, newStatus);
    onDatabaseMutated();
  };

  const handleCreateFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlightNo.trim()) return;

    dbService.addFlight({
      flight_no: newFlightNo.trim().toUpperCase(),
      airline_id: Number(newAirlineId),
      source_airport: Number(newSourceId),
      destination_airport: Number(newDestId),
      departure_time: newDepTime,
      arrival_time: newArrTime,
      status: newStatus,
      gate: newGate.trim(),
      terminal: newTerminal.trim(),
      aircraft: newAircraft.trim()
    });

    onDatabaseMutated();
    setShowScheduleModal(false);
    setNewFlightNo('');
  };

  const getStatusColor = (status: FlightStatus) => {
    switch (status) {
      case 'Boarding':
        return 'text-amber-400 font-semibold';
      case 'In Flight':
      case 'Departed':
        return 'text-sky-400 font-semibold';
      case 'Landed':
        return 'text-emerald-400 font-semibold';
      case 'Delayed':
        return 'text-orange-400 font-semibold';
      case 'Cancelled':
        return 'text-rose-400 font-semibold';
      default:
        return 'text-slate-300';
    }
  };

  // Crew & passenger manifest for selected flight
  const flightAssignments = selectedFlightForDetails
    ? dbState.Assignment.filter(a => a.flight_id === selectedFlightForDetails.flight_id)
    : [];
  const flightBookings = selectedFlightForDetails
    ? dbState.Booking.filter(b => b.flight_id === selectedFlightForDetails.flight_id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-400" />
            Flight Operations & FIDS Display
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{dbState.Flight.length} Active Rotations</span>
            <span aria-hidden="true">·</span>
            <span>Live Gate & Departure Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Relational Source & Destination Links</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Flight
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by flight number, airline, origin or destination..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="md:col-span-6 flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {['All', 'Boarding', 'Scheduled', 'In Flight', 'Delayed', 'Landed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Flights Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Flight No</th>
                <th className="px-4 py-3 font-medium">Airline</th>
                <th className="px-4 py-3 font-medium">Route (Origin → Destination)</th>
                <th className="px-4 py-3 font-medium">Departure</th>
                <th className="px-4 py-3 font-medium">Arrival</th>
                <th className="px-4 py-3 font-medium">Gate / Term</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFlights.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No flights matching criteria.
                  </td>
                </tr>
              ) : (
                filteredFlights.map(flight => {
                  const airline = getAirline(flight.airline_id);
                  const source = getAirport(flight.source_airport);
                  const dest = getAirport(flight.destination_airport);

                  return (
                    <tr key={flight.flight_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-sky-300">
                        {flight.flight_no}
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        <div>{airline?.airline_name}</div>
                        <div className="text-[10px] text-slate-500">{airline?.country}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <span className="font-bold text-amber-300">{source?.iata_code}</span>
                          <span className="text-slate-500">→</span>
                          <span className="font-bold text-emerald-300">{dest?.iata_code}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {source?.city} to {dest?.city}
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-300">
                        <div>{flight.departure_time.replace('T', ' ').slice(11, 16)}</div>
                        <div className="text-[10px] text-slate-500">{flight.departure_time.slice(0, 10)}</div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-300">
                        <div>{flight.arrival_time.replace('T', ' ').slice(11, 16)}</div>
                        <div className="text-[10px] text-slate-500">{flight.arrival_time.slice(0, 10)}</div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-300">
                        <span>{flight.gate || 'TBD'}</span>
                        <span className="text-slate-500 text-[10px] ml-1">({flight.terminal || 'T1'})</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={flight.status}
                          onChange={(e) => handleStatusChange(flight.flight_id, e.target.value as FlightStatus)}
                          className={`bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-500 ${getStatusColor(flight.status)}`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Boarding">Boarding</option>
                          <option value="Departed">Departed</option>
                          <option value="In Flight">In Flight</option>
                          <option value="Landed">Landed</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedFlightForDetails(flight)}
                          className="px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition-colors"
                        >
                          Manifest & Crew
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flight Manifest & Crew Modal */}
      {selectedFlightForDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Flight Rotation Details</span>
                <h3 className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                  {selectedFlightForDetails.flight_no} · {getAirline(selectedFlightForDetails.airline_id)?.airline_name}
                </h3>
                <p className="text-xs text-slate-400">
                  {getAirport(selectedFlightForDetails.source_airport)?.name} ({getAirport(selectedFlightForDetails.source_airport)?.iata_code}) → {getAirport(selectedFlightForDetails.destination_airport)?.name} ({getAirport(selectedFlightForDetails.destination_airport)?.iata_code})
                </p>
              </div>
              <button
                onClick={() => setSelectedFlightForDetails(null)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2"
              >
                ✕
              </button>
            </div>

            {/* Flight Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px]">Departure</div>
                <div className="text-slate-200 font-bold">{selectedFlightForDetails.departure_time.replace('T', ' ')}</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px]">Arrival</div>
                <div className="text-slate-200 font-bold">{selectedFlightForDetails.arrival_time.replace('T', ' ')}</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px]">Gate / Terminal</div>
                <div className="text-slate-200 font-bold">{selectedFlightForDetails.gate} / {selectedFlightForDetails.terminal}</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px]">Status</div>
                <div className={getStatusColor(selectedFlightForDetails.status)}>{selectedFlightForDetails.status}</div>
              </div>
            </div>

            {/* Assigned Crew Section */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Assigned Flight Crew ({flightAssignments.length} members)
              </h4>
              {flightAssignments.length === 0 ? (
                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-500">
                  No staff members currently assigned to this rotation.
                </div>
              ) : (
                <div className="space-y-1.5 text-xs font-mono">
                  {flightAssignments.map(asg => {
                    const staff = dbState.Staff.find(s => s.staff_id === asg.staff_id);
                    return (
                      <div key={asg.assign_id} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-200">{staff?.name}</span>
                          <span className="text-slate-500 text-[10px] ml-2">({staff?.role})</span>
                        </div>
                        <span className="text-sky-400 text-[11px]">{asg.assigned_role || 'Assigned'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Passenger Manifest Section */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Passenger Manifest ({flightBookings.length} booked)
              </h4>
              {flightBookings.length === 0 ? (
                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-500">
                  No bookings found for this flight.
                </div>
              ) : (
                <div className="space-y-1.5 text-xs font-mono max-h-40 overflow-y-auto">
                  {flightBookings.map(b => {
                    const passenger = dbState.Passenger.find(p => p.passenger_id === b.passenger_id);
                    return (
                      <div key={b.booking_id} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-200">{passenger?.name}</span>
                          <span className="text-slate-500 text-[10px] ml-2">Passport: {passenger?.passport}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-300">${b.ticket_price.toFixed(2)}</span>
                          <span className={`text-[10px] ${b.checkin_status === 'Yes' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            Checked In: {b.checkin_status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedFlightForDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Flight Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-sky-400" />
                  Schedule New Flight
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inserts a new tuple into the <code className="text-sky-300 font-mono">Flight</code> table with foreign key validations.
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFlight} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Flight Number (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EK202, SQ404"
                    value={newFlightNo}
                    onChange={(e) => setNewFlightNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Operating Airline (FK)</label>
                  <select
                    value={newAirlineId}
                    onChange={(e) => setNewAirlineId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {dbState.Airlines.map(a => (
                      <option key={a.airline_id} value={a.airline_id}>
                        {a.airline_name} ({a.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Origin Airport (Source FK)</label>
                  <select
                    value={newSourceId}
                    onChange={(e) => setNewSourceId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {dbState.Airport.map(ap => (
                      <option key={ap.airport_id} value={ap.airport_id}>
                        {ap.iata_code} - {ap.name} ({ap.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Destination Airport (Dest FK)</label>
                  <select
                    value={newDestId}
                    onChange={(e) => setNewDestId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {dbState.Airport.map(ap => (
                      <option key={ap.airport_id} value={ap.airport_id}>
                        {ap.iata_code} - {ap.name} ({ap.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Departure Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDepTime}
                    onChange={(e) => setNewDepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Arrival Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newArrTime}
                    onChange={(e) => setNewArrTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Gate</label>
                  <input
                    type="text"
                    value={newGate}
                    onChange={(e) => setNewGate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Terminal</label>
                  <input
                    type="text"
                    value={newTerminal}
                    onChange={(e) => setNewTerminal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as FlightStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Aircraft Model</label>
                <input
                  type="text"
                  value={newAircraft}
                  onChange={(e) => setNewAircraft(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg"
                >
                  Save & Insert Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
