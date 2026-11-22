import type { AccountStatus, ProjectMemberRole, SystemRole } from "@collabryd/database";

export interface AuthenticatedUser {
  userId: number;
  email: string;
  accountStatus: AccountStatus;
  systemRole: SystemRole;
  institution?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: AuthenticatedUser;
      projectRole?: ProjectMemberRole;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
