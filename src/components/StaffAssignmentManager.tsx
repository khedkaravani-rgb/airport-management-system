import React, { useState } from 'react';
import { DatabaseState, Staff, StaffRole } from '../types/schema';
import { dbService } from '../services/db';
import { Users, UserPlus, Link as LinkIcon, Trash2, Search, CheckCircle2, AlertCircle, Shield, Award } from 'lucide-react';

interface StaffAssignmentManagerProps {
  dbState: DatabaseState;
  onDatabaseMutated: () => void;
}

export const StaffAssignmentManager: React.FC<StaffAssignmentManagerProps> = ({
  dbState,
  onDatabaseMutated,
}) => {
  const [selectedAirlineId, setSelectedAirlineId] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Flight selector for Assignment Inspector
  const [selectedFlightId, setSelectedFlightId] = useState<number>(dbState.Flight[0]?.flight_id || 1);

  // New staff form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('Captain');
  const [newStaffAirlineId, setNewStaffAirlineId] = useState<number>(dbState.Airlines[0]?.airline_id || 1);
  const [newLicenseNo, setNewLicenseNo] = useState('');
  const [newExperience, setNewExperience] = useState<number>(8);

  // New assignment form state
  const [assignFlightId, setAssignFlightId] = useState<number>(dbState.Flight[0]?.flight_id || 1);
  const [assignStaffId, setAssignStaffId] = useState<number>(dbState.Staff[0]?.staff_id || 1);
  const [assignRole, setAssignRole] = useState<string>('Flight Crew');

  const getAirline = (airlineId: number) => dbState.Airlines.find(a => a.airline_id === airlineId);
  const getFlight = (flightId: number) => dbState.Flight.find(f => f.flight_id === flightId);

  const filteredStaff = dbState.Staff.filter(s => {
    const airline = getAirline(s.airline_id);
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airline?.airline_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAirline = selectedAirlineId === 'All' || s.airline_id === Number(selectedAirlineId);
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;

    return matchesSearch && matchesAirline && matchesRole;
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    dbService.addStaff({
      name: newStaffName.trim(),
      role: newStaffRole,
      airline_id: Number(newStaffAirlineId),
      license_number: newLicenseNo.trim() || undefined,
      experience_years: Number(newExperience)
    });

    onDatabaseMutated();
    setShowAddStaffModal(false);
    setNewStaffName('');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.assignStaffToFlight(Number(assignFlightId), Number(assignStaffId), assignRole);
    onDatabaseMutated();
    setShowAssignModal(false);
  };

  const handleRemoveAssignment = (assignId: number) => {
    dbService.removeAssignment(assignId);
    onDatabaseMutated();
  };

  // Crew assigned to the selected flight in assignment workbench
  const selectedFlight = getFlight(selectedFlightId);
  const currentFlightAssignments = dbState.Assignment.filter(a => a.flight_id === selectedFlightId);
  const hasCaptain = currentFlightAssignments.some(a => {
    const s = dbState.Staff.find(st => st.staff_id === a.staff_id);
    return s?.role === 'Captain';
  });
  const hasFirstOfficer = currentFlightAssignments.some(a => {
    const s = dbState.Staff.find(st => st.staff_id === a.staff_id);
    return s?.role === 'First Officer';
  });
  const hasCabinCrew = currentFlightAssignments.some(a => {
    const s = dbState.Staff.find(st => st.staff_id === a.staff_id);
    return s?.role === 'Cabin Crew' || s?.role === 'Lead Flight Attendant';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Staff Roster & Flight Crew Assignments
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{dbState.Staff.length} Aviation Personnel</span>
            <span aria-hidden="true">·</span>
            <span>{dbState.Assignment.length} Operational Flight Bindings</span>
            <span aria-hidden="true">·</span>
            <span>Junction Table: Assignment (Flight + Staff FKs)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <LinkIcon className="w-4 h-4" />
            Assign Crew to Flight
          </button>
        </div>
      </div>

      {/* Flight Assignment Operations Workbench */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Flight Crew Dispatch Workbench</span>
            <h3 className="text-base font-bold text-slate-100 font-mono mt-0.5">
              Active Roster: {selectedFlight?.flight_no} · {getAirline(selectedFlight?.airline_id || 0)?.airline_name}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 whitespace-nowrap">Select Rotation:</label>
            <select
              value={selectedFlightId}
              onChange={(e) => setSelectedFlightId(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
            >
              {dbState.Flight.map(f => (
                <option key={f.flight_id} value={f.flight_id}>
                  {f.flight_no} ({f.status}) - Dep: {f.departure_time.slice(0, 16)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Crew Minimum Compliance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            hasCaptain ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              {hasCaptain ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>Aircraft Commander (Captain)</span>
            </div>
            <span className="text-[11px] font-mono">{hasCaptain ? 'Compliant' : 'Missing'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            hasFirstOfficer ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              {hasFirstOfficer ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
              <span>First Officer (Co-Pilot)</span>
            </div>
            <span className="text-[11px] font-mono">{hasFirstOfficer ? 'Compliant' : 'Missing'}</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            hasCabinCrew ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              {hasCabinCrew ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-slate-500" />}
              <span>Cabin Crew & Attendants</span>
            </div>
            <span className="text-[11px] font-mono">{hasCabinCrew ? 'Assigned' : 'Optional'}</span>
          </div>
        </div>

        {/* Current Crew List */}
        <div className="space-y-2">
          {currentFlightAssignments.length === 0 ? (
            <div className="p-6 bg-slate-950/50 rounded-lg border border-slate-800/80 text-center text-xs text-slate-500">
              No staff members assigned to this rotation yet. Click &quot;Assign Crew to Flight&quot; to link staff members.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentFlightAssignments.map(asg => {
                const staff = dbState.Staff.find(s => s.staff_id === asg.staff_id);
                const airline = staff ? getAirline(staff.airline_id) : undefined;

                return (
                  <div key={asg.assign_id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between group">
                    <div>
                      <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-sky-400" />
                        {staff?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {staff?.role} · {airline?.airline_name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Role: {asg.assigned_role || 'Flight Operations'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAssignment(asg.assign_id)}
                      title="Unassign from flight"
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, role, or airline..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAirlineId}
              onChange={(e) => setSelectedAirlineId(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Airlines</option>
              {dbState.Airlines.map(a => (
                <option key={a.airline_id} value={a.airline_id}>{a.airline_name}</option>
              ))}
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Roles</option>
              <option value="Captain">Captain</option>
              <option value="First Officer">First Officer</option>
              <option value="Lead Flight Attendant">Lead Flight Attendant</option>
              <option value="Cabin Crew">Cabin Crew</option>
              <option value="Aircraft Engineer">Aircraft Engineer</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Staff ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Airline (FK)</th>
                  <th className="px-4 py-3 font-medium">License / Credential</th>
                  <th className="px-4 py-3 font-medium">Experience</th>
                  <th className="px-4 py-3 font-medium text-right">Quick Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredStaff.map(staff => {
                  const airline = getAirline(staff.airline_id);
                  const isAlreadyAssigned = dbState.Assignment.some(
                    a => a.flight_id === selectedFlightId && a.staff_id === staff.staff_id
                  );

                  return (
                    <tr key={staff.staff_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-400 tabular-nums font-bold">
                        #{staff.staff_id}
                      </td>
                      <td className="px-4 py-3 text-slate-100 font-semibold">
                        {staff.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sky-300">{staff.role}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {airline?.airline_name}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {staff.license_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">
                        {staff.experience_years ? `${staff.experience_years} yrs` : '5+ yrs'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAlreadyAssigned ? (
                          <span className="text-emerald-400 text-[11px] font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Assigned
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              dbService.assignStaffToFlight(selectedFlightId, staff.staff_id, staff.role);
                              onDatabaseMutated();
                            }}
                            className="px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition-colors"
                          >
                            + Assign to {selectedFlight?.flight_no}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-sky-400" />
                  Register Staff Member
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Creates a tuple in the <code className="text-sky-300 font-mono">Staff</code> table.
                </p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Captain Marcus Drake"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Role / Position</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="Captain">Captain</option>
                  <option value="First Officer">First Officer</option>
                  <option value="Lead Flight Attendant">Lead Flight Attendant</option>
                  <option value="Cabin Crew">Cabin Crew</option>
                  <option value="Aircraft Engineer">Aircraft Engineer</option>
                  <option value="Ground Operations">Ground Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Employed By Airline (FK)</label>
                <select
                  value={newStaffAirlineId}
                  onChange={(e) => setNewStaffAirlineId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {dbState.Airlines.map(a => (
                    <option key={a.airline_id} value={a.airline_id}>
                      {a.airline_name} ({a.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ATPL-FAA-1029"
                    value={newLicenseNo}
                    onChange={(e) => setNewLicenseNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={newExperience}
                    onChange={(e) => setNewExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crew Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-sky-400" />
                  Assign Crew to Flight Rotation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Creates an <code className="text-sky-300 font-mono">Assignment</code> tuple linking Flight and Staff.
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Flight (FK)</label>
                <select
                  value={assignFlightId}
                  onChange={(e) => setAssignFlightId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                >
                  {dbState.Flight.map(f => (
                    <option key={f.flight_id} value={f.flight_id}>
                      {f.flight_no} - Dep: {f.departure_time.slice(0, 16)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Staff Member (FK)</label>
                <select
                  value={assignStaffId}
                  onChange={(e) => setAssignStaffId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {dbState.Staff.map(s => (
                    <option key={s.staff_id} value={s.staff_id}>
                      {s.name} ({s.role} · {getAirline(s.airline_id)?.airline_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Operational Duty</label>
                <input
                  type="text"
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  placeholder="e.g. Commander, Co-Pilot, Purser, Lead Flight Attendant"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
