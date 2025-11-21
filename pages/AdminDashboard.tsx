import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { Grievance, GrievanceStatus, UserRole, AccountStatus } from '../types';
import { analyzeGrievance } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Users, CheckCircle, Clock, Sparkles, X, Filter, SortAsc, SortDesc, Paperclip, Search, Settings, ToggleRight, UserCheck, UserX, Shield } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { grievances, users, assignFaculty, updateGrievanceStatus, manageUserStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'grievances' | 'users'>('grievances');
  
  // Grievance State
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [facultyId, setFacultyId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [finalMarks, setFinalMarks] = useState<number>(0);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [systemSubmissionsEnabled, setSystemSubmissionsEnabled] = useState(true);

  // Filters & Sort State
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Derived Data
  const facultyMembers = users.filter(u => u.role === UserRole.FACULTY && u.status === AccountStatus.APPROVED);
  const pendingUsers = users.filter(u => u.status === AccountStatus.PENDING);
  const pendingCount = grievances.filter(g => g.status !== GrievanceStatus.RESOLVED && g.status !== GrievanceStatus.REJECTED).length;
  const resolvedCount = grievances.filter(g => g.status === GrievanceStatus.RESOLVED || g.status === GrievanceStatus.REJECTED).length;
  
  const typeData = grievances.reduce((acc: any, g) => {
    acc[g.type] = (acc[g.type] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.keys(typeData).map(key => ({ name: key, value: typeData[key] }));
  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

  // Filtering Logic
  const filteredGrievances = grievances
    .filter(g => {
        const matchesStatus = filterStatus === 'ALL' || g.status === filterStatus;
        const matchesSearch = g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              g.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              g.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleAssign = () => {
    if (selectedGrievance && facultyId) {
      assignFaculty(selectedGrievance.id, facultyId);
      setFacultyId('');
      setSelectedGrievance(null); 
    }
  };

  const handleResolve = (status: GrievanceStatus) => {
    if (selectedGrievance) {
      updateGrievanceStatus(selectedGrievance.id, status, adminNote, {
        finalResolutionNote: adminNote,
        finalMarks: status === GrievanceStatus.RESOLVED ? finalMarks : undefined
      });
      setAdminNote('');
      setFinalMarks(0);
      setSelectedGrievance(null);
    }
  };

  const runAiAnalysis = async () => {
    if (!selectedGrievance) return;
    setIsAnalysing(true);
    const result = await analyzeGrievance(selectedGrievance.description, selectedGrievance.subjectName);
    setAiSummary(result);
    setIsAnalysing(false);
  };

  return (
    <Layout title="Admin Control Center">
      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <button 
            onClick={() => setActiveTab('grievances')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'grievances' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
            Grievance Management
        </button>
        <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
            User Approvals
            {pendingUsers.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingUsers.length}
                </span>
            )}
        </button>
      </div>

      {activeTab === 'grievances' ? (
        <>
            {/* Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24} /></div>
                    <div><p className="text-gray-500 text-xs uppercase font-bold">Total Cases</p><h4 className="text-2xl font-bold">{grievances.length}</h4></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Clock size={24} /></div>
                    <div><p className="text-gray-500 text-xs uppercase font-bold">Pending</p><h4 className="text-2xl font-bold">{pendingCount}</h4></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600"><CheckCircle size={24} /></div>
                    <div><p className="text-gray-500 text-xs uppercase font-bold">Resolved</p><h4 className="text-2xl font-bold">{resolvedCount}</h4></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-32 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Main Management Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[800px]`}>
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-auto">
                            <Search size={18} className="text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search student, subject..." 
                                className="bg-transparent outline-none text-sm w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-2 items-center">
                            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-2">
                                <Filter size={16} className="text-gray-500" />
                                <select 
                                    className="bg-transparent outline-none text-sm text-gray-700 cursor-pointer"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="ALL">All Status</option>
                                    {Object.values(GrievanceStatus).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                                title={sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                            >
                                {sortOrder === 'newest' ? <SortDesc size={18} /> : <SortAsc size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Student</th>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredGrievances.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No grievances match your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGrievances.map(g => (
                                        <tr 
                                            key={g.id} 
                                            className={`transition-colors cursor-pointer ${selectedGrievance?.id === g.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                                            onClick={() => { setSelectedGrievance(g); setAiSummary(''); }}
                                        >
                                            <td className="px-6 py-4 font-mono text-xs">{g.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{g.studentName}</div>
                                                <div className="text-xs text-gray-500">{g.studentRoll}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900">{g.subjectCode}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{g.subjectName}</div>
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={g.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-indigo-600 text-xs font-bold">
                                                    View
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Panel */}
                <div className="lg:col-span-1 space-y-6">
                    {/* System Settings (Mini) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                                <Settings size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">System Submissions</h4>
                                <p className="text-xs text-gray-500">Global Portal Status</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSystemSubmissionsEnabled(!systemSubmissionsEnabled)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${systemSubmissionsEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                            <ToggleRight size={16} /> {systemSubmissionsEnabled ? 'Active' : 'Paused'}
                        </button>
                    </div>

                    {/* Detail View */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg h-[700px] flex flex-col">
                        {selectedGrievance ? (
                            <>
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Grievance Details</h3>
                                        <p className="text-xs text-gray-500">ID: {selectedGrievance.id}</p>
                                    </div>
                                    <button onClick={() => setSelectedGrievance(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"><X size={20}/></button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Basic Info */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <StatusBadge status={selectedGrievance.status} />
                                            <span className="text-xs text-gray-500">{selectedGrievance.examSession}</span>
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-800 leading-tight">{selectedGrievance.subjectName}</h2>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Student Description</p>
                                            <p className="text-sm text-gray-800 leading-relaxed">{selectedGrievance.description}</p>
                                        </div>
                                        
                                        {selectedGrievance.attachmentUrl && (
                                            <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 p-2 rounded border border-indigo-100">
                                                <Paperclip size={16} />
                                                <a href="#" className="hover:underline font-medium">View Attached Document</a>
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Analysis */}
                                    <div className="border-t border-gray-100 pt-4">
                                        {!aiSummary ? (
                                            <button 
                                                onClick={runAiAnalysis}
                                                disabled={isAnalysing}
                                                className="w-full flex justify-center items-center gap-2 text-xs text-white bg-purple-600 hover:bg-purple-700 font-medium px-3 py-2 rounded-lg transition-all shadow-sm disabled:opacity-50"
                                            >
                                                <Sparkles size={14} /> {isAnalysing ? 'Analysing Grievance...' : 'Generate AI Summary & Recommendation'}
                                            </button>
                                        ) : (
                                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg text-xs text-purple-900 border border-purple-100 relative">
                                                <div className="flex items-center gap-1 mb-2 font-bold text-purple-700"><Sparkles size={12}/> AI Analysis</div>
                                                {aiSummary}
                                                <button onClick={() => setAiSummary('')} className="absolute top-2 right-2 text-purple-300 hover:text-purple-600"><X size={12}/></button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Workflow Actions */}
                                    <div className="border-t border-gray-100 pt-4 space-y-4">
                                        <h4 className="text-sm font-bold text-gray-900">Actions</h4>
                                        
                                        {selectedGrievance.status === GrievanceStatus.SUBMITTED && (
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-gray-600">Assign Reviewer</label>
                                                <div className="flex gap-2">
                                                    <select 
                                                        className="flex-1 border border-gray-300 rounded-lg px-2 py-2 bg-white text-sm outline-none"
                                                        value={facultyId}
                                                        onChange={e => setFacultyId(e.target.value)}
                                                    >
                                                        <option value="">Select Faculty...</option>
                                                        {facultyMembers.map(f => (
                                                            <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                                                        ))}
                                                    </select>
                                                    <button 
                                                        onClick={handleAssign}
                                                        disabled={!facultyId}
                                                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                                    >
                                                        Assign
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {selectedGrievance.status === GrievanceStatus.PENDING_APPROVAL && (
                                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 space-y-3">
                                                <div className="flex items-center gap-2 text-yellow-800 font-bold text-sm">
                                                    <CheckCircle size={16} /> Reviewer Findings
                                                </div>
                                                <p className="text-sm text-gray-800 italic bg-white p-2 rounded border border-yellow-100">"{selectedGrievance.facultyFindings}"</p>
                                                
                                                {selectedGrievance.facultyProposedMarks !== undefined && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Proposed Marks:</span>
                                                        <span className="font-bold text-gray-900">{selectedGrievance.facultyProposedMarks}</span>
                                                    </div>
                                                )}

                                                <div className="pt-2 space-y-3 border-t border-yellow-200/50">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Final Marks Update</label>
                                                        <input 
                                                            type="number" 
                                                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                                                            value={finalMarks}
                                                            onChange={e => setFinalMarks(Number(e.target.value))}
                                                            placeholder="Enter final marks..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Resolution Note (Required)</label>
                                                        <textarea 
                                                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                                                            rows={2}
                                                            value={adminNote}
                                                            onChange={e => setAdminNote(e.target.value)}
                                                            placeholder="Explanation for student..."
                                                        ></textarea>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button 
                                                            onClick={() => handleResolve(GrievanceStatus.REJECTED)}
                                                            className="bg-white border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResolve(GrievanceStatus.RESOLVED)}
                                                            disabled={!adminNote}
                                                            className="bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(selectedGrievance.status === GrievanceStatus.ASSIGNED || selectedGrievance.status === GrievanceStatus.IN_REVIEW) && (
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                                                <Clock className="mx-auto h-6 w-6 text-blue-400 mb-2" />
                                                <p className="text-sm text-blue-800 font-medium">Under Faculty Review</p>
                                                <p className="text-xs text-blue-600 mt-1">Assigned to: {selectedGrievance.assignedToFacultyName}</p>
                                            </div>
                                        )}

                                        {(selectedGrievance.status === GrievanceStatus.RESOLVED || selectedGrievance.status === GrievanceStatus.REJECTED) && (
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                                                <CheckCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600 font-medium">Case Closed</p>
                                                <p className="text-xs text-gray-500 mt-1">Resolved by {selectedGrievance.history[selectedGrievance.history.length - 1]?.updatedBy}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline */}
                                    <div className="border-t border-gray-100 pt-4">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4">Activity History</h4>
                                        <Timeline history={selectedGrievance.history} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <Filter className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-600">No Grievance Selected</p>
                                <p className="text-sm mt-1">Select an item from the list to view details and take action.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="text-indigo-600 h-8 w-8" />
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Access Control</h2>
                    <p className="text-sm text-gray-500">Approve or reject new account registrations.</p>
                </div>
            </div>

            {pendingUsers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No pending user approvals.</p>
                    <p className="text-sm text-gray-400">All registered users have been processed.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Details</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pendingUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === UserRole.STUDENT ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {user.role === UserRole.STUDENT ? (
                                            <span>Roll: {user.rollNumber} | Course: {user.course}</span>
                                        ) : (
                                            <span>Dept: {user.department}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => manageUserStatus(user.id, AccountStatus.APPROVED)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                                        >
                                            <UserCheck size={14} /> Approve
                                        </button>
                                        <button 
                                            onClick={() => manageUserStatus(user.id, AccountStatus.REJECTED)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium"
                                        >
                                            <UserX size={14} /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}
    </Layout>
  );
};