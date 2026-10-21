export interface Airline {
  airline_id: number;
  airline_name: string;
  country: string;
  iata_code?: string;
  callsign?: string;
}

export interface Airport {
  airport_id: number;
  name: string;
  city: string;
  country: string;
  iata_code: string;
  timezone?: string;
  lat?: number;
  lng?: number;
}

export type FlightStatus = 
  | 'Scheduled' 
  | 'Boarding' 
  | 'Departed' 
  | 'In Flight' 
  | 'Landed' 
  | 'Delayed' 
  | 'Cancelled';

export interface Flight {
  flight_id: number;
  flight_no: string;
  airline_id: number;
  source_airport: number;
  destination_airport: number;
  departure_time: string; // ISO format
  arrival_time: string;   // ISO format
  status: FlightStatus;
  gate?: string;
  terminal?: string;
  aircraft?: string;
}

export interface Passenger {
  passenger_id: number;
  name: string;
  email: string;
  phone_no: string;
  passport: string;
  identity_card: string;
  nationality?: string;
}

export type CheckinStatus = 'Yes' | 'No';
export type SeatClass = 'Economy' | 'Business' | 'First';

export interface Booking {
  booking_id: number;
  flight_id: number;
  passenger_id: number;
  booking_date: string; // YYYY-MM-DD
  ticket_price: number;
  checkin_status: CheckinStatus;
  seat_number?: string;
  seat_class?: SeatClass;
}

export type StaffRole = 
  | 'Captain' 
  | 'First Officer' 
  | 'Lead Flight Attendant' 
  | 'Cabin Crew' 
  | 'Aircraft Engineer' 
  | 'Ground Operations';

export interface Staff {
  staff_id: number;
  name: string;
  role: StaffRole | string;
  airline_id: number;
  license_number?: string;
  experience_years?: number;
}

export interface Assignment {
  assign_id: number;
  flight_id: number;
  staff_id: number;
  assigned_role?: string;
}

export interface DatabaseState {
  Airlines: Airline[];
  Airport: Airport[];
  Flight: Flight[];
  Passenger: Passenger[];
  Booking: Booking[];
  Staff: Staff[];
  Assignment: Assignment[];
}
