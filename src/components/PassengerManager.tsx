import React, { useState } from 'react';
import { DatabaseState, Passenger } from '../types/schema';
import { dbService } from '../services/db';
import { UserCheck, UserPlus, Search, Phone, Mail, CreditCard, Shield, Plane, ArrowRight } from 'lucide-react';

interface PassengerManagerProps {
  dbState: DatabaseState;
  onDatabaseMutated: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const PassengerManager: React.FC<PassengerManagerProps> = ({
  dbState,
  onDatabaseMutated,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);

  // New passenger form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [passport, setPassport] = useState('');
  const [identityCard, setIdentityCard] = useState('');
  const [nationality, setNationality] = useState('United States');

  const filteredPassengers = dbState.Passenger.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.passport.toLowerCase().includes(q) ||
      p.identity_card.toLowerCase().includes(q) ||
      p.phone_no.toLowerCase().includes(q)
    );
  });

  const handleCreatePassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    dbService.addPassenger({
      name: name.trim(),
      email: email.trim(),
      phone_no: phoneNo.trim(),
      passport: passport.trim().toUpperCase(),
      identity_card: identityCard.trim().toUpperCase(),
      nationality: nationality.trim()
    });

    onDatabaseMutated();
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhoneNo('');
    setPassport('');
    setIdentityCard('');
  };

  const getPassengerBookings = (passengerId: number) => {
    return dbState.Booking.filter(b => b.passenger_id === passengerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-400" />
            Passenger Registry & Travel Manifest
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{dbState.Passenger.length} Registered Travelers</span>
            <span aria-hidden="true">·</span>
            <span>Passport & Identity Verification</span>
            <span aria-hidden="true">·</span>
            <span>Relational Passenger Entity</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Register New Passenger
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by passenger name, email, passport number, identity card, or phone..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
        />
      </div>

      {/* Passengers Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Passenger ID</th>
                <th className="px-4 py-3 font-medium">Full Name</th>
                <th className="px-4 py-3 font-medium">Passport No</th>
                <th className="px-4 py-3 font-medium">National ID</th>
                <th className="px-4 py-3 font-medium">Contact Details</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPassengers.map(p => {
                const bookings = getPassengerBookings(p.passenger_id);
                const hasCheckedIn = bookings.some(b => b.checkin_status === 'Yes');

                return (
                  <tr key={p.passenger_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-bold tabular-nums">
                      #{p.passenger_id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-100">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{p.nationality || 'International'}</div>
                    </td>
                    <td className="px-4 py-3 text-amber-300 font-bold">
                      {p.passport}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {p.identity_card}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      <div className="text-slate-200">{p.email}</div>
                      <div className="text-[10px] text-slate-500">{p.phone_no}</div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className="text-sky-300 font-bold">{bookings.length} flights</span>
                      {hasCheckedIn && (
                        <span className="ml-1.5 text-[10px] text-emerald-400 font-medium">Checked-in</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPassenger(p)}
                        className="px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition-colors"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Passenger Details Modal */}
      {selectedPassenger && (() => {
        const bookings = getPassengerBookings(selectedPassenger.passenger_id);
        const totalSpent = bookings.reduce((sum, b) => sum + (b.ticket_price || 0), 0);

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Passenger Dossier</span>
                  <h3 className="text-lg font-bold text-slate-100 font-mono mt-0.5">{selectedPassenger.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Passport: {selectedPassenger.passport} · ID: {selectedPassenger.identity_card}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPassenger(null)}
                  className="text-slate-400 hover:text-slate-200 text-lg px-2"
                >
                  ✕
                </button>
              </div>

              {/* Passenger Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500">Email Address</div>
                  <div className="text-slate-200">{selectedPassenger.email}</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500">Phone Number</div>
                  <div className="text-slate-200">{selectedPassenger.phone_no}</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500">Total Flights Booked</div>
                  <div className="text-sky-300 font-bold">{bookings.length} Flights</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500">Cumulative Fare Value</div>
                  <div className="text-emerald-400 font-bold">${totalSpent.toFixed(2)}</div>
                </div>
              </div>

              {/* Booked flights list */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Booked Flights & Check-in Status</h4>
                {bookings.length === 0 ? (
                  <div className="p-4 bg-slate-950 rounded border border-slate-800 text-xs text-slate-500">
                    No active flight bookings for this passenger.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto">
                    {bookings.map(b => {
                      const flight = dbState.Flight.find(f => f.flight_id === b.flight_id);
                      const src = flight ? dbState.Airport.find(a => a.airport_id === flight.source_airport) : undefined;
                      const dst = flight ? dbState.Airport.find(a => a.airport_id === flight.destination_airport) : undefined;

                      return (
                        <div key={b.booking_id} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sky-300">{flight?.flight_no}</span>
                            <span className="text-slate-400 ml-2">({src?.iata_code} → {dst?.iata_code})</span>
                            <div className="text-[10px] text-slate-500">Seat {b.seat_number} · Booked {b.booking_date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold">${b.ticket_price.toFixed(2)}</div>
                            <div className={`text-[10px] ${b.checkin_status === 'Yes' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              Checkin: {b.checkin_status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSelectedPassenger(null);
                    onNavigateToTab('bookings');
                  }}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
                >
                  <Plane className="w-3.5 h-3.5" /> Book Flight for Passenger
                </button>
                <button
                  onClick={() => setSelectedPassenger(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Passenger Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-sky-400" />
                  Register New Passenger
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inserts a tuple into the <code className="text-sky-300 font-mono">Passenger</code> relational table.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePassenger} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Hamilton"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. a.hamilton@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+1-555-019-2831"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Passport Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. US8910283"
                    value={passport}
                    onChange={(e) => setPassport(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">National ID Card</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ID-US-99120"
                    value={identityCard}
                    onChange={(e) => setIdentityCard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nationality</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg"
                >
                  Register Passenger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
