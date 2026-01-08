// Shared interfaces for the recruitment assistant application
export interface Candidate {
  name: string;
  phone: string;
  status: string;
  position: string;
  interviewDate: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
