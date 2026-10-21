import React, { useState } from 'react';
import { dbService } from '../services/db';
import { Play, Download, Copy, Check, RefreshCw, Terminal, Sparkles, BookOpen, Clock, AlertCircle } from 'lucide-react';

interface SQLStudioProps {
  onDatabaseMutated: () => void;
}

interface QueryPreset {
  id: string;
  name: string;
  description: string;
  sql: string;
}

const PRESET_QUERIES: QueryPreset[] = [
  {
    id: 'flights_full',
    name: '1. Flights with Airlines & Airport Names',
    description: '3-way JOIN resolving airline name, source airport name, and destination airport name',
    sql: `SELECT 
  f.flight_no,
  a.airline_name,
  src.name AS departure_airport,
  src.city AS departure_city,
  dst.name AS arrival_airport,
  dst.city AS arrival_city,
  f.departure_time,
  f.arrival_time,
  f.status
FROM Flight f
JOIN Airlines a ON f.airline_id = a.airline_id
JOIN Airport src ON f.source_airport = src.airport_id
JOIN Airport dst ON f.destination_airport = dst.airport_id
ORDER BY f.departure_time ASC;`
  },
  {
    id: 'passenger_manifest',
    name: '2. Passenger Manifest & Check-in Status',
    description: 'List all passengers booked on flights with their check-in status and passport',
    sql: `SELECT 
  f.flight_no,
  p.name AS passenger_name,
  p.passport,
  p.email,
  b.ticket_price,
  b.checkin_status
FROM Booking b
JOIN Flight f ON b.flight_id = f.flight_id
JOIN Passenger p ON b.passenger_id = p.passenger_id
ORDER BY f.flight_no, b.checkin_status DESC;`
  },
  {
    id: 'crew_assignment',
    name: '3. Flight Crew Roster & Roles',
    description: 'View all staff assignments to flights showing crew member role and airline',
    sql: `SELECT 
  f.flight_no,
  s.name AS crew_member,
  s.role AS crew_role,
  a.airline_name,
  f.status AS flight_status
FROM Assignment asg
JOIN Flight f ON asg.flight_id = f.flight_id
JOIN Staff s ON asg.staff_id = s.staff_id
JOIN Airlines a ON s.airline_id = a.airline_id
ORDER BY f.flight_no, s.role;`
  },
  {
    id: 'revenue_by_airline',
    name: '4. Revenue & Bookings by Airline',
    description: 'Aggregate total booking revenue and ticket count grouped by airline',
    sql: `SELECT 
  a.airline_name,
  a.country,
  COUNT(b.booking_id) AS total_bookings,
  SUM(b.ticket_price) AS total_revenue,
  ROUND(AVG(b.ticket_price), 2) AS avg_ticket_price
FROM Airlines a
JOIN Flight f ON a.airline_id = f.airline_id
JOIN Booking b ON f.flight_id = b.flight_id
GROUP BY a.airline_name, a.country
ORDER BY total_revenue DESC;`
  },
  {
    id: 'departure_traffic',
    name: '5. Airport Departure Traffic Volume',
    description: 'Counts how many flights originate from each airport',
    sql: `SELECT 
  ap.name AS airport_name,
  ap.city,
  ap.country,
  COUNT(f.flight_id) AS outbound_flights
FROM Airport ap
JOIN Flight f ON ap.airport_id = f.source_airport
GROUP BY ap.name, ap.city, ap.country
ORDER BY outbound_flights DESC;`
  },
  {
    id: 'pending_checkins',
    name: '6. Pending Check-in Alerts',
    description: 'Filter bookings where passengers have not yet checked in',
    sql: `SELECT 
  b.booking_id,
  p.name AS passenger_name,
  p.phone_no,
  f.flight_no,
  f.departure_time,
  b.ticket_price
FROM Booking b
JOIN Passenger p ON b.passenger_id = p.passenger_id
JOIN Flight f ON b.flight_id = f.flight_id
WHERE b.checkin_status = 'No'
ORDER BY f.departure_time ASC;`
  },
  {
    id: 'staff_per_airline',
    name: '7. Staff Headcount by Airline',
    description: 'Count registered crew members per carrier',
    sql: `SELECT 
  a.airline_name,
  COUNT(s.staff_id) AS total_staff
FROM Airlines a
LEFT JOIN Staff s ON a.airline_id = s.airline_id
GROUP BY a.airline_name
ORDER BY total_staff DESC;`
  }
];

