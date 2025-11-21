export enum UserRole {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum GrievanceStatus {
  SUBMITTED = 'Submitted',
  ASSIGNED = 'Assigned',
  IN_REVIEW = 'In Review',
  PENDING_APPROVAL = 'Pending Approval',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected',
}

export enum GrievanceType {
  REVALUATION = 'Revaluation',
  RECOUNTING = 'Recounting',
  MISSING_MARKS = 'Missing Marks',
  QP_CORRECTION = 'Question Paper Correction',
  OTHER = 'Other',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, this would be hashed
  role: UserRole;
  status: AccountStatus;
  department?: string; // For Faculty
  rollNumber?: string; // For Student
  course?: string; // For Student
}

export interface WorkflowLog {
  id: string;
  status: GrievanceStatus;
  updatedBy: string; // User Name
  timestamp: string;
  note?: string;
}

export interface Grievance {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  course: string;
  examSession: string;
  examDate: string;
  subjectCode: string;
  subjectName: string;
  type: GrievanceType;
  description: string;
  attachmentUrl?: string;
  status: GrievanceStatus;
  assignedToFacultyId?: string;
  assignedToFacultyName?: string;
  facultyFindings?: string;
  facultyProposedMarks?: number;
  finalResolutionNote?: string;
  finalMarks?: number;
  createdAt: string;
  updatedAt: string;
  history: WorkflowLog[];
}