import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { Grievance, GrievanceStatus } from '../types';
import { ClipboardCheck, Send, FileSearch, Paperclip, CheckCircle } from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { currentUser, grievances, updateGrievanceStatus } = useApp();
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [findings, setFindings] = useState('');
  const [proposedMarks, setProposedMarks] = useState<number>(0);

  const assignedGrievances = grievances.filter(g => g.assignedToFacultyId === currentUser?.id);

  const handleStartReview = (g: Grievance) => {
    updateGrievanceStatus(g.id, GrievanceStatus.IN_REVIEW);
    setSelectedGrievance({ ...g, status: GrievanceStatus.IN_REVIEW });
  };

  const handleSubmitFindings = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGrievance) {
        updateGrievanceStatus(
            selectedGrievance.id, 
            GrievanceStatus.PENDING_APPROVAL, 
            'Review completed, submitted for approval.',
            {
                facultyFindings: findings,
                facultyProposedMarks: proposedMarks || undefined
            }
        );
        setSelectedGrievance(null);
        setFindings('');
        setProposedMarks(0);
    }
  };

  return (
    <Layout title="Faculty Review Dashboard">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* List Column */}
            <div className="lg:col-span-1 space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <ClipboardCheck size={20} /> Assigned Cases ({assignedGrievances.length})
                </h3>
                <div className="space-y-3">
                    {assignedGrievances.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                             <p className="text-gray-400 text-sm">No pending assignments.</p>
                        </div>
                    )}
                    {assignedGrievances.map(g => (
                        <div 
                            key={g.id} 
                            className={`bg-white p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedGrievance?.id === g.id ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : 'border-gray-200'}`}
                            onClick={() => {
                                setSelectedGrievance(g);
                                setFindings(g.facultyFindings || '');
                                setProposedMarks(g.facultyProposedMarks || 0);
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-gray-500">#{g.id}</span>
                                <StatusBadge status={g.status} />
                            </div>
                            <h4 className="font-bold text-gray-800">{g.subjectName}</h4>
                            <p className="text-xs text-gray-500">{g.studentName} • {g.studentRoll}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(g.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Column */}
            <div className="lg:col-span-2">
                {selectedGrievance ? (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedGrievance.subjectName} ({selectedGrievance.subjectCode})</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Student: <span className="font-medium text-gray-900">{selectedGrievance.studentName}</span> ({selectedGrievance.studentRoll})
                                    </p>
                                </div>
                                <StatusBadge status={selectedGrievance.status} />
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase">Issue Description</h4>
                                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                                    {selectedGrievance.description}
                                </p>
                                {selectedGrievance.attachmentUrl && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-indigo-600">
                                        <Paperclip size={16} />
                                        <span className="underline cursor-pointer">Download Student Attachment</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Area */}
                            <div className="pt-6 border-t border-gray-100">
                                {selectedGrievance.status === GrievanceStatus.ASSIGNED && (
                                    <div className="text-center py-6 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <FileSearch className="mx-auto h-12 w-12 text-indigo-300 mb-4" />
                                        <h4 className="text-lg font-bold text-indigo-900 mb-2">Ready to Review?</h4>
                                        <p className="text-indigo-700 mb-6 text-sm max-w-md mx-auto">Starting the review will change the status to 'In Review' and notify the administration.</p>
                                        <button 
                                            onClick={() => handleStartReview(selectedGrievance)}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                        >
                                            Start Review Process
                                        </button>
                                    </div>
                                )}

                                {selectedGrievance.status === GrievanceStatus.IN_REVIEW && (
                                    <form onSubmit={handleSubmitFindings} className="space-y-4 bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                                        <h4 className="font-bold text-yellow-900 flex items-center gap-2">
                                            <Send size={18} /> Submit Findings
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-yellow-800 mb-1">Proposed Marks (if applicable)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full border border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none bg-white"
                                                    value={proposedMarks}
                                                    onChange={e => setProposedMarks(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-yellow-800 mb-1">Reviewer Comments</label>
                                            <textarea 
                                                required
                                                rows={4}
                                                className="w-full border border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none bg-white"
                                                placeholder="Detail your findings here..."
                                                value={findings}
                                                onChange={e => setFindings(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="flex justify-end">
                                            <button type="submit" className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors shadow-sm">
                                                Submit for Approval
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {(selectedGrievance.status === GrievanceStatus.PENDING_APPROVAL || selectedGrievance.status === GrievanceStatus.RESOLVED || selectedGrievance.status === GrievanceStatus.REJECTED) && (
                                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                                        <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
                                        <p className="text-green-800 font-bold text-lg">Review Submitted</p>
                                        <p className="text-sm text-green-600 mt-1">You have successfully submitted your findings for this case.</p>
                                    </div>
                                )}
                            </div>

                            {/* Timeline Context */}
                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Case History</h4>
                                <Timeline history={selectedGrievance.history} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 p-12">
                        <div className="text-center">
                            <FileSearch className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No Case Selected</h3>
                            <p className="text-gray-400 mt-2">Select a grievance from the list to view details and perform actions.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </Layout>
  );
};