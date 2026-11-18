export interface Person {
  id: string;
  name: string;
  role: string;
  branch: string;
  year: string;
  skills: string[];
  interests: string;
  bio: string;
  available: boolean;
  color: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  domain: string;
  roles: string[];
  skills: string[];
  members: string[];
  capacity: number;
  leaderId: string;
  eventId: string;
  status: "Recruiting" | "Closed" | "Archived";
}

export interface Hackathon {
  id: string;
  name: string;
  category: string;
  description: string;
  date: string;
  deadline: string;
  mode: string;
  color: string;
  symbol: string;
}

export interface JoinRequest {
  id: string;
  teamId: string;
  personId: string;
  message: string;
  status: "Pending" | "Accepted" | "Declined" | "Cancelled";
}

export interface Invitation {
  id: string;
  teamId: string;
  status: "Pending" | "Accepted" | "Declined";
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  href: string;
  read: boolean;
}

export interface Report {
  id: string;
  target: string;
  reason: string;
  status: "Open" | "Resolved";
}
