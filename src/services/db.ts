import alasql from 'alasql';
import { Airline, Airport, Flight, Passenger, Booking, Staff, Assignment, DatabaseState, CheckinStatus } from '../types/schema';

// Initial Seed Data
export const INITIAL_AIRLINES: Airline[] = [
  { airline_id: 1, airline_name: 'Emirates', country: 'United Arab Emirates', iata_code: 'EK', callsign: 'EMIRATES' },
  { airline_id: 2, airline_name: 'Singapore Airlines', country: 'Singapore', iata_code: 'SQ', callsign: 'SINGAPORE' },
  { airline_id: 3, airline_name: 'British Airways', country: 'United Kingdom', iata_code: 'BA', callsign: 'SPEEDBIRD' },
  { airline_id: 4, airline_name: 'Delta Air Lines', country: 'United States', iata_code: 'DL', callsign: 'DELTA' },
  { airline_id: 5, airline_name: 'Qatar Airways', country: 'Qatar', iata_code: 'QR', callsign: 'QATARI' },
  { airline_id: 6, airline_name: 'Lufthansa', country: 'Germany', iata_code: 'LH', callsign: 'LUFTHANSA' },
];

export const INITIAL_AIRPORTS: Airport[] = [
  { airport_id: 1, name: 'John F. Kennedy International', city: 'New York', country: 'United States', iata_code: 'JFK', timezone: 'UTC-5', lat: 40.6413, lng: -73.7781 },
  { airport_id: 2, name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', iata_code: 'LHR', timezone: 'UTC+0', lat: 51.4700, lng: -0.4543 },
  { airport_id: 3, name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', iata_code: 'DXB', timezone: 'UTC+4', lat: 25.2532, lng: 55.3657 },
  { airport_id: 4, name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', iata_code: 'SIN', timezone: 'UTC+8', lat: 1.3644, lng: 103.9915 },
  { airport_id: 5, name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', iata_code: 'HND', timezone: 'UTC+9', lat: 35.5494, lng: 139.7798 },
  { airport_id: 6, name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', iata_code: 'CDG', timezone: 'UTC+1', lat: 49.0097, lng: 2.5479 },
  { airport_id: 7, name: 'Frankfurt am Main Airport', city: 'Frankfurt', country: 'Germany', iata_code: 'FRA', timezone: 'UTC+1', lat: 50.0379, lng: 8.5622 },
  { airport_id: 8, name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', iata_code: 'SYD', timezone: 'UTC+11', lat: -33.9399, lng: 151.1753 },
];

export const INITIAL_FLIGHTS: Flight[] = [
  {
    flight_id: 1,
    flight_no: 'EK201',
    airline_id: 1,
    source_airport: 3, // DXB
    destination_airport: 1, // JFK
    departure_time: '2026-10-18T08:30:00',
    arrival_time: '2026-10-18T14:15:00',
    status: 'In Flight',
    gate: 'A12',
    terminal: 'T3',
    aircraft: 'Airbus A380-800'
  },
  {
    flight_id: 2,
    flight_no: 'SQ321',
    airline_id: 2,
    source_airport: 4, // SIN
    destination_airport: 2, // LHR
    departure_time: '2026-10-18T09:15:00',
    arrival_time: '2026-10-18T15:40:00',
    status: 'Boarding',
    gate: 'B04',
    terminal: 'T2',
    aircraft: 'Boeing 777-300ER'
  },
  {
    flight_id: 3,
    flight_no: 'BA117',
    airline_id: 3,
    source_airport: 2, // LHR
    destination_airport: 1, // JFK
    departure_time: '2026-10-18T11:45:00',
    arrival_time: '2026-10-18T14:30:00',
    status: 'Scheduled',
    gate: 'C21',
    terminal: 'T5',
    aircraft: 'Boeing 787-9 Dreamliner'
  },
  {
    flight_id: 4,
    flight_no: 'DL404',
    airline_id: 4,
    source_airport: 1, // JFK
    destination_airport: 6, // CDG
    departure_time: '2026-10-18T18:00:00',
    arrival_time: '2026-10-19T07:20:00',
    status: 'Scheduled',
    gate: 'B18',
    terminal: 'T4',
    aircraft: 'Airbus A350-900'
  },
  {
    flight_id: 5,
    flight_no: 'QR908',
    airline_id: 5,
    source_airport: 3, // DXB
    destination_airport: 8, // SYD
    departure_time: '2026-10-18T06:10:00',
    arrival_time: '2026-10-18T22:30:00',
    status: 'In Flight',
    gate: 'A08',
    terminal: 'T1',
    aircraft: 'Airbus A350-1000'
  },
  {
    flight_id: 6,
    flight_no: 'LH400',
    airline_id: 6,
    source_airport: 7, // FRA
    destination_airport: 1, // JFK
    departure_time: '2026-10-18T10:50:00',
    arrival_time: '2026-10-18T13:40:00',
    status: 'Departed',
    gate: 'Z14',
    terminal: 'T1',
    aircraft: 'Boeing 747-8 Intercontinental'
  },
  {
    flight_id: 7,
    flight_no: 'SQ026',
    airline_id: 2,
    source_airport: 4, // SIN
    destination_airport: 7, // FRA
    departure_time: '2026-10-18T23:55:00',
    arrival_time: '2026-10-19T06:30:00',
    status: 'Scheduled',
    gate: 'B07',
    terminal: 'T3',
    aircraft: 'Airbus A380-800'
  },
  {
    flight_id: 8,
    flight_no: 'EK007',
    airline_id: 1,
    source_airport: 3, // DXB
    destination_airport: 2, // LHR
    departure_time: '2026-10-18T02:40:00',
    arrival_time: '2026-10-18T07:10:00',
    status: 'Landed',
    gate: 'A03',
    terminal: 'T3',
    aircraft: 'Airbus A380-800'
  },
  {
    flight_id: 9,
    flight_no: 'BA009',
    airline_id: 3,
    source_airport: 2, // LHR
    destination_airport: 5, // HND
    departure_time: '2026-10-18T13:30:00',
    arrival_time: '2026-10-19T09:05:00',
    status: 'Delayed',
    gate: 'C11',
    terminal: 'T5',
    aircraft: 'Boeing 787-9'
  },
  {
    flight_id: 10,
    flight_no: 'DL106',
    airline_id: 4,
    source_airport: 1, // JFK
    destination_airport: 7, // FRA
    departure_time: '2026-10-18T17:15:00',
    arrival_time: '2026-10-19T06:55:00',
    status: 'Scheduled',
    gate: 'B22',
    terminal: 'T4',
    aircraft: 'Boeing 767-400ER'
  }
];

export const INITIAL_PASSENGERS: Passenger[] = [
  { passenger_id: 1, name: 'Elena Rostova', email: 'elena.rostova@globalmail.com', phone_no: '+1-212-555-0192', passport: 'P7829104A', identity_card: 'ID-US-99120', nationality: 'United States' },
  { passenger_id: 2, name: 'Marcus Sterling', email: 'm.sterling@capitalholdings.co.uk', phone_no: '+44-20-7946-0912', passport: 'GB8823190', identity_card: 'ID-UK-44182', nationality: 'United Kingdom' },
  { passenger_id: 3, name: 'Amina Al-Mansoor', email: 'amina.mansoor@gulftech.ae', phone_no: '+971-50-881-2394', passport: 'AE9102831', identity_card: 'ID-UAE-7721', nationality: 'United Arab Emirates' },
  { passenger_id: 4, name: 'Kenji Takahashi', email: 'k.takahashi@tokyolab.jp', phone_no: '+81-90-5551-8290', passport: 'JP6612903', identity_card: 'ID-JPN-8201', nationality: 'Japan' },
  { passenger_id: 5, name: 'Chloe Dubois', email: 'chloe.dubois@atelier-paris.fr', phone_no: '+33-6-1234-5678', passport: 'FR4491023', identity_card: 'ID-FRA-5519', nationality: 'France' },
  { passenger_id: 6, name: 'Lukas Weber', email: 'lukas.weber@berlineng.de', phone_no: '+49-171-8899001', passport: 'DE3301928', identity_card: 'ID-GER-3391', nationality: 'Germany' },
  { passenger_id: 7, name: 'Sophie Zhang', email: 'sophie.zhang@singfin.sg', phone_no: '+65-9123-4567', passport: 'SG9918230', identity_card: 'ID-SGP-1092', nationality: 'Singapore' },
  { passenger_id: 8, name: 'Liam O’Connor', email: 'liam.oconnor@sydneymedia.au', phone_no: '+61-4-8812-3991', passport: 'AU5501923', identity_card: 'ID-AUS-6610', nationality: 'Australia' },
  { passenger_id: 9, name: 'David Vance', email: 'dvance@aeroventure.com', phone_no: '+1-415-882-9912', passport: 'P1029384B', identity_card: 'ID-US-88231', nationality: 'United States' },
  { passenger_id: 10, name: 'Fatima Zahra', email: 'fatima.zahra@dubaicapital.ae', phone_no: '+971-55-901-4455', passport: 'AE4401928', identity_card: 'ID-UAE-8819', nationality: 'United Arab Emirates' },
  { passenger_id: 11, name: 'Oliver Bennett', email: 'oliver.b@heathrowlogistics.co.uk', phone_no: '+44-77-0090-0112', passport: 'GB1928374', identity_card: 'ID-UK-39182', nationality: 'United Kingdom' },
  { passenger_id: 12, name: 'Hannah Schmidt', email: 'hannah.s@munichmobility.de', phone_no: '+49-160-5522334', passport: 'DE7719283', identity_card: 'ID-GER-9918', nationality: 'Germany' }
];

export const INITIAL_BOOKINGS: Booking[] = [
  { booking_id: 1, flight_id: 1, passenger_id: 1, booking_date: '2026-10-10', ticket_price: 1150.00, checkin_status: 'Yes', seat_number: '14A', seat_class: 'Business' },
  { booking_id: 2, flight_id: 1, passenger_id: 3, booking_date: '2026-10-12', ticket_price: 2450.00, checkin_status: 'Yes', seat_number: '2E', seat_class: 'First' },
  { booking_id: 3, flight_id: 2, passenger_id: 2, booking_date: '2026-10-08', ticket_price: 1320.00, checkin_status: 'Yes', seat_number: '11K', seat_class: 'Business' },
  { booking_id: 4, flight_id: 2, passenger_id: 7, booking_date: '2026-10-14', ticket_price: 680.00, checkin_status: 'No', seat_number: '32F', seat_class: 'Economy' },
  { booking_id: 5, flight_id: 3, passenger_id: 2, booking_date: '2026-10-15', ticket_price: 790.00, checkin_status: 'No', seat_number: '28B', seat_class: 'Economy' },
  { booking_id: 6, flight_id: 3, passenger_id: 11, booking_date: '2026-10-09', ticket_price: 1480.00, checkin_status: 'No', seat_number: '8D', seat_class: 'Business' },
  { booking_id: 7, flight_id: 4, passenger_id: 9, booking_date: '2026-10-11', ticket_price: 890.00, checkin_status: 'No', seat_number: '19A', seat_class: 'Economy' },
  { booking_id: 8, flight_id: 4, passenger_id: 5, booking_date: '2026-10-13', ticket_price: 1950.00, checkin_status: 'No', seat_number: '4A', seat_class: 'Business' },
  { booking_id: 9, flight_id: 5, passenger_id: 8, booking_date: '2026-10-05', ticket_price: 1750.00, checkin_status: 'Yes', seat_number: '16C', seat_class: 'Business' },
  { booking_id: 10, flight_id: 5, passenger_id: 10, booking_date: '2026-10-07', ticket_price: 2800.00, checkin_status: 'Yes', seat_number: '1A', seat_class: 'First' },
  { booking_id: 11, flight_id: 6, passenger_id: 6, booking_date: '2026-10-08', ticket_price: 920.00, checkin_status: 'Yes', seat_number: '24K', seat_class: 'Economy' },
  { booking_id: 12, flight_id: 6, passenger_id: 12, booking_date: '2026-10-14', ticket_price: 1600.00, checkin_status: 'Yes', seat_number: '7F', seat_class: 'Business' },
  { booking_id: 13, flight_id: 7, passenger_id: 4, booking_date: '2026-10-16', ticket_price: 840.00, checkin_status: 'No', seat_number: '31A', seat_class: 'Economy' },
  { booking_id: 14, flight_id: 8, passenger_id: 3, booking_date: '2026-10-01', ticket_price: 1200.00, checkin_status: 'Yes', seat_number: '12B', seat_class: 'Business' },
  { booking_id: 15, flight_id: 9, passenger_id: 4, booking_date: '2026-10-14', ticket_price: 1100.00, checkin_status: 'No', seat_number: '15E', seat_class: 'Economy' },
];

export const INITIAL_STAFF: Staff[] = [
  { staff_id: 1, name: 'Captain Tariq Mansoor', role: 'Captain', airline_id: 1, license_number: 'ATPL-UAE-8812', experience_years: 18 },
  { staff_id: 2, name: 'F/O Sarah Jenkins', role: 'First Officer', airline_id: 1, license_number: 'CPL-UK-9923', experience_years: 7 },
  { staff_id: 3, name: 'Layla Al-Hashimi', role: 'Lead Flight Attendant', airline_id: 1, license_number: 'CC-UAE-4011', experience_years: 11 },
  { staff_id: 4, name: 'Captain Wei Chen', role: 'Captain', airline_id: 2, license_number: 'ATPL-SG-5501', experience_years: 22 },
  { staff_id: 5, name: 'F/O Ryan Tan', role: 'First Officer', airline_id: 2, license_number: 'CPL-SG-7729', experience_years: 6 },
  { staff_id: 6, name: 'Nurul Huda', role: 'Cabin Crew', airline_id: 2, license_number: 'CC-SG-1092', experience_years: 5 },
  { staff_id: 7, name: 'Captain Edward Thornton', role: 'Captain', airline_id: 3, license_number: 'ATPL-UK-1099', experience_years: 25 },
  { staff_id: 8, name: 'F/O Amelia Clark', role: 'First Officer', airline_id: 3, license_number: 'CPL-UK-8841', experience_years: 8 },
  { staff_id: 9, name: 'George Davies', role: 'Lead Flight Attendant', airline_id: 3, license_number: 'CC-UK-3920', experience_years: 14 },
  { staff_id: 10, name: 'Captain Robert Hayes', role: 'Captain', airline_id: 4, license_number: 'ATPL-FAA-9182', experience_years: 20 },
  { staff_id: 11, name: 'F/O Jessica Miller', role: 'First Officer', airline_id: 4, license_number: 'CPL-FAA-5510', experience_years: 9 },
  { staff_id: 12, name: 'Captain Hans Richter', role: 'Captain', airline_id: 6, license_number: 'ATPL-DE-4410', experience_years: 24 },
  { staff_id: 13, name: 'F/O Greta Vogel', role: 'First Officer', airline_id: 6, license_number: 'CPL-DE-9912', experience_years: 7 },
  { staff_id: 14, name: 'Maximilian Bauer', role: 'Aircraft Engineer', airline_id: 6, license_number: 'AME-EASA-2019', experience_years: 15 },
  { staff_id: 15, name: 'Captain Khalid Al-Kuwari', role: 'Captain', airline_id: 5, license_number: 'ATPL-QAT-3391', experience_years: 19 },
  { staff_id: 16, name: 'Farah Qureshi', role: 'Lead Flight Attendant', airline_id: 5, license_number: 'CC-QAT-8812', experience_years: 10 }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { assign_id: 1, flight_id: 1, staff_id: 1, assigned_role: 'Commander' },
  { assign_id: 2, flight_id: 1, staff_id: 2, assigned_role: 'Co-Pilot' },
  { assign_id: 3, flight_id: 1, staff_id: 3, assigned_role: 'Purser' },
  { assign_id: 4, flight_id: 2, staff_id: 4, assigned_role: 'Commander' },
  { assign_id: 5, flight_id: 2, staff_id: 5, assigned_role: 'Co-Pilot' },
  { assign_id: 6, flight_id: 2, staff_id: 6, assigned_role: 'Senior Cabin Crew' },
  { assign_id: 7, flight_id: 3, staff_id: 7, assigned_role: 'Commander' },
  { assign_id: 8, flight_id: 3, staff_id: 8, assigned_role: 'Co-Pilot' },
  { assign_id: 9, flight_id: 3, staff_id: 9, assigned_role: 'Cabin Lead' },
  { assign_id: 10, flight_id: 4, staff_id: 10, assigned_role: 'Commander' },
  { assign_id: 11, flight_id: 4, staff_id: 11, assigned_role: 'Co-Pilot' },
  { assign_id: 12, flight_id: 5, staff_id: 15, assigned_role: 'Commander' },
  { assign_id: 13, flight_id: 5, staff_id: 16, assigned_role: 'Purser' },
  { assign_id: 14, flight_id: 6, staff_id: 12, assigned_role: 'Commander' },
  { assign_id: 15, flight_id: 6, staff_id: 13, assigned_role: 'Co-Pilot' },
  { assign_id: 16, flight_id: 6, staff_id: 14, assigned_role: 'Flight Line Engineer' }
];

const STORAGE_KEY = 'skyport_ams_db_state_v1';

export class AirportDatabaseService {
  private state: DatabaseState;
  private isInitialized = false;

  constructor() {
    this.state = this.loadFromStorage();
    this.syncToAlaSQL();
  }

  private loadFromStorage(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.Airlines && parsed.Flight && parsed.Booking) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved state, using initial seed', e);
    }

    return {
      Airlines: [...INITIAL_AIRLINES],
      Airport: [...INITIAL_AIRPORTS],
      Flight: [...INITIAL_FLIGHTS],
      Passenger: [...INITIAL_PASSENGERS],
      Booking: [...INITIAL_BOOKINGS],
      Staff: [...INITIAL_STAFF],
      Assignment: [...INITIAL_ASSIGNMENTS]
    };
  }

  private persistState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist database state', e);
    }
  }

  public syncToAlaSQL(): void {
    try {
      // Recreate tables in alasql
      alasql('DROP TABLE IF EXISTS Assignment');
      alasql('DROP TABLE IF EXISTS Staff');
      alasql('DROP TABLE IF EXISTS Booking');
      alasql('DROP TABLE IF EXISTS Passenger');
      alasql('DROP TABLE IF EXISTS Flight');
      alasql('DROP TABLE IF EXISTS Airport');
      alasql('DROP TABLE IF EXISTS Airlines');

      alasql('CREATE TABLE Airlines (airline_id INT, airline_name STRING, country STRING, iata_code STRING, callsign STRING)');
      alasql('CREATE TABLE Airport (airport_id INT, name STRING, city STRING, country STRING, iata_code STRING, timezone STRING, lat FLOAT, lng FLOAT)');
      alasql('CREATE TABLE Flight (flight_id INT, flight_no STRING, airline_id INT, source_airport INT, destination_airport INT, departure_time STRING, arrival_time STRING, status STRING, gate STRING, terminal STRING, aircraft STRING)');
      alasql('CREATE TABLE Passenger (passenger_id INT, name STRING, email STRING, phone_no STRING, passport STRING, identity_card STRING, nationality STRING)');
      alasql('CREATE TABLE Booking (booking_id INT, flight_id INT, passenger_id INT, booking_date STRING, ticket_price FLOAT, checkin_status STRING, seat_number STRING, seat_class STRING)');
      alasql('CREATE TABLE Staff (staff_id INT, name STRING, role STRING, airline_id INT, license_number STRING, experience_years INT)');
      alasql('CREATE TABLE Assignment (assign_id INT, flight_id INT, staff_id INT, assigned_role STRING)');

      // Populate tables
      alasql.tables.Airlines.data = JSON.parse(JSON.stringify(this.state.Airlines));
      alasql.tables.Airport.data = JSON.parse(JSON.stringify(this.state.Airport));
      alasql.tables.Flight.data = JSON.parse(JSON.stringify(this.state.Flight));
      alasql.tables.Passenger.data = JSON.parse(JSON.stringify(this.state.Passenger));
      alasql.tables.Booking.data = JSON.parse(JSON.stringify(this.state.Booking));
      alasql.tables.Staff.data = JSON.parse(JSON.stringify(this.state.Staff));
      alasql.tables.Assignment.data = JSON.parse(JSON.stringify(this.state.Assignment));

      this.isInitialized = true;
    } catch (err) {
      console.error('AlaSQL initialization error:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToDefault(): DatabaseState {
    this.state = {
      Airlines: [...INITIAL_AIRLINES],
      Airport: [...INITIAL_AIRPORTS],
      Flight: [...INITIAL_FLIGHTS],
      Passenger: [...INITIAL_PASSENGERS],
      Booking: [...INITIAL_BOOKINGS],
      Staff: [...INITIAL_STAFF],
      Assignment: [...INITIAL_ASSIGNMENTS]
    };
    this.persistState();
    this.syncToAlaSQL();
    return this.state;
  }

  // Live SQL Execution
  public executeSQL(query: string): { success: boolean; data?: any[]; error?: string; executionTimeMs: number; affectedRows?: number } {
    const startTime = performance.now();
    try {
      const trimmed = query.trim();
      if (!trimmed) {
        return { success: false, error: 'Empty query', executionTimeMs: 0 };
      }

      // Handle USE statements or comments cleanly
      const cleaned = trimmed
        .replace(/^USE\s+[\w_]+;?/i, '')
        .trim();

      if (!cleaned) {
        return { success: true, data: [{ message: 'Database selected: airport_management_system' }], executionTimeMs: Math.round(performance.now() - startTime) };
      }

      const res = alasql(cleaned);
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

      // If query was an INSERT/UPDATE/DELETE, sync back to this.state
      if (/^(INSERT|UPDATE|DELETE)/i.test(cleaned)) {
        this.syncFromAlaSQL();
        this.persistState();
        return {
          success: true,
          data: Array.isArray(res) ? res : [{ status: 'Query executed successfully' }],
          affectedRows: typeof res === 'number' ? res : 1,
          executionTimeMs
        };
      }

      return {
        success: true,
        data: Array.isArray(res) ? res : [res],
        affectedRows: Array.isArray(res) ? res.length : 1,
        executionTimeMs
      };
    } catch (err: any) {
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        success: false,
        error: err?.message || 'SQL execution failed',
        executionTimeMs
      };
    }
  }

  private syncFromAlaSQL(): void {
    try {
      if (alasql.tables.Airlines) this.state.Airlines = alasql.tables.Airlines.data as Airline[];
      if (alasql.tables.Airport) this.state.Airport = alasql.tables.Airport.data as Airport[];
      if (alasql.tables.Flight) this.state.Flight = alasql.tables.Flight.data as Flight[];
      if (alasql.tables.Passenger) this.state.Passenger = alasql.tables.Passenger.data as Passenger[];
      if (alasql.tables.Booking) this.state.Booking = alasql.tables.Booking.data as Booking[];
      if (alasql.tables.Staff) this.state.Staff = alasql.tables.Staff.data as Staff[];
      if (alasql.tables.Assignment) this.state.Assignment = alasql.tables.Assignment.data as Assignment[];
    } catch (err) {
      console.error('Failed to sync from AlaSQL:', err);
    }
  }

  // CRUD Helpers for UI
  public addFlight(flight: Omit<Flight, 'flight_id'>): Flight {
    const newId = this.state.Flight.reduce((max, f) => Math.max(max, f.flight_id), 0) + 1;
    const newFlight: Flight = { ...flight, flight_id: newId };
    this.state.Flight.unshift(newFlight);
    this.persistState();
    this.syncToAlaSQL();
    return newFlight;
  }

  public updateFlightStatus(flight_id: number, status: Flight['status'], gate?: string): void {
    const flight = this.state.Flight.find(f => f.flight_id === flight_id);
    if (flight) {
      flight.status = status;
      if (gate) flight.gate = gate;
      this.persistState();
      this.syncToAlaSQL();
    }
  }

  public toggleCheckin(booking_id: number): CheckinStatus {
    const booking = this.state.Booking.find(b => b.booking_id === booking_id);
    if (booking) {
      booking.checkin_status = booking.checkin_status === 'Yes' ? 'No' : 'Yes';
      this.persistState();
      this.syncToAlaSQL();
      return booking.checkin_status;
    }
    return 'No';
  }

  public addBooking(booking: Omit<Booking, 'booking_id'>): Booking {
    const newId = this.state.Booking.reduce((max, b) => Math.max(max, b.booking_id), 0) + 1;
    const newBooking: Booking = { ...booking, booking_id: newId };
    this.state.Booking.unshift(newBooking);
    this.persistState();
    this.syncToAlaSQL();
    return newBooking;
  }

  public addPassenger(passenger: Omit<Passenger, 'passenger_id'>): Passenger {
    const newId = this.state.Passenger.reduce((max, p) => Math.max(max, p.passenger_id), 0) + 1;
    const newPassenger: Passenger = { ...passenger, passenger_id: newId };
    this.state.Passenger.push(newPassenger);
    this.persistState();
    this.syncToAlaSQL();
    return newPassenger;
  }

  public addStaff(staff: Omit<Staff, 'staff_id'>): Staff {
    const newId = this.state.Staff.reduce((max, s) => Math.max(max, s.staff_id), 0) + 1;
    const newStaff: Staff = { ...staff, staff_id: newId };
    this.state.Staff.push(newStaff);
    this.persistState();
    this.syncToAlaSQL();
    return newStaff;
  }

  public assignStaffToFlight(flight_id: number, staff_id: number, role?: string): Assignment {
    const existing = this.state.Assignment.find(a => a.flight_id === flight_id && a.staff_id === staff_id);
    if (existing) return existing;

    const newId = this.state.Assignment.reduce((max, a) => Math.max(max, a.assign_id), 0) + 1;
    const newAssign: Assignment = { assign_id: newId, flight_id, staff_id, assigned_role: role };
    this.state.Assignment.push(newAssign);
    this.persistState();
    this.syncToAlaSQL();
    return newAssign;
  }

  public removeAssignment(assign_id: number): void {
    this.state.Assignment = this.state.Assignment.filter(a => a.assign_id !== assign_id);
    this.persistState();
    this.syncToAlaSQL();
  }

  public addAirline(airline: Omit<Airline, 'airline_id'>): Airline {
    const newId = this.state.Airlines.reduce((max, a) => Math.max(max, a.airline_id), 0) + 1;
    const newAirline: Airline = { ...airline, airline_id: newId };
    this.state.Airlines.push(newAirline);
    this.persistState();
    this.syncToAlaSQL();
    return newAirline;
  }

  public addAirport(airport: Omit<Airport, 'airport_id'>): Airport {
    const newId = this.state.Airport.reduce((max, a) => Math.max(max, a.airport_id), 0) + 1;
    const newAirport: Airport = { ...airport, airport_id: newId };
    this.state.Airport.push(newAirport);
    this.persistState();
    this.syncToAlaSQL();
    return newAirport;
  }

  // Full SQL Dump generator
  public generateFullSQLScript(): string {
    const lines: string[] = [];
    lines.push('-- ==============================================================');
    lines.push('-- AIRPORT MANAGEMENT SYSTEM (AMS) - RELATIONAL DATABASE SCHEMA');
    lines.push('-- Standard MySQL / MariaDB / Cloud SQL Compatible Script');
    lines.push('-- Generated on: ' + new Date().toISOString());
    lines.push('-- ==============================================================\n');
    lines.push('CREATE DATABASE IF NOT EXISTS airport_management_system;');
    lines.push('USE airport_management_system;\n');

    lines.push('-- 1. Airlines Table');
    lines.push(`CREATE TABLE Airlines (
    airline_id INT AUTO_INCREMENT PRIMARY KEY,
    airline_name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL
);\n`);

    lines.push('-- 2. Airport Table');
    lines.push(`CREATE TABLE Airport (
    airport_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL
);\n`);

    lines.push('-- 3. Flight Table');
    lines.push(`CREATE TABLE Flight (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_no VARCHAR(10) UNIQUE NOT NULL,
    airline_id INT NOT NULL,
    source_airport INT NOT NULL,
    destination_airport INT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled',
    FOREIGN KEY (airline_id) REFERENCES Airlines(airline_id) ON DELETE CASCADE,
    FOREIGN KEY (source_airport) REFERENCES Airport(airport_id) ON DELETE RESTRICT,
    FOREIGN KEY (destination_airport) REFERENCES Airport(airport_id) ON DELETE RESTRICT
);\n`);

    lines.push('-- 4. Passenger Table');
    lines.push(`CREATE TABLE Passenger (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15),
    passport VARCHAR(20),
    identity_card VARCHAR(20)
);\n`);

    lines.push('-- 5. Booking Table');
    lines.push(`CREATE TABLE Booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    passenger_id INT NOT NULL,
    booking_date DATE NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    checkin_status ENUM('Yes','No') DEFAULT 'No',
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id) ON DELETE CASCADE
);\n`);

    lines.push('-- 6. Staff Table');
    lines.push(`CREATE TABLE Staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    airline_id INT NOT NULL,
    FOREIGN KEY (airline_id) REFERENCES Airlines(airline_id) ON DELETE CASCADE
);\n`);

    lines.push('-- 7. Assignment Table');
    lines.push(`CREATE TABLE Assignment (
    assign_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    staff_id INT NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);\n`);

    lines.push('-- ==============================================================');
    lines.push('-- SEED DATA INSERTION');
    lines.push('-- ==============================================================\n');

    // Airlines inserts
    lines.push('-- Airlines Data');
    this.state.Airlines.forEach(a => {
      lines.push(`INSERT INTO Airlines (airline_id, airline_name, country) VALUES (${a.airline_id}, '${a.airline_name.replace(/'/g, "''")}', '${a.country.replace(/'/g, "''")}');`);
    });
    lines.push('');

    // Airport inserts
    lines.push('-- Airport Data');
    this.state.Airport.forEach(ap => {
      lines.push(`INSERT INTO Airport (airport_id, name, city, country) VALUES (${ap.airport_id}, '${ap.name.replace(/'/g, "''")}', '${ap.city.replace(/'/g, "''")}', '${ap.country.replace(/'/g, "''")}');`);
    });
    lines.push('');

    // Flight inserts
    lines.push('-- Flight Data');
    this.state.Flight.forEach(f => {
      lines.push(`INSERT INTO Flight (flight_id, flight_no, airline_id, source_airport, destination_airport, departure_time, arrival_time, status) VALUES (${f.flight_id}, '${f.flight_no}', ${f.airline_id}, ${f.source_airport}, ${f.destination_airport}, '${f.departure_time.replace('T', ' ')}', '${f.arrival_time.replace('T', ' ')}', '${f.status}');`);
    });
    lines.push('');

    // Passenger inserts
    lines.push('-- Passenger Data');
    this.state.Passenger.forEach(p => {
      lines.push(`INSERT INTO Passenger (passenger_id, name, email, phone_no, passport, identity_card) VALUES (${p.passenger_id}, '${p.name.replace(/'/g, "''")}', '${p.email.replace(/'/g, "''")}', '${p.phone_no}', '${p.passport}', '${p.identity_card}');`);
    });
    lines.push('');

    // Booking inserts
    lines.push('-- Booking Data');
    this.state.Booking.forEach(b => {
      lines.push(`INSERT INTO Booking (booking_id, flight_id, passenger_id, booking_date, ticket_price, checkin_status) VALUES (${b.booking_id}, ${b.flight_id}, ${b.passenger_id}, '${b.booking_date}', ${b.ticket_price.toFixed(2)}, '${b.checkin_status}');`);
    });
    lines.push('');

    // Staff inserts
    lines.push('-- Staff Data');
    this.state.Staff.forEach(s => {
      lines.push(`INSERT INTO Staff (staff_id, name, role, airline_id) VALUES (${s.staff_id}, '${s.name.replace(/'/g, "''")}', '${s.role.replace(/'/g, "''")}', ${s.airline_id});`);
    });
    lines.push('');

    // Assignment inserts
    lines.push('-- Assignment Data');
    this.state.Assignment.forEach(asg => {
      lines.push(`INSERT INTO Assignment (assign_id, flight_id, staff_id) VALUES (${asg.assign_id}, ${asg.flight_id}, ${asg.staff_id});`);
    });
    lines.push('');

    return lines.join('\n');
  }
}

export const dbService = new AirportDatabaseService();
