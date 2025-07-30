

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}

export enum isActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}
export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSOENDED = "SUSPENDED",
}

export interface IUser {
  _id ?: string
  name: string;
  phone: string;
  password: string;
  role?: Role;
  isActive?: isActive;
  isDeleted?: boolean;

}
