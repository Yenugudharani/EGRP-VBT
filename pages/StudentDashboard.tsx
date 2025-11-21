import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { GrievanceType } from '../types';
import { Plus, FileText, Search, X, Upload, Paperclip } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, grievances, addGrievance } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const myGrievances = grievances.filter(g => g.studentId === currentUser?.id);

  // Form State
  const [formData, setFormData] = useState({
    examSession: '',
    examDate: '',
    subjectCode: '',
    subjectName: '',
    type: GrievanceType.REVALUATION,
    description: '',
    attachmentUrl: ''
  });
  
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFileName(e.target.files[0].name);
        // Mocking a URL
        setFormData({ ...formData, attachmentUrl: `mock_docs/${e.target.files[0].name}` });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      addGrievance({
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentRoll: currentUser.rollNumber || 'N/A',
        course: currentUser.course || 'N/A',
        ...formData,
      });
      setIsModalOpen(false);
      // Reset form
      setFormData({
        examSession: '',
        examDate: '',
        subjectCode: '',
        subjectName: '',
        type: GrievanceType.REVALUATION,
        description: '',
        attachmentUrl: ''
      });
      setFileName('');
    }
  };

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div>
             <h3 className="text-lg font-semibold text-gray-800">My Grievances</h3>
             <p className="text-sm text-gray-500">Track status of your requests</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            New Grievance
          </button>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {myGrievances.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
               <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
               <p className="text-gray-500 font-medium">No grievances found.</p>
            </div>
          ) : (
            myGrievances.map(g => (
              <div key={g.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="space-y-2 flex-1">
                     <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">#{g.id}</span>
                        <StatusBadge status={g.status} />
                     </div>
                     <h4 className="text-lg font-bold text-gray-900">{g.subjectName} <span className="font-normal text-gray-500">({g.subjectCode})</span></h4>
                     <div className="text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
                        <p>Type: <span className="font-medium">{g.type}</span></p>
                        <p>Date: <span className="font-medium">{g.examDate}</span></p>
                        <p>Session: <span className="font-medium">{g.examSession}</span></p>
                     </div>
                     <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-2 text-sm border border-gray-100">{g.description}</p>
                     
                     {g.attachmentUrl && (
                        <div className="inline-flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mt-2">
                            <Paperclip size={12} /> Document Attached
                        </div>
                     )}
                  </div>

                  {/* Resolution Section if Resolved */}
                  {(g.status === 'Resolved' || g.status === 'Rejected') && (
                      <div className="bg-green-50 border border-green-100 p-4 rounded-lg md:w-1/3">
                          <h5 className="text-sm font-bold text-green-800 mb-2">Resolution</h5>
                          <p className="text-sm text-green-900 mb-2">{g.finalResolutionNote}</p>
                          {g.finalMarks && (
                              <p className="text-sm font-bold text-green-700">Final Marks: {g.finalMarks}</p>
                          )}
                      </div>
                  )}
                </div>
                
                {/* Timeline (Simplified) */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">History</h5>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {g.history.map((h, idx) => (
                            <div key={h.id} className="flex items-center shrink-0">
                                <div className="text-xs">
                                    <p className="font-medium text-gray-700">{h.status}</p>
                                    <p className="text-gray-400">{new Date(h.timestamp).toLocaleDateString()}</p>
                                </div>
                                {idx < g.history.length - 1 && (
                                    <div className="h-px w-8 bg-gray-300 mx-2"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Grievance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800">Submit New Grievance</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Session</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="e.g. Fall 2024"
                            value={formData.examSession}
                            onChange={e => setFormData({...formData, examSession: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Exam</label>
                        <input 
                            required
                            type="date" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            value={formData.examDate}
                            onChange={e => setFormData({...formData, examDate: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            value={formData.subjectName}
                            onChange={e => setFormData({...formData, subjectName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            value={formData.subjectCode}
                            onChange={e => setFormData({...formData, subjectCode: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grievance Type</label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as GrievanceType})}
                    >
                        {Object.values(GrievanceType).map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                    <textarea 
                        required
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                        placeholder="Please explain your issue clearly..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            id="file-upload" 
                            onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-indigo-400 mb-2" />
                            {fileName ? (
                                <span className="text-indigo-600 font-medium">{fileName}</span>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 font-medium">Click to upload a file</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                        Submit Grievance
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};