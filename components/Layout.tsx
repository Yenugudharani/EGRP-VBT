import React, { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, School, UserCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  title: string;
}

export const Layout: React.FC<Props> = ({ children, title }) => {
  const { currentUser, logout } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <School className="text-white h-6 w-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">EGRP</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Exam Grievance Redressal Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.role}</p>
            </div>
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                <UserCircle size={20} />
            </div>
            <button 
                onClick={logout}
                className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
            >
                <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} College Administration. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
