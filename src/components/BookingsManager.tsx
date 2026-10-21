import React, { useState } from 'react';
import { DatabaseState, Booking, CheckinStatus, SeatClass } from '../types/schema';
import { dbService } from '../services/db';
import { Ticket, Plus, Search, CheckCircle2, XCircle, QrCode, DollarSign, UserCheck, Printer } from 'lucide-react';

interface BookingsManagerProps {
  dbState: DatabaseState;
  onDatabaseMutated: () => void;
  openNewBookingModalDefault?: boolean;
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({
  dbState,
  onDatabaseMutated,
  openNewBookingModalDefault = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkinFilter, setCheckinFilter] = useState<'All' | 'Yes' | 'No'>('All');
  const [showNewBookingModal, setShowNewBookingModal] = useState(openNewBookingModalDefault);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<Booking | null>(null);

  // New Booking form state
  const [selectedFlightId, setSelectedFlightId] = useState<number>(dbState.Flight[0]?.flight_id || 1);
  const [selectedPassengerId, setSelectedPassengerId] = useState<number>(dbState.Passenger[0]?.passenger_id || 1);
  const [ticketPrice, setTicketPrice] = useState<number>(850.00);
  const [bookingDate, setBookingDate] = useState<string>('2026-10-18');
  const [seatNumber, setSeatNumber] = useState<string>('18A');
  const [seatClass, setSeatClass] = useState<SeatClass>('Economy');

  const getFlight = (flightId: number) => dbState.Flight.find(f => f.flight_id === flightId);
  const getPassenger = (passengerId: number) => dbState.Passenger.find(p => p.passenger_id === passengerId);
  const getAirport = (airportId: number) => dbState.Airport.find(a => a.airport_id === airportId);
  const getAirline = (airlineId: number) => dbState.Airlines.find(a => a.airline_id === airlineId);

  const handleToggleCheckin = (bookingId: number) => {
    dbService.toggleCheckin(bookingId);
    onDatabaseMutated();
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.addBooking({
      flight_id: Number(selectedFlightId),
      passenger_id: Number(selectedPassengerId),
      booking_date: bookingDate,
      ticket_price: Number(ticketPrice),
      checkin_status: 'No',
      seat_number: seatNumber.trim().toUpperCase(),
      seat_class: seatClass
    });

    onDatabaseMutated();
    setShowNewBookingModal(false);
  };

  const filteredBookings = dbState.Booking.filter(b => {
    const flight = getFlight(b.flight_id);
    const passenger = getPassenger(b.passenger_id);

    const matchesSearch =
      passenger?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      passenger?.passport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight?.flight_no.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = checkinFilter === 'All' || b.checkin_status === checkinFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = dbState.Booking.reduce((acc, b) => acc + (b.ticket_price || 0), 0);
  const checkedInCount = dbState.Booking.filter(b => b.checkin_status === 'Yes').length;
  const pendingCheckinCount = dbState.Booking.length - checkedInCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-sky-400" />
            Passenger Bookings & Check-in Desk
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{dbState.Booking.length} Bookings Recorded</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-emerald-400">{checkedInCount} Checked In</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-amber-400">{pendingCheckinCount} Pending</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewBookingModal(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Booking Revenue</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Sum of ticket_price across all confirmed bookings</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Check-in Completion Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {dbState.Booking.length > 0 ? Math.round((checkedInCount / dbState.Booking.length) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{checkedInCount} of {dbState.Booking.length} passengers checked in</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Average Ticket Value</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            ${dbState.Booking.length > 0 ? (totalRevenue / dbState.Booking.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Blended across Economy, Business & First Class</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by passenger name, passport number, or flight number..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {(['All', 'Yes', 'No'] as const).map(status => (
            <button
              key={status}
              onClick={() => setCheckinFilter(status)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                checkinFilter === status
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'All' ? 'All Check-ins' : status === 'Yes' ? 'Checked In' : 'Pending Check-in'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Booking ID</th>
                <th className="px-4 py-3 font-medium">Passenger (FK)</th>
                <th className="px-4 py-3 font-medium">Flight (FK)</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Seat / Class</th>
                <th className="px-4 py-3 font-medium">Booking Date</th>
                <th className="px-4 py-3 font-medium">Ticket Price</th>
                <th className="px-4 py-3 font-medium">Check-in Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => {
                  const passenger = getPassenger(b.passenger_id);
                  const flight = getFlight(b.flight_id);
                  const source = flight ? getAirport(flight.source_airport) : undefined;
                  const dest = flight ? getAirport(flight.destination_airport) : undefined;
                  const isCheckedIn = b.checkin_status === 'Yes';

                  return (
                    <tr key={b.booking_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-400 tabular-nums font-bold">
                        #{b.booking_id}
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        <div className="font-semibold text-slate-100">{passenger?.name}</div>
                        <div className="text-[10px] text-slate-500">{passenger?.passport} · {passenger?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sky-300 font-bold">
                        {flight?.flight_no}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="text-amber-300">{source?.iata_code}</span>
                        <span className="text-slate-500 mx-1">→</span>
                        <span className="text-emerald-300">{dest?.iata_code}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="font-bold text-slate-100">{b.seat_number || 'TBD'}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">({b.seat_class || 'Economy'})</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 tabular-nums">
                        {b.booking_date}
                      </td>
                      <td className="px-4 py-3 text-slate-100 font-bold tabular-nums">
                        ${b.ticket_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleCheckin(b.booking_id)}
                          className={`px-2.5 py-1 text-xs rounded transition-all flex items-center gap-1.5 ${
                            isCheckedIn
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {isCheckedIn ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {isCheckedIn ? 'Checked In' : 'Pending Check-in'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedBookingForPass(b)}
                          className="px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition-colors flex items-center gap-1 ml-auto"
                        >
                          <QrCode className="w-3 h-3" />
                          Boarding Pass
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

      {/* Boarding Pass Modal */}
      {selectedBookingForPass && (() => {
        const passPassenger = getPassenger(selectedBookingForPass.passenger_id);
        const passFlight = getFlight(selectedBookingForPass.flight_id);
        const passSource = passFlight ? getAirport(passFlight.source_airport) : undefined;
        const passDest = passFlight ? getAirport(passFlight.destination_airport) : undefined;
        const passAirline = passFlight ? getAirline(passFlight.airline_id) : undefined;

        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Official Electronic Boarding Pass
                </span>
                <button
                  onClick={() => setSelectedBookingForPass(null)}
                  className="text-slate-400 hover:text-slate-200 text-lg px-2"
                >
                  ✕
                </button>
              </div>

              {/* Physical-style Pass Card */}
              <div className="bg-slate-950 border border-sky-500/30 rounded-xl overflow-hidden shadow-2xl relative font-mono">
                {/* Header ribbon */}
                <div className="bg-sky-600 px-5 py-3 text-white flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-sky-100">{passAirline?.airline_name}</div>
                    <div className="text-lg font-bold">{passFlight?.flight_no} · {selectedBookingForPass.seat_class || 'Economy'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-sky-100">BOOKING REF</div>
                    <div className="text-sm font-bold">#SKY-{selectedBookingForPass.booking_id.toString().padStart(6, '0')}</div>
                  </div>
                </div>

                {/* Main Pass Info */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs text-slate-500">PASSENGER NAME</div>
                      <div className="text-base font-bold text-slate-100">{passPassenger?.name}</div>
                      <div className="text-[11px] text-slate-400">PASSPORT: {passPassenger?.passport}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">CHECK-IN STATUS</div>
                      <div className={`text-sm font-bold ${selectedBookingForPass.checkin_status === 'Yes' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {selectedBookingForPass.checkin_status === 'Yes' ? 'CONFIRMED' : 'NOT CHECKED IN'}
                      </div>
                    </div>
                  </div>

                  {/* Flight route & airports */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                    <div>
                      <div className="text-2xl font-black text-amber-300">{passSource?.iata_code}</div>
                      <div className="text-[10px] text-slate-400 truncate">{passSource?.city}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <span className="text-xs text-sky-400 font-semibold">{passFlight?.aircraft || 'Direct'}</span>
                      <span className="text-lg">✈</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-300">{passDest?.iata_code}</div>
                      <div className="text-[10px] text-slate-400 truncate">{passDest?.city}</div>
                    </div>
                  </div>

                  {/* Gate / Seat / Time Grid */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">GATE</div>
                      <div className="text-sm font-bold text-slate-200">{passFlight?.gate || 'TBD'}</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">SEAT</div>
                      <div className="text-sm font-bold text-sky-300">{selectedBookingForPass.seat_number || '12B'}</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">BOARDING</div>
                      <div className="text-sm font-bold text-slate-200">{passFlight?.departure_time.slice(11, 16)}</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">FARE</div>
                      <div className="text-sm font-bold text-emerald-400">${selectedBookingForPass.ticket_price.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Simulated barcode */}
                  <div className="pt-2 border-t border-dashed border-slate-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-8 flex items-center gap-0.5">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-slate-300 h-full"
                            style={{
                              width: (i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2) + 'px',
                              opacity: (i % 7 === 0 ? 0.3 : 1)
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="text-[9px] text-slate-500 tracking-widest">
                        {passFlight?.flight_no}-{passPassenger?.passport}-SKYAMS
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <QrCode className="w-8 h-8 text-slate-950" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleToggleCheckin(selectedBookingForPass.booking_id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    selectedBookingForPass.checkin_status === 'Yes'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  {selectedBookingForPass.checkin_status === 'Yes' ? 'Revoke Check-in' : 'Confirm Check-in Now'}
                </button>
                <button
                  onClick={() => setSelectedBookingForPass(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
                >
                  Close Pass
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-sky-400" />
                  Create Flight Booking
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Creates a tuple in the <code className="text-sky-300 font-mono">Booking</code> relational table.
                </p>
              </div>
              <button
                onClick={() => setShowNewBookingModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Passenger (FK)</label>
                <select
                  value={selectedPassengerId}
                  onChange={(e) => setSelectedPassengerId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {dbState.Passenger.map(p => (
                    <option key={p.passenger_id} value={p.passenger_id}>
                      {p.name} (Passport: {p.passport} · {p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Flight (FK)</label>
                <select
                  value={selectedFlightId}
                  onChange={(e) => {
                    const fId = Number(e.target.value);
                    setSelectedFlightId(fId);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                >
                  {dbState.Flight.map(f => {
                    const src = getAirport(f.source_airport);
                    const dst = getAirport(f.destination_airport);
                    return (
                      <option key={f.flight_id} value={f.flight_id}>
                        {f.flight_no} ({src?.iata_code} → {dst?.iata_code}) Dep: {f.departure_time.slice(0, 16)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Seat Class</label>
                  <select
                    value={seatClass}
                    onChange={(e) => {
                      const sc = e.target.value as SeatClass;
                      setSeatClass(sc);
                      if (sc === 'Economy') setTicketPrice(650.00);
                      else if (sc === 'Business') setTicketPrice(1450.00);
                      else setTicketPrice(2800.00);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First Class</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Seat Number</label>
                  <input
                    type="text"
                    required
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono uppercase focus:outline-none focus:border-sky-500"
                    placeholder="e.g. 14A, 3F"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Booking Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ticket Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg"
                >
                  Confirm & Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
