import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Grievance, User, GrievanceStatus, WorkflowLog, AccountStatus } from '../types';
import { INITIAL_GRIEVANCES, MOCK_USERS } from '../constants';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  grievances: Grievance[];
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'status'>) => void;
  manageUserStatus: (userId: string, status: AccountStatus) => void;
  addGrievance: (grievanceData: Omit<Grievance, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status'>) => void;
  updateGrievanceStatus: (id: string, newStatus: GrievanceStatus, note?: string, extraData?: Partial<Grievance>) => void;
  assignFaculty: (grievanceId: string, facultyId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [grievances, setGrievances] = useState<Grievance[]>(INITIAL_GRIEVANCES);

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Invalid password.' };
    }

    if (user.status === AccountStatus.PENDING) {
      return { success: false, message: 'Account pending approval by Admin.' };
    }

    if (user.status === AccountStatus.REJECTED) {
      return { success: false, message: 'Account has been rejected.' };
    }

    setCurrentUser(user);
    return { success: true, message: 'Login successful' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerUser = (userData: Omit<User, 'id' | 'status'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      status: AccountStatus.PENDING,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const manageUserStatus = (userId: string, status: AccountStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  const addGrievance = (data: Omit<Grievance, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status'>) => {
    const newGrievance: Grievance = {
      ...data,
      id: `GR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: GrievanceStatus.SUBMITTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{
        id: Math.random().toString(36).substr(2, 9),
        status: GrievanceStatus.SUBMITTED,
        updatedBy: currentUser?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        note: 'Grievance submitted successfully',
      }],
    };
    setGrievances(prev => [newGrievance, ...prev]);
  };

  const updateGrievanceStatus = (id: string, newStatus: GrievanceStatus, note?: string, extraData?: Partial<Grievance>) => {
    setGrievances(prev => prev.map(g => {
      if (g.id !== id) return g;

      const newLog: WorkflowLog = {
        id: Math.random().toString(36).substr(2, 9),
        status: newStatus,
        updatedBy: currentUser?.name || 'System',
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${newStatus}`,
      };

      return {
        ...g,
        ...extraData,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        history: [...g.history, newLog],
      };
    }));
  };

  const assignFaculty = (grievanceId: string, facultyId: string) => {
    const faculty = users.find(u => u.id === facultyId);
    if (!faculty) return;

    updateGrievanceStatus(grievanceId, GrievanceStatus.ASSIGNED, `Assigned to ${faculty.name}`, {
      assignedToFacultyId: faculty.id,
      assignedToFacultyName: faculty.name,
    });
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      users, 
      grievances, 
      login, 
      logout,
      registerUser,
      manageUserStatus, 
      addGrievance, 
      updateGrievanceStatus, 
      assignFaculty 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};