export const SQLStudio: React.FC<SQLStudioProps> = ({ onDatabaseMutated }) => {
  const [query, setQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [result, setResult] = useState<{ success: boolean; data?: any[]; error?: string; executionTimeMs: number; affectedRows?: number } | null>(() => {
    return dbService.executeSQL(PRESET_QUERIES[0].sql);
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'full_ddl'>('console');
  const [copiedDump, setCopiedDump] = useState(false);

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = dbService.executeSQL(query);
      setResult(res);
      setIsExecuting(false);
      if (res.success && /^(INSERT|UPDATE|DELETE)/i.test(query.trim())) {
        onDatabaseMutated();
      }
    }, 50);
  };

  const handleLoadPreset = (preset: QueryPreset) => {
    setQuery(preset.sql);
    setIsExecuting(true);
    setTimeout(() => {
      const res = dbService.executeSQL(preset.sql);
      setResult(res);
      setIsExecuting(false);
    }, 50);
  };

  const handleExportCSV = () => {
    if (!result?.data || result.data.length === 0) return;
    const headers = Object.keys(result.data[0]);
    const csvRows = [
      headers.join(','),
      ...result.data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullSQL = () => {
    const fullScript = dbService.generateFullSQLScript();
    const blob = new Blob([fullScript], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airport_management_system.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFullSQL = () => {
    const fullScript = dbService.generateFullSQLScript();
    navigator.clipboard.writeText(fullScript);
    setCopiedDump(true);
    setTimeout(() => setCopiedDump(false), 2000);
  };

  const columns = result?.data && result.data.length > 0 ? Object.keys(result.data[0]) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            Live SQL Studio & Query Workbench
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>In-Memory Relational Engine</span>
            <span aria-hidden="true">·</span>
            <span>ANSI SQL & MySQL Dialect</span>
            <span aria-hidden="true">·</span>
            <span>Live Result Inspection</span>
          </div>
        </div>

        {/* Studio View toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'console' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Query Console
            </button>
            <button
              onClick={() => setActiveTab('full_ddl')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'full_ddl' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full MySQL Schema & DDL
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'console' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Query Presets Drawer */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                Operational SQL Queries
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Click any query preset to load and execute it immediately against the relational database:
              </p>
              <div className="space-y-2">
                {PRESET_QUERIES.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-800/80 hover:border-sky-500/50 bg-slate-950/60 hover:bg-slate-900 transition-all group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: SQL Editor & Output */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Connected: airport_management_system
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuery('SELECT * FROM Flight;')}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleRunQuery}
                    disabled={isExecuting}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    {isExecuting ? 'Executing...' : 'Run Query'}
                  </button>
                </div>
              </div>

              {/* Code text area */}
              <div className="p-3 bg-slate-950">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={8}
                  className="w-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-sky-500/30"
                  placeholder="Enter your SQL query here... (e.g. SELECT * FROM Flight f JOIN Airlines a ON f.airline_id = a.airline_id;)"
                  spellCheck={false}
                />
              </div>

              {/* Execution status footer */}
              {result && (
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Query OK ({result.affectedRows ?? result.data?.length ?? 0} rows)
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Execution Error
                      </span>
                    )}
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 font-mono tabular-nums flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {result.executionTimeMs} ms
                    </span>
                  </div>

                  {result.success && result.data && result.data.length > 0 && (
                    <button
                      onClick={handleExportCSV}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Result Table Container */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Query Results
                </h4>
                {result?.data && (
                  <span className="text-xs text-slate-400 font-mono tabular-nums">
                    {result.data.length} records returned
                  </span>
                )}
              </div>

              {result?.error ? (
                <div className="p-6 text-center text-xs text-rose-400 font-mono bg-rose-950/10">
                  <p className="font-semibold mb-1">SQL Error:</p>
                  <p>{result.error}</p>
                </div>
              ) : !result?.data || result.data.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No records returned or query produced no tabular output.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950 text-slate-300 uppercase font-mono sticky top-0 border-b border-slate-800 z-10">
                      <tr>
                        {columns.map(col => (
                          <th key={col} className="px-3.5 py-2 font-medium tracking-wider whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                      {result.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          {columns.map(col => (
                            <td key={col} className="px-3.5 py-2 whitespace-nowrap tabular-nums text-slate-300">
                              {typeof row[col] === 'number'
                                ? row[col].toLocaleString()
                                : row[col] === null || row[col] === undefined
                                ? <span className="text-slate-600 italic">NULL</span>
                                : String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full DDL View */
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Complete Production SQL Database Script</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full DDL definitions with foreign keys, table constraints, and active database seed inserts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFullSQL}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copiedDump ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDump ? 'Copied to Clipboard' : 'Copy SQL Script'}
              </button>
              <button
                onClick={handleDownloadFullSQL}
                className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download .sql File
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-sky-200/90 leading-relaxed overflow-x-auto max-h-[500px]">
            {dbService.generateFullSQLScript()}
          </pre>
        </div>
      )}
    </div>
  );
};